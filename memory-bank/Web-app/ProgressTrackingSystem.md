# Progress Tracking System - Technical Documentation

## Огляд системи

Progress Tracking System забезпечує real-time відстеження прогресу обробки URL документації від початкової форми до готового AI chat interface. Система працює через polling API кожні 2 секунди.

## Архітектура системи

```
User Form Input → /api/scrape → Session Creation → Spawn Processes → Progress Updates → /api/progress/[sessionId] → UI Polling
```

## Компоненти системи

### 1. Session Management (`web-app/src/lib/sessionStatus.ts`)

**Призначення**: Utility функції для управління сесіями в in-memory storage

```typescript
interface ProgressStatus {
  sessionId: string;
  status: 'initializing' | 'starting' | 'scraping' | 'indexing' | 'completed' | 'error';
  currentStep: string;
  progress: number; // 0-100
  message: string;
  error?: string;
  chatUrl?: string; // Генерується при завершенні
  url?: string;
  collectionName?: string;
}
```

**Ключові функції**:

- `updateSessionStatus(sessionId: string, update: Partial<ProgressStatus>)` - Оновлює статус сесії
- `getSessionStatus(sessionId: string): ProgressStatus | null` - Отримує поточний статус
- `removeSessionStatus(sessionId: string)` - Видаляє сесію (cleanup)

**In-Memory Storage**:
```typescript
const sessionStorage = new Map<string, ProgressStatus>();

// Automatic cleanup старих сесій
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [sessionId, status] of sessionStorage.entries()) {
    if (status.status === 'completed' && /* created before oneHourAgo */) {
      sessionStorage.delete(sessionId);
    }
  }
}, 15 * 60 * 1000); // Кожні 15 хвилин
```

### 2. Path Resolution System (`web-app/src/lib/paths.ts`)

**Призначення**: Robust path resolution для знаходження compiled files

**Ключові функції**:
- `getProjectRoot()` - Повертає абсолютний шлях до root проекту (на рівень вище web-app/)
- `getScraperPath()` - Шлях до скомпільованого scraper (`dist/index.js`)
- `getRagIndexerPath()` - Шлях до RAG indexer (`dist/rag/cli/indexDocuments.js`)
- `getScrapedDocsPath(collectionName: string)` - Шлях до output директорії
- `validatePaths()` - Перевіряє що всі необхідні файли існують

**Validation Example**:
```typescript
const pathValidation = validatePaths();
if (!pathValidation.valid) {
  return NextResponse.json({
    error: 'System not ready. Please build the project first.',
    details: pathValidation.errors
  }, { status: 500 });
}
```

### 3. Main API Endpoint (`web-app/src/app/api/scrape/route.ts`)

**Endpoint**: `POST /api/scrape`

**Request Body**:
```typescript
interface ScrapeRequest {
  url: string;
  collectionName?: string; // Optional, автогенерується якщо не вказано
}
```

**Response**:
```typescript
interface ScrapeResponse {
  success: boolean;
  sessionId: string;
  collectionName: string;
  message: string;
  error?: string;
}
```

**Process Flow**:

1. **Validation**:
   ```typescript
   // URL validation
   try {
     new URL(url);
   } catch {
     return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
   }
   
   // System readiness check
   const pathValidation = validatePaths();
   ```

2. **Session Creation**:
   ```typescript
   const sessionId = generateSessionId(url); // timestamp + URL hash
   const finalCollectionName = collectionName || generateCollectionName(url);
   
   // Initialize session status
   updateSessionStatus(sessionId, {
     sessionId,
     status: 'starting',
     currentStep: 'initializing',
     progress: 10,
     message: 'Ініціалізуємо процес скрапінгу...',
     url,
     collectionName: finalCollectionName
   });
   ```

3. **Asynchronous Processing**:
   ```typescript
   // Start the scraping process asynchronously (non-blocking)
   startScrapingProcess(url, finalCollectionName, sessionId);
   
   // Return immediate response
   return NextResponse.json({
     success: true,
     sessionId,
     collectionName: finalCollectionName,
     message: 'Scraping process started. Use session ID to track progress.'
   });
   ```

### 4. Process Management (`startScrapingProcess` function)

**Two-Stage Process**:

