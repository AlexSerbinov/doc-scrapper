# System Patterns - Doc Scrapper

## Архітектурні принципи
- **Модульність**: Окремі компоненти для різних етапів скрапінгу
- **Розширюваність**: Plugin система для різних типів сайтів
- **Відмовостійкість**: Graceful degradation при помилках
- **Оптимізація**: Rate limiting та параллельні запити

## Ключові компоненти

### 1. URL Discovery Engine
```
UrlDiscoverer
├── SitemapParser - парсинг sitemap.xml
├── NavigationAnalyzer - аналіз меню навігації  
├── LinkCrawler - пошук пов'язаних посилань
└── RobotsTxtChecker - перевірка дозволів
```

### 2. Content Extractor
```
ContentExtractor
├── DOMAnalyzer - аналіз структури сторінки
├── ContentFilter - фільтрація корисного контенту
├── MetadataExtractor - витяг метаданих
└── TextCleaner - очищення та нормалізація тексту
```

### 3. Storage Engine
```
StorageEngine
├── MarkdownFormatter - конвертація в Markdown
├── JSONStructurer - структурування в JSON
├── FileManager - управління файлами
└── DatabaseConnector - зв'язок з БД (опціонально)
```

### 4. Processing Pipeline
```
Pipeline
├── RateLimiter - обмеження швидкості запитів
├── RetryHandler - повторні спроби при помилках
├── ProgressTracker - відстеження прогресу
└── ResultValidator - валідація результатів
```

## Патерни проєктування

### Strategy Pattern
Різні стратегії для різних типів сайтів:
- GitBook strategy
- Gitiles strategy  
- Custom documentation strategy
- API reference strategy

### Observer Pattern
Підписка на події обробки:
- Page scraped
- Error occurred
- Progress updated
- Completion

### Chain of Responsibility
Послідовна обробка контенту:
1. URL validation
2. Content extraction
3. Content cleaning
4. Format conversion
5. Storage

## Технічна архітектура

### Core Classes
```typescript
interface Scraper {
  scrape(url: string, options: ScrapingOptions): Promise<ScrapingResult>
}

interface ContentExtractor {
  extract(html: string): ExtractedContent
}

interface StorageAdapter {
  save(content: ProcessedContent): Promise<void>
}
```

### Configuration System
```typescript
interface ScrapingConfig {
  baseUrl: string
  outputFormat: 'markdown' | 'json' | 'html'
  maxConcurrency: number
  rateLimitMs: number
  selectors: ContentSelectors
  excludePatterns: string[]
}
```

## Взаємозв'язки компонентів
1. **Scraper** координує весь процес
2. **UrlDiscoverer** знаходить всі релевантні URL
3. **ContentExtractor** витягує корисний контент
4. **ProcessingPipeline** обробляє та структурує дані
5. **StorageEngine** зберігає результати

## Принципи обробки помилок
- Retry з експоненційним backoff
- Логування всіх помилок з контекстом
- Graceful degradation при недоступності окремих сторінок
- Checkpoint система для відновлення процесу 

# Архітектурні патерни системи

## Основна архітектура

### Модульна система
```
doc-scrapper/
├── src/                    # Core RAG система (Node.js/TypeScript)
│   ├── rag/               # AI та векторний пошук
│   ├── extractors/        # Веб скрапінг
│   └── storage/           # Файлова система
└── web-app/               # Веб інтерфейс (Next.js)
    ├── src/app/           # App Router pages та API
    ├── src/components/    # React компоненти
    └── src/lib/           # Клієнтські утиліти
```

### Розділення відповідальностей
- **Core система**: Скрапінг, індексування, AI pipeline
- **Веб-додаток**: UI, користувацький досвід, API wrapper
- **ChromaDB**: Централізована векторна база даних

## RAG System Patterns

### Pipeline Architecture
```typescript
interface RAGPipeline {
  // Chunking: Document → Semantic chunks
  // Embedding: Chunks → Vector representations  
  // Storage: Vectors → ChromaDB
  // Retrieval: Query → Relevant chunks
  // Generation: Context + Query → AI response
}
```

### Dependency Injection
- `EmbeddingService`: OpenAI embeddings
- `VectorStore`: ChromaDB operations
- `LLMService`: GPT-4o-mini generation
- Легка заміна компонентів для тестування

### Error Resilience
- Retry logic з exponential backoff
- Graceful degradation при API failures
- Checkpoint система для довгих операцій

## Web App Patterns

### Next.js 15 App Router
```typescript
// API Route pattern
export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const ragClient = RAGClient.getInstance();
  const response = await ragClient.query(message);
  return NextResponse.json(response);
}
```

