// Mock CLI output data для тестування
export const mockScraperOutputs = {
  // Початкова статистика
  scrapingStats: `[2025-01-31T10:00:05.123Z] 📊 SCRAPING_STATS: {"urlsFound": 487, "urlsTotal": 487, "concurrency": 5, "rateLimitMs": 1000}`,
  
  // Прогрес обробки
  scrapingProgress: [
    `[2025-01-31T10:00:15.456Z] 🔄 SCRAPING_PROGRESS: {"current": 25, "total": 487, "percentage": 5, "currentUrl": "https://docs.example.com/getting-started", "status": "success"}`,
    `[2025-01-31T10:00:30.789Z] 🔄 SCRAPING_PROGRESS: {"current": 100, "total": 487, "percentage": 21, "currentUrl": "https://docs.example.com/installation", "status": "success"}`,
    `[2025-01-31T10:01:00.111Z] 🔄 SCRAPING_PROGRESS: {"current": 250, "total": 487, "percentage": 51, "currentUrl": "https://docs.example.com/configuration", "status": "success"}`,
    `[2025-01-31T10:01:30.222Z] 🔄 SCRAPING_PROGRESS: {"current": 400, "total": 487, "percentage": 82, "currentUrl": "https://docs.example.com/deployment", "status": "success"}`,
    `[2025-01-31T10:02:00.333Z] 🔄 SCRAPING_PROGRESS: {"current": 487, "total": 487, "percentage": 100, "currentUrl": "https://docs.example.com/troubleshooting", "status": "success"}`
  ],
  
  // Завершення скрапінгу
  scrapingComplete: `[2025-01-31T10:02:05.444Z] ✅ SCRAPING_COMPLETE: {"successfulPages": 487, "failedPages": 0, "totalBytes": 2048000}`,
  
  // Помилки скрапінгу
  scrapingErrors: [
    `[2025-01-31T10:00:45.555Z] ❌ Error fetching https://docs.example.com/broken-page: Network timeout`,
    `[2025-01-31T10:01:15.666Z] ❌ Failed to parse https://docs.example.com/invalid-html: Invalid HTML structure`
  ],
  
  // Legacy формат для backwards compatibility
  legacyOutput: [
    `[2025-01-31T10:00:08.777Z] Found 487 URLs to scrape`,
    `[2025-01-31T10:00:12.888Z] Starting scrape of https://docs.example.com`,
    `[2025-01-31T10:00:20.999Z] Processing page 50/487: https://docs.example.com/guides`
  ]
};