**Stage 1: Document Scraping**
```typescript
const scraperChild = spawn('node', [
  scraperPath,
  url,
  '--output', outputPath,
  '--format', 'markdown',
  '--verbose'
], {
  cwd: projectRoot,
  stdio: 'pipe'
});

// Progress tracking через stdout parsing
scraperChild.stdout?.on('data', (data) => {
  const output = data.toString();
  
  if (output.includes('Starting scrape')) {
    updateSessionStatus(sessionId, {
      status: 'scraping',
      progress: 30,
      message: 'Запускаємо scraper...'
    });
  } else if (output.includes('Found') && output.includes('URLs')) {
    updateSessionStatus(sessionId, {
      status: 'scraping', 
      progress: 40,
      message: 'Знайшли сторінки для скрапінгу...'
    });
  }
});
```

**Stage 2: RAG Indexing** (запускається автоматично після успішного scraping)
```typescript
scraperChild.on('close', (code) => {
  if (code === 0) {
    // Success - start RAG indexing
    updateSessionStatus(sessionId, {
      status: 'indexing',
      currentStep: 'indexing', 
      progress: 75,
      message: 'Створюємо AI індекс для швидкого пошуку...'
    });

    const ragChild = spawn('node', [ragIndexPath, outputPath], {
      cwd: projectRoot,
      stdio: 'pipe',
      env: {
        ...process.env,
        COLLECTION_NAME: collectionName // Dynamic collection switching
      }
    });
    
    ragChild.on('close', (ragCode) => {
      if (ragCode === 0) {
        // Complete success
        const chatUrl = `/demo/${sessionId}`;
        updateSessionStatus(sessionId, {
          status: 'completed',
          currentStep: 'completed',
          progress: 100,
          message: 'AI-помічник готовий до роботи!',
          chatUrl
        });
      }
    });
  }
});
```

### 5. Progress API Endpoint (`web-app/src/app/api/progress/[sessionId]/route.ts`)

**Endpoint**: `GET /api/progress/[sessionId]`

**Next.js 15 Async Params**:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params; // Next.js 15 requires await
  
  const status = getSessionStatus(sessionId);
  
  if (!status) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(status);
}
```

### 6. Frontend Progress Tracking (`web-app/src/components/layout/ProcessingModal.tsx`)

**State Management**:
```typescript
const [progress, setProgress] = useState<ProgressStatus | null>(null);
const [isPolling, setIsPolling] = useState(false);

