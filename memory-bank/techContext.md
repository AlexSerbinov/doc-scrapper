# Tech Context - Doc Scrapper

## Технологічний стек

### Основні технології
- **Runtime**: Node.js (20+)
- **Мова**: TypeScript (5.0+)
- **Build System**: Vite або esbuild
- **Package Manager**: npm або pnpm

### Веб-скрапінг
- **HTTP Client**: axios або fetch API
- **HTML Parsing**: Cheerio (jQuery-like server-side)
- **Headless Browser**: Puppeteer (для SPA) - опціонально
- **User-Agent**: Rotation для уникнення блокування

### Утиліти
- **CLI Framework**: Commander.js або yargs
- **File System**: fs-extra
- **Path Handling**: path
- **URL Parsing**: URL API
- **Progress**: cli-progress

### Валідація та типізація
- **Schema Validation**: Zod
- **Config Validation**: Custom TypeScript interfaces
- **URL Validation**: Built-in URL API

### Форматування та конвертація
- **Markdown**: Turndown (HTML to Markdown)
- **JSON**: Native JSON
- **HTML Sanitization**: DOMPurify або jsdom

## Залежності

### Production Dependencies
```json
{
  "axios": "^1.6.0",
  "cheerio": "^1.0.0-rc.12",
  "commander": "^11.0.0",
  "fs-extra": "^11.1.0",
  "turndown": "^7.1.0",
  "cli-progress": "^3.12.0",
  "zod": "^3.22.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.0.0",
  "@types/node": "^20.0.0",
  "@types/fs-extra": "^11.0.0",
  "tsx": "^4.0.0",
  "vitest": "^1.0.0"
}
```

### Опціональні залежності (для складних сайтів)
```json
{
  "puppeteer": "^21.0.0",
  "playwright": "^1.40.0"
}
```

## Структура проєкту
```
src/
├── cli/           # CLI interface
├── core/          # Core scraping logic
├── extractors/    # Content extraction strategies
├── formatters/    # Output formatters
├── storage/       # Storage adapters
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── index.ts       # Main entry point

tests/
├── unit/          # Unit tests
├── integration/   # Integration tests
└── fixtures/      # Test data

config/
├── default.json   # Default configuration
└── examples/      # Example configurations
```

## Налаштування розробки

### TypeScript Config
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "vitest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

## Технічні обмеження
- Node.js environment (не браузер)
- Respect robots.txt та rate limiting
- Максимальний розмір файлу: 100MB на сторінку
- Максимальна глибина навігації: 10 рівнів
- Таймаут запиту: 30 секунд

## Безпека та етика
- User-Agent rotation
- Rate limiting (мінімум 1 секунда між запитами)
- Respect robots.txt
- Перевірка CORS політик
- Логування всіх запитів для аудиту

## Продуктивність
- Parallel processing (до 5 одночасних запитів)
- In-memory caching для повторних запитів
- Streaming для великих файлів
- Incremental progress saving

## CLI Interface
```bash
doc-scrapper <url> [options]

Options:
  -o, --output <dir>     Output directory (default: ./output)
  -f, --format <format>  Output format: markdown|json|html (default: markdown)
  -c, --config <file>    Configuration file
  -v, --verbose          Verbose logging
  -d, --depth <number>   Maximum crawl depth (default: 5)
  --parallel <number>    Parallel requests (default: 3)
  --delay <ms>           Delay between requests (default: 1000)
``` 