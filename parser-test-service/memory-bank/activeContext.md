# Active Context - Doc Scrapper

## Поточний фокус роботи

### 🚨 КРИТИЧНА ПРОБЛЕМА
**Форма активації тріалу не працює** - основна функціональність не підключена до backend.

### Діагноз проблеми
1. ✅ **RAG система працює** - API на порту 8001 відповідає
2. ✅ **ChromaDB працює** - векторна база на порту 8000 активна  
3. ✅ **CLI Scraper працює** - може скрапити документацію програмно
4. ✅ **Web UI працює** - форма виглядає правильно і показує ProcessingModal
5. ❌ **ВІДСУТНЯ ІНТЕГРАЦІЯ** - форма тільки показує mock UI, не викликає реальний скрапінг

### Поточне розуміння архітектури
```
[Web Form] → [Mock ProcessingModal] → [Chat Interface]
     ❌             ❌                        ✅
   (не підключена до реального backend)
```

### Потрібна архітектура
```
[Web Form] → [API /api/scrape] → [CLI Scraper] → [ChromaDB] → [Chat Ready]
     ✅              ✅              ✅             ✅            ✅
```

## Останні зміни та відкриття

### 2025-01-06 - Тестування екстракторів та створення API endpoint

#### ✅ Проблема з Jina Reader API вирішена
- **Проблема**: Jina Reader API обмежений до 20 запитів/хвилину (занадто повільно для 487 сторінок)
- **Рішення**: Переключено на JavaScript та Static режими

#### ✅ Успішний тест статичного режиму
- **Результат**: 10 сторінок AI SDK скрапано за 65 секунд
- **Знайдено**: 487 URLs в sitemap
- **Метод**: JavaScript extraction автоматично застосовується навіть в static mode
- **Швидкість**: ~9 секунд на сторінку (включаючи rate limiting)

#### ✅ API endpoint створено
- **Файл**: `web-app/src/app/api/scrape/route.ts`  
- **Функціональність**:
  - POST endpoint приймає URL та mode екстракції
  - Автоматична генерація collection name з URL
  - Child process spawn для CLI scraper
  - Підтримка 3 режимів: `js`, `static`, `jina`
  - Оптимізовані параметри concurrency та delay для кожного режиму

#### 🚧 Запущено повний скрапінг AI SDK
- **Статус**: В процесі (background process)
- **Параметри**: static mode, 10 concurrency, 200ms delay
- **Очікувані результати**: 487 сторінок через ~2-3 години

### Відкриття під час тестування
1. **CLI scraper універсальний** - автоматично обирає оптимальний метод
2. **Static mode швидший** - менше timeout помилок ніж JS mode
3. **API integration готова** - endpoint працює, тільки потрібно підключити UI
4. **Rate limiting ефективний** - 200ms delay запобігає блокуванню

## Наступні кроки

### Пріоритет 1: Підключити форму активації тріалу ✅ (ЧАСТКОВО)
- [✅] Створити `/api/scrape` endpoint у Next.js
- [✅] Інтегрувати виклик CLI scraper через child_process
- [✅] Додати генерацію унікальних session ID
- [✅] Імплементувати collection name generation
- [ ] **НАСТУПНИЙ КРОК**: Підключити HeroSection форму до API endpoint

### Пріоритет 2: Real-time прогрес  
- [ ] Додати Server-Sent Events для прогресу скрапінгу
- [ ] Оновити ProcessingModal для показу реального прогресу
- [ ] Додати error handling та timeout management

### Пріоритет 3: Завершити інтеграцію з RAG
- [ ] Автоматична індексація після скрапінгу
- [ ] Переключення RAG API на нову колекцію
- [ ] Перенаправлення на чат після завершення

## Активні технічні рішення

### ✅ Обрана стратегія екстракції
**Static Mode з JS fallback** - найкращий баланс швидкості та якості:

```typescript
// Оптимізовані параметри для різних режимів
const concurrency = extractionMode === 'static' ? '20' : '15';
const delay = extractionMode === 'static' ? '50' : '100';
```

### ✅ Collection naming strategy
```typescript
function generateCollectionName(url: string): string {
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace(/^www\./, '');
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  
  const name = pathParts.length > 0 
    ? `${domain}-${pathParts[0]}`  // ai-sdk-dev-docs
    : domain;
  
  return name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
}
```

### ✅ API endpoint архітектура
```typescript
// POST /api/scrape
{
  "url": "https://ai-sdk.dev/docs/introduction",
  "extractionMode": "static", // js | static | jina
  "collectionName": "custom-name" // optional
}

// Response
{
  "success": true,
  "sessionId": "aHR0cHM6-lw3qy4jo",
  "collectionName": "ai-sdk-dev-docs",
  "message": "Scraping started successfully with static mode"
}
```

## Поточні технічні міркування

### Performance результати
- **Static mode**: ~9 сек/сторінка (з rate limiting)
- **Concurrent processes**: 10-15 оптимально для уникнення блокувань
- **Memory usage**: стабільний, без leak'ів
- **Error rate**: ~5% timeout помилки (прийнятно)

### Наступні оптимізації
1. **Adaptive rate limiting** - збільшувати delay при помилках
2. **Smart retry** - повторні спроби для failed pages
3. **Progress streaming** - real-time updates через SSE
4. **Collection indexing** - автоматична RAG індексація після scraping

## Блокери та питання

### ✅ Вирішені
- [✅] CLI параметри - підтверджено підтримку всіх потрібних опцій
- [✅] Environment setup - env variables правильно передаються
- [✅] Collection naming - ChromaDB-compatible назви генеруються
- [✅] Rate limiting - оптимальні параметри знайдені

### Залишається вирішити
1. **UI Integration** - підключити HeroSection.tsx до API endpoint
2. **Real-time feedback** - SSE для progress tracking
3. **Error handling** - користувацькі повідомлення про помилки
4. **RAG integration** - автоматичне переключення колекцій після scraping

### Технічні питання
- Чи потрібно зберігати session state між перезапусками сервера?
- Як оптимально обробляти concurrent scraping requests?
- Яка стратегія для cleanup старих scraped files? 