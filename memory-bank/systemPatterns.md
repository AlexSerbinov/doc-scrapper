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