useEffect(() => {
  if (!sessionId || !isPolling) return;

  const pollProgress = async () => {
    try {
      const response = await fetch(`/api/progress/${sessionId}`);
      if (response.ok) {
        const data: ProgressStatus = await response.json();
        setProgress(data);
        
        // Stop polling when completed or error
        if (data.status === 'completed' || data.status === 'error') {
          setIsPolling(false);
          
          if (data.status === 'completed' && data.chatUrl) {
            // Redirect to demo page after small delay
            setTimeout(() => {
              window.location.href = data.chatUrl;
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  // Start polling every 2 seconds
  const interval = setInterval(pollProgress, 2000);
  pollProgress(); // Initial call

  return () => clearInterval(interval);
}, [sessionId, isPolling]);
```

**Progress Visualization**:
```typescript
const getProgressColor = () => {
  if (!progress) return 'bg-blue-600';
  
  switch (progress.status) {
    case 'error': return 'bg-red-500';
    case 'completed': return 'bg-green-500'; 
    default: return 'bg-blue-600';
  }
};

// Progress bar component
<div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
  <div 
    className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor()}`}
    style={{ width: `${progress?.progress || 0}%` }}
  ></div>
</div>
```

## Data Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Form     │───▶│  /api/scrape    │───▶│ Session Storage │
│   URL Input     │    │  POST Request   │    │   (In-Memory)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        ▲
                                ▼                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ ProcessingModal │◀───│spawn() Processes│───▶│updateSessionStatus│
│   Polling UI    │    │ scraper → RAG   │    │   Function      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              ▲
         ▼                                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│/api/progress/   │───▶│getSessionStatus │───▶│   Progress      │
│[sessionId]      │    │   Function      │    │   Updates       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## SessionID Generation

```typescript
function generateSessionId(url: string): string {
  const timestamp = Date.now();
  const urlHash = url.replace(/[^\w]/g, '').slice(-8); // Last 8 alphanumeric chars
  return `${timestamp}-${urlHash}`;
}

// Example: "1748685222923-gstarted" for "https://docs.astro.build/en/getting-started/"
```

## Collection Name Generation

```typescript
function generateCollectionName(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace(/^www\./, '');
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    const name = pathParts.length > 0 
      ? `${domain}-${pathParts[0]}`  // "astro.build-en"
      : domain;                      // "astro.build"
    
    // ChromaDB compatible: alphanumeric + hyphens only
    return name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  } catch {
    return 'custom-docs';
  }
}
```

## Error Handling Patterns

### API Level
```typescript
try {
  const body: ScrapeRequest = await request.json();
  // ... processing
} catch (error: unknown) {
  console.error('POST /api/scrape error:', error);
  return NextResponse.json({
    success: false,
    error: 'Internal server error',
    details: error instanceof Error ? error.message : 'Unknown error'
  }, { status: 500 });
}
```

### Process Level
```typescript
scraperChild.on('error', (error) => {
  console.error(`[${sessionId}] Scraper error:`, error);
  updateSessionStatus(sessionId, {
    status: 'error',
    progress: 25,
    message: 'Помилка під час запуску scraper',
    error: error.message
  });
});

scraperChild.on('close', (code) => {
  if (code !== 0) {
    console.error(`[${sessionId}] ❌ Scraping failed with code ${code}`);
    updateSessionStatus(sessionId, {
      status: 'error',
      progress: 25,
      message: 'Помилка під час скрапінгу документації',
      error: `Scraper failed with exit code ${code}`
    });
  }
});
```

### Frontend Level
```typescript
const pollProgress = async () => {
  try {
    const response = await fetch(`/api/progress/${sessionId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data: ProgressStatus = await response.json();
    setProgress(data);
  } catch (error) {
    console.error('Progress polling failed:', error);
    // Continue polling - temporary network issues shouldn't stop tracking
  }
};
```

## Environment Variables

**Required for proper operation**:
```bash
# ChromaDB connection
CHROMA_HOST=localhost
CHROMA_PORT=8000

# RAG API
RAG_SERVER_PORT=8001

# Dynamic collection switching
COLLECTION_NAME=dynamic-per-session  # Set via spawn env
```

## Progress States Flow

```
initializing (10%) 
    ↓
starting (10%)
    ↓  
scraping (25% → 60%)
    ↓
indexing (75%)
    ↓
completed (100%) → redirect to /demo/[sessionId]
    │
    └─ error (any%) → show error message
```

## Performance Considerations

### In-Memory Storage Limitations
- **Current**: Map-based storage, lost on server restart
- **Production TODO**: Replace with Redis/Database for persistence
- **Cleanup**: Automatic removal of completed sessions after 1 hour

### Polling Frequency
- **Current**: 2-second intervals
- **Reasoning**: Balance between responsiveness and server load
- **Future**: Consider Server-Sent Events (SSE) for real-time updates

### Process Management
- **Isolation**: Each scraping job runs in separate spawn process
- **Resource**: No concurrent limit (handled by rate limiting in scraper)
- **Cleanup**: Processes auto-terminate, but no explicit kill on user disconnect

## Testing Commands

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://docs.astro.build/en/getting-started/"}'

# Check progress (replace sessionId)
curl http://localhost:3000/api/progress/1748685222923-gstarted

# Monitor logs
tail -f logs/scraper.log  # If logging to file
```

## Common Issues & Solutions

### 1. "Session not found" errors
**Причина**: In-memory storage cleared або неправильний sessionId
**Рішення**: Restart process, check sessionId format

### 2. Process spawn failures  
**Причина**: Compiled files не існують (dist/index.js)
**Рішення**: Run `npm run build` in project root

### 3. Path resolution errors
**Причина**: Working directory не відповідає очікуваному
**Рішення**: Check `getProjectRoot()` output, ensure proper web-app structure

### 4. Polling stops working
**Причина**: JavaScript errors або network issues
**Рішення**: Check browser console, verify API endpoint availability

## Future Enhancements

1. **Persistent Storage**: Replace Map with Redis/PostgreSQL
2. **WebSocket/SSE**: Real-time updates замість polling  
3. **Process Queue**: Limit concurrent scraping jobs
4. **Better Errors**: More specific error codes та recovery options
5. **Progress Details**: More granular progress updates (page count, etc.)
6. **Cancellation**: Ability to cancel running jobs
7. **Retry Logic**: Automatic retry for failed jobs

---

**Last Updated**: 31.05.2025  
**Status**: Production Ready (with in-memory storage limitation)  
**Dependencies**: Next.js 15, Node.js spawn, TypeScript 