export const mockRAGOutputs = {
  // Завантаження документів
  loadingDocuments: `[2025-01-31T10:02:10.111Z] 📄 RAG_PROGRESS: {"stage": "loading", "progress": 76, "message": "Loading documents", "documentsProcessed": 0, "totalDocuments": 488}`,
  
  // Створення chunks
  chunkingProgress: [
    `[2025-01-31T10:02:20.222Z] 🧩 RAG_PROGRESS: {"stage": "chunking", "progress": 78, "message": "Creating semantic chunks: 20%", "documentsProcessed": 100, "totalDocuments": 488}`,
    `[2025-01-31T10:02:35.333Z] 🧩 RAG_PROGRESS: {"stage": "chunking", "progress": 82, "message": "Creating semantic chunks: 60%", "documentsProcessed": 300, "totalDocuments": 488}`,
    `[2025-01-31T10:02:50.444Z] 🧩 RAG_PROGRESS: {"stage": "chunking", "progress": 84, "message": "Creating semantic chunks: 100%", "documentsProcessed": 488, "totalDocuments": 488}`
  ],
  
  // Генерація embeddings
  embeddingProgress: [
    `[2025-01-31T10:03:00.555Z] ⚡ RAG_PROGRESS: {"stage": "embedding", "progress": 85, "message": "Generating embeddings: 500/3179", "documentsProcessed": 488, "totalDocuments": 488}`,
    `[2025-01-31T10:03:30.666Z] ⚡ RAG_PROGRESS: {"stage": "embedding", "progress": 90, "message": "Generating embeddings: 1500/3179", "documentsProcessed": 488, "totalDocuments": 488}`,
    `[2025-01-31T10:04:00.777Z] ⚡ RAG_PROGRESS: {"stage": "embedding", "progress": 95, "message": "Generating embeddings: 2800/3179", "documentsProcessed": 488, "totalDocuments": 488}`,
    `[2025-01-31T10:04:15.888Z] ⚡ RAG_PROGRESS: {"stage": "embedding", "progress": 98, "message": "Generating embeddings: 3179/3179", "documentsProcessed": 488, "totalDocuments": 488}`
  ],
  
  // Індексація в базу даних
  indexingProgress: [
    `[2025-01-31T10:04:20.999Z] 🔗 RAG_PROGRESS: {"stage": "indexing", "progress": 95, "message": "Indexing chunks: 1000/3179", "documentsProcessed": 488, "totalDocuments": 488}`,
    `[2025-01-31T10:04:40.111Z] 🔗 RAG_PROGRESS: {"stage": "indexing", "progress": 97, "message": "Indexing chunks: 2500/3179", "documentsProcessed": 488, "totalDocuments": 488}`,
    `[2025-01-31T10:04:55.222Z] 🔗 RAG_PROGRESS: {"stage": "indexing", "progress": 99, "message": "Indexing chunks: 3179/3179", "documentsProcessed": 488, "totalDocuments": 488}`
  ],
  
  // Завершення RAG індексації
  ragComplete: `[2025-01-31T10:05:00.333Z] ✅ RAG_COMPLETE: {"chunksIndexed": 3179, "embeddingsGenerated": 3179, "totalTime": 170}`,
  
  // Legacy RAG output
  legacyRAGOutput: [
    `[2025-01-31T10:02:12.444Z] Loaded 488 documents for indexing`,
    `[2025-01-31T10:02:45.555Z] Created 3179 chunks with average size: 245 tokens`,
    `[2025-01-31T10:04:30.666Z] Average chunk size: 245 tokens`
  ]
};

// Комплексні scenarios для тестування
export const testScenarios = {
  // Успішний повний цикл
  successfulFlow: {
    name: 'Successful scraping and indexing flow',
    url: 'https://docs.example.com',
    collectionName: 'example-docs',
    expectedSessionId: /^\d{13}-example$/,
    stages: [
      { status: 'starting', minProgress: 10, maxProgress: 25 },
      { status: 'scraping', minProgress: 25, maxProgress: 74 },
      { status: 'indexing', minProgress: 76, maxProgress: 99 },
      { status: 'completed', minProgress: 100, maxProgress: 100 }
    ]
  },
  
  // Помилка під час скрапінгу
  scrapingError: {
    name: 'Scraping fails with network error',
    url: 'https://unreachable.example.com',
    error: 'Network timeout',
    expectedStatus: 'error',
    maxProgress: 30
  },
  
  // Помилка під час індексації
  indexingError: {
    name: 'RAG indexing fails',
    url: 'https://docs.example.com',
    scrapingSuccess: true,
    indexingError: 'ChromaDB connection failed',
    expectedStatus: 'error',
    maxProgress: 85
  },
  
  // Великий сайт з багатьма сторінками
  largeSite: {
    name: 'Large documentation site (2000+ pages)',
    url: 'https://large-docs.example.com',
    expectedStats: {
      urlsFound: 2156,
      urlsTotal: 2156,
      documentsTotal: 2156,
      chunksTotal: 12480
    }
  }
};