### Singleton Pattern для RAG Client
```typescript
export class RAGClient {
  private static instance: RAGClient;
  
  public static getInstance(): RAGClient {
    if (!RAGClient.instance) {
      RAGClient.instance = new RAGClient();
    }
    return RAGClient.instance;
  }
}
```

### Component Composition
```typescript
// Композиція замість великих монолітних компонентів
<ChatInterface>
  <MessageList>
    <MessageBubble />
    <SourceCard />
  </MessageList>
  <QueryInput />
</ChatInterface>
```

## UI/UX Patterns

### Progressive Enhancement
1. **Static content** завантажується першим
2. **Interactive features** додаються поступово
3. **AI responses** працюють асинхронно

### Responsive Design System
```typescript
// Tailwind breakpoints
sm: '640px',   // Mobile
md: '768px',   // Tablet  
lg: '1024px',  // Desktop
xl: '1280px'   // Large screens
```

### Loading States
- Skeleton loaders для карток
- Typing indicators для чату
- Spinner для API calls
- Progress bars для довгих операцій

## Data Flow Patterns

### Unidirectional Data Flow
```
User Input → API Route → RAG Client → ChromaDB → LLM → Response → UI Update
```

### State Management
- React `useState` для local component state
- Server state через API calls
- No global state management (Redux/Zustand) поки не потрібно

### Streaming Response Pattern
```typescript
// Майбутня імплементація
async function* streamResponse(query: string) {
  const chunks = await ragSystem.query(query);
  for await (const chunk of llm.generateStream(chunks)) {
    yield { content: chunk, isComplete: false };
  }
  yield { content: '', isComplete: true };
}
```

## Security Patterns

### Input Validation
```typescript
// API route input sanitization
if (!message || typeof message !== 'string') {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}
```

### Rate Limiting (планується)
- Per-IP request limits
- Exponential backoff для повторних запитів
- CORS configuration

### Environment Variables
```typescript
// Secure API key management
const openaiKey = process.env.OPENAI_API_KEY;
const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
```

## Performance Patterns

### Lazy Loading
- Компоненти завантажуються за потребою
- Code splitting на route level
- Dynamic imports для великих бібліотек

### Caching Strategy
```typescript
// Client-side caching для stats
const [stats, setStats] = useState<RAGStats | null>(null);
useEffect(() => {
  // Cache на 5 хвилин
  if (Date.now() - lastFetch > 5 * 60 * 1000) {
    fetchStats();
  }
}, []);
```

### Database Connection Pooling
- ChromaDB client reuse
- Connection timeout handling
- Concurrent request limits

## Testing Patterns

### Mock System Architecture ⭐ НОВИЙ ПАТЕРН
**Проблема**: Складність інтеграції між Next.js та Node.js RAG системою

**Рішення**: Incremental development через mock layer
```typescript
// Production-like interface з mock implementation
class RAGClient {
  async query(message: string): Promise<ChatResponse> {
    if (process.env.NODE_ENV === 'development') {
      return this.mockQuery(message);  // Заглушка для розробки
    }
    return this.realQuery(message);    // Справжня RAG система
  }
}
```

**Переваги**:
- Швидкий прототип UI без чекання на backend
- Ізольоване тестування компонентів
- Демонстрація UX перед повною інтеграцією

### Component Testing
```typescript
// Тестування окремих UI частин
test('MessageBubble renders sources correctly', () => {
  const mockMessage = { content: 'Test', sources: [...] };
  render(<MessageBubble message={mockMessage} />);
  expect(screen.getByText('Джерела:')).toBeInTheDocument();
});
```

### Integration Testing Strategy
1. **Unit tests**: Окремі функції та компоненти
2. **API tests**: Routes з mock RAG responses  
3. **E2E tests**: Повний user flow (після RAG інтеграції)

## Deployment Patterns

### Multi-Environment Setup
```
Development: localhost:3333 + localhost:8000 (ChromaDB)
Staging: Vercel preview + hosted ChromaDB
Production: Vercel + persistent vector storage
```

### Static Generation
- Hero та info сторінки можуть бути pre-rendered
- Chat interface потребує client-side rendering
- API routes працюють на edge runtime

## Future Architecture Considerations

### Microservices Potential
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Web UI    │    │  RAG API    │    │  ChromaDB   │
│  (Next.js)  │───▶│ (Express?)  │───▶│ (Separate)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Scaling Patterns
- Horizontal scaling для RAG API
- CDN для static assets
- Database sharding для великих datasets
- Vector search optimization

**Поточний стан**: Монолітна архітектура з двома окремими додатками (CLI + Web) працює добре для MVP та демонстрації можливостей. 