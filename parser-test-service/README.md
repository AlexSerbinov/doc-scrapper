# Parser Test Service 🧪

Окремий тестувальний сервіс для порівняння різних парсерів документації. Створений для швидкого прототипування та тестування без залежностей від основного проєкту.

## Функціональність

### 🎯 Підтримувані парсери:
- **Mercury Parser** - швидкий для статичного контенту
- **Mozilla Readability** - універсальний для більшості сайтів
- **Jina Reader API** - найкраща якість, але з rate limiting

### 🔍 URL Discovery:
- Автоматичний пошук sitemap.xml
- Crawling по навігаційних посиланнях
- Фільтрація за patterns документації
- Налаштовувана глибина пошуку

### 💾 Збереження результатів:
- Markdown файли з frontmatter
- Автоматичне іменування файлів
- Статистичний звіт
- Організована структура папок

## Встановлення

```bash
cd parser-test-service
npm install
```

## Використання

### Тестування одного URL

```bash
# Тестувати всі парсери
node index.js test "https://ai.sdk.dev/docs/getting-started" --all

# Тестувати конкретний парсер
node index.js test "https://docs.nestjs.com/first-steps" --mercury
node index.js test "https://react.dev/learn" --readability
node index.js test "https://docs.astro.build/en/getting-started/" --jina
```

### Скрапування всього сайту документації

```bash
# Базове скрапування (50 сторінок, auto-extractor)
node index.js scrape "https://ai.sdk.dev/docs/"

# З додатковими параметрами
node index.js scrape "https://docs.nestjs.com/" \
  --pages 100 \
  --depth 4 \
  --extractor mercury \
  --output ./nestjs-docs

# Без URL discovery (тільки стартова сторінка)
node index.js scrape "https://react.dev/learn" --no-discovery
```

### Параметри

**Команда `test`:**
- `<url>` - URL для тестування
- `-a, --all` - тестувати всі парсери
- `-m, --mercury` - тільки Mercury Parser
- `-r, --readability` - тільки Readability
- `-j, --jina` - тільки Jina Reader

**Команда `scrape`:**
- `<startUrl>` - стартовий URL документації
- `-o, --output <dir>` - папка для результатів (default: ./scraped-docs)
- `-p, --pages <number>` - максимум сторінок (default: 50)
- `-d, --depth <number>` - максимальна глибина crawling (default: 3)
- `-e, --extractor <type>` - парсер (mercury|readability|jina|auto)
- `--no-discovery` - пропустити URL discovery

## Приклади тестування

### 1. Швидке порівняння парсерів

```bash
# Порівняти всі парсери на одному URL
node index.js test "https://ai.sdk.dev/docs/introduction" --all
```

**Очікуваний результат:**
```
🧪 Parser Testing Service

✓ Mercury Parser: 847ms, 1,234 words
  Title: Introduction to AI SDK
  Content: 8,456 chars

✓ Mozilla Readability: 1,203ms, 1,198 words  
  Title: Introduction to AI SDK
  Content: 8,234 chars

✓ Jina Reader API: 2,134ms, 1,267 words
  Title: Introduction to AI SDK  
  Content: 8,789 chars
```

### 2. Тестування різних типів сайтів

```bash
# Docs сайт (має гарну структуру)
node index.js test "https://docs.astro.build/en/getting-started/" --mercury

# SPA сайт (JavaScript-heavy)
node index.js test "https://docs.nestjs.com/first-steps" --readability

# GitHub документація
node index.js test "https://docs.github.com/en/get-started" --jina
```

### 3. Повне скрапування сайту

```bash
# AI SDK документація
node index.js scrape "https://ai.sdk.dev/docs/" \
  --pages 100 \
  --extractor auto \
  --output ./ai-sdk-docs

# Astro документація  
node index.js scrape "https://docs.astro.build/en/getting-started/" \
  --pages 200 \
  --depth 4 \
  --extractor mercury \
  --output ./astro-docs
```

## Структура результатів

```
scraped-docs/
├── 001-introduction-to-ai-sdk.md
├── 002-getting-started.md
├── 003-models-and-providers.md
├── ...
└── extraction-summary.md
```

**Приклад файлу:**
```markdown
---
title: "Introduction to AI SDK"
url: "https://ai.sdk.dev/docs/introduction"
extractor: "mercury"
extractionTime: "847ms"
wordCount: 1234
contentLength: 8456
extractedAt: "2024-12-01T15:30:45.123Z"
---

# Introduction to AI SDK

The AI SDK is a TypeScript library for building...
```

**Приклад summary:**
```markdown
# Extraction Summary

## Statistics
- **Total URLs**: 47
- **Successful**: 45
- **Failed**: 2
- **Success Rate**: 95.7%
- **Total Words**: 58,234
- **Total Content**: 425.3 KB
- **Average Time**: 892ms per URL

## Extractor Performance
- **mercury**: 45/47 (95.7%) - avg 892ms

## Failed URLs
- https://example.com/broken: Network timeout
- https://example.com/404: Page not found
```

## Performance Benchmarks

**Очікувані швидкості:**
- Mercury Parser: 500-1500ms (статичний контент)
- Readability: 800-2000ms (універсальний)
- Jina Reader: 2000-4000ms + 3s rate limiting

**Для 500 сторінок:**
- Mercury: ~8-15 хвилин
- Readability: ~12-20 хвилин  
- Jina: ~50+ хвилин (з rate limits)

## Troubleshooting

**Mercury Parser fails:**
- Сайт може блокувати requests
- Статичний контент відсутній
- Fallback: використайте Readability

**Readability нічого не знаходить:**
- Сайт може бути SPA (JavaScript-heavy)
- Fallback: використайте Jina

**URL Discovery знаходить мало сторінок:**
- Збільшити depth (`--depth 4`)
- Перевірити sitemap.xml вручну
- Використати конкретні include patterns

**Rate limiting issues:**
- Jina Reader: автоматично використовує 3s delays
- Для інших: збільшити паузи в коді

## Наступні кроки

Коли тести покажуть позитивні результати:
1. Інтегрувати найкращий парсер в основний проєкт
2. Додати hybrid strategy (автоматичний вибір)
3. Покращити URL discovery алгоритми
4. Оптимізувати performance для великих сайтів

---

**Створено**: 1 грудня 2024  
**Мета**: Швидке прототипування парсерів без складнощів основного проєкту 