// Mock API responses
export const mockApiResponses = {
  // Відповідь POST /api/scrape
  scrapeSuccess: {
    success: true,
    sessionId: '1706697600000-example',
    collectionName: 'example-docs',
    message: 'Scraping process started. Use session ID to track progress.'
  },
  
  scrapeError: {
    success: false,
    sessionId: '',
    collectionName: '',
    message: 'Invalid URL format',
    error: 'Invalid URL format'
  },
  
  // Відповіді GET /api/progress/[sessionId]
  progressResponses: {
    starting: {
      sessionId: '1706697600000-example',
      status: 'starting',
      currentStep: 'initializing',
      progress: 10,
      message: 'Ініціалізуємо процес скрапінгу...',
      url: 'https://docs.example.com',
      collectionName: 'example-docs',
      statistics: {
        startTime: '2025-01-31T10:00:00.000Z',
        elapsedTime: 5,
        urlsFound: 0,
        urlsProcessed: 0,
        urlsTotal: 0
      }
    },
    
    scraping: {
      sessionId: '1706697600000-example',
      status: 'scraping',
      currentStep: 'processing',
      progress: 45,
      message: 'Скрапимо контент: 250/487 сторінок (51%)',
      url: 'https://docs.example.com',
      collectionName: 'example-docs',
      statistics: {
        startTime: '2025-01-31T10:00:00.000Z',
        elapsedTime: 50,
        urlsFound: 487,
        urlsProcessed: 250,
        urlsTotal: 487,
        currentUrl: 'https://docs.example.com/configuration',
        scrapingRate: 5.0,
        estimatedTimeRemaining: 47,
        successfulPages: 248,
        failedPages: 2,
        totalBytes: 1024000
      }
    },
    
    indexing: {
      sessionId: '1706697600000-example',
      status: 'indexing',
      currentStep: 'embedding',
      progress: 90,
      message: 'Генеруємо векторні представлення: 90%',
      collectionName: 'example-docs',
      statistics: {
        startTime: '2025-01-31T10:00:00.000Z',
        elapsedTime: 120,
        documentsProcessed: 488,
        documentsTotal: 488,
        embeddingsProcessed: 2800,
        embeddingsTotal: 3179,
        chunksCreated: 3179,
        averageChunkSize: 245
      }
    },
    
    completed: {
      sessionId: '1706697600000-example',
      status: 'completed',
      currentStep: 'completed',
      progress: 100,
      message: 'AI-помічник готовий до роботи!',
      chatUrl: '/demo/1706697600000-example',
      collectionName: 'example-docs',
      statistics: {
        startTime: '2025-01-31T10:00:00.000Z',
        elapsedTime: 160,
        successfulPages: 487,
        failedPages: 0,
        embeddingsGenerated: 3179,
        totalBytes: 2048000
      }
    },
    
    error: {
      sessionId: '1706697600000-example',
      status: 'error',
      currentStep: 'failed',
      progress: 30,
      message: 'Помилка під час скрапінгу документації',
      error: 'Network timeout after 5 retries',
      url: 'https://docs.example.com',
      statistics: {
        startTime: '2025-01-31T10:00:00.000Z',
        elapsedTime: 25,
        urlsProcessed: 50,
        urlsTotal: 487,
        failedPages: 10
      }
    }
  }
};

// Helper функції для генерації тестових даних
export const generateTestSession = (url: string = 'https://docs.example.com') => {
  const timestamp = Date.now();
  const urlHash = url.replace(/[^\w]/g, '').slice(-8);
  return `${timestamp}-${urlHash}`;
};

export const generateProgressUpdate = (
  current: number, 
  total: number, 
  currentUrl?: string
) => ({
  current,
  total,
  percentage: Math.round((current / total) * 100),
  currentUrl: currentUrl || `https://docs.example.com/page-${current}`,
  status: 'success'
});

export const simulateScrapingProgress = (total: number = 487) => {
  const updates = [];
  const checkpoints = [0.05, 0.2, 0.4, 0.6, 0.8, 1.0];
  
  for (const checkpoint of checkpoints) {
    const current = Math.round(total * checkpoint);
    updates.push(generateProgressUpdate(current, total));
  }
  
  return updates;
}; 