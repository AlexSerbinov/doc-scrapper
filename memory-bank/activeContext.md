# Active Context

**Останнє оновлення**: 1 грудня 2024  
**Поточний фокус**: 🚨 КРИТИЧНИЙ РЕЖИМ - Система не працює для реальних сайтів

## 🔥 КРИТИЧНИЙ СТАТУС - МНОЖИННІ ПРОБЛЕМИ

### 🚫 **Проблема #1: Backend API Не Працює (БЛОКЕР)**
- **Симптоми**: `curl: (52) Empty reply from server` на всіх запитах до /scrape
- **Порт**: 8001 - RAG server не відповідає
- **Вплив**: Неможливо запустити скрапінг через веб-інтерфейс
- **Пріоритет**: КРИТИЧНИЙ - Повністю блокує роботу

### ⏱️ **Проблема #2: Jina Reader Rate Limiting (ПОВІЛЬНІСТЬ)**
- **Обмеження**: 20 запитів/хвилину (3 сек між запитами)
- **Реальний час**: 487 сторінок = ~25 хвилин  
- **Статус**: НЕПРИЙНЯТНО для будь-якого використання
- **Потрібно**: Альтернативне рішення БЕЗ rate limits

### 🗺️ **Проблема #3: URL Discovery Не Працює**
- **Симптоми**: Карта сайтів створюється неправильно
- **Наслідки**: Неповне сканування документації
- **UrlDiscoverer**: Не знаходить всі сторінки сайту
- **Потрібно**: Покращення алгоритмів пошуку

### 📄 **Проблема #4: Погана Якість Екстракції**
- **Симптоми**: Нормальні сайти не парсяться як треба
- **Content selectors**: Не підходять для різних CMS
- **Результат**: Неякісний контент у вихідних файлах
- **Потрібно**: Адаптивні селектори для різних типів сайтів

### ❓ **Проблема #5: Відсутність Стратегії**
- **Проблема**: Не знаємо що використовувати для швидкості
- **Варіанти**: Mercury Parser, Readability.js, Playwright, ScrapingBee
- **Статус**: Потрібен план тестування та вибору
- **Мета**: <5 хвилин для 500 сторінок

### 💻 **Проблема #6: TypeScript Не Компілюється**
- **Mercury Parser**: Відсутні типи для @postlight/parser ✅ СТВОРЕНО
- **Turndown Filter**: Type compatibility errors з filter functions
- **Код**: Не можна запустити через compilation errors

## 🎯 ПЛАН ВИРІШЕННЯ - АКТИВНІ ДІЇ

### 🚀 **НЕГАЙНІ ДІЇ (Зараз):**

#### 1. **TypeScript Compilation (30 хв)**
- [x] Створено типи для Mercury Parser
- [ ] Виправити Turndown filter function types
- [ ] Забезпечити успішну компіляцію

#### 2. **FastContentExtractor Testing (1 година)**
- [ ] Завершити імплементацію FastContentExtractor
- [ ] Запустити speed tests на test-fast-extractor.js
- [ ] Порівняти Mercury vs Readability vs Jina на реальних URL

#### 3. **Backend API Diagnosis (1 година)**
- [ ] Перевірити чи запущений RAG server на порту 8001
- [ ] Діагностувати Empty reply from server  
- [ ] Виправити /scrape endpoint

### ⚡ **КОРОТКОСТРОКОВО (1-2 дні):**

#### 4. **Hybrid Extraction Strategy (1 день)**
- [ ] Статичний контент → Mercury Parser (швидко)
- [ ] SPA сайти → Playwright (якісно)
- [ ] Fallback → Jina Reader (з обмеженнями)
- [ ] Автоматичний вибір стратегії по типу сайту

#### 5. **URL Discovery Improvements (1 день)**  
- [ ] Аналіз поточного UrlDiscoverer
- [ ] Покращення sitemap.xml parsing
- [ ] Додавання navigation pattern detection
- [ ] Breadcrumb following implementation

#### 6. **Site Analysis Enhancement (1 день)**
- [ ] Автоматичне визначення CMS (WordPress, Drupal, etc.)
- [ ] Адаптивні селектори для різних систем
- [ ] Quality metrics для оцінки extraction

## 📊 **ЦІЛЬОВІ МЕТРИКИ**

### **Швидкість (Цільова)**
```
Mercury Parser:     <1 сек/сторінка
Readability:        1-2 сек/сторінка  
Playwright:         3-5 сек/сторінка
Hybrid Solution:    1-3 сек/сторінка (середнє)

500 сторінок:       8-25 хвилин (vs поточні 58+ хвилин)
```

### **Якість (Цільова)**
```
Content accuracy:   >95% (vs поточні ~70%)
Structure preservation: >90%
Markdown formatting: Clean та readable
Site coverage:      >98% сторінок знайдено
```

### **Reliability (Цільова)**  
```
API response rate:  100% (vs поточні 0%)
Compilation:        No errors
Error handling:     Graceful degradation
Rate limiting:      No external dependencies
```

## 🔧 **ЕКСПЕРИМЕНТИ ДЛЯ ТЕСТУВАННЯ**

### **Speed Benchmarks:**
```bash
# 1. Single URL tests
node test-fast-extractor.js

# 2. Batch processing tests (5-10 URLs)
# Порівняти: Mercury vs Readability vs Jina vs Hybrid

# 3. Large site tests (50+ URLs)
# ai-sdk.dev, docs.nestjs.com, react.dev
```

### **Quality Assessments:**
- Content length comparison
- Structure preservation analysis  
- Markdown formatting quality
- Cross-site compatibility tests

### **Site Type Tests:**
- **Static sites**: ai-sdk.dev (Markdown)
- **SPA sites**: docs.nestjs.com (Angular)  
- **React sites**: react.dev (Next.js)
- **Documentation**: docs.python.org (Sphinx)
- **Complex sites**: developer.mozilla.org (MDN)

## 🚨 **БЛОКЕРИ ТА РИЗИКИ**

### **Поточні Блокери:**
1. **Backend API**: Empty reply - 🚫 ПОВНИЙ БЛОК веб-інтерфейсу
2. **TypeScript**: Compilation errors - 🚫 БЛОК розробки
3. **Rate Limiting**: Jina Reader - 🚫 БЛОК продакшену

### **Ризики:**
- **Mercury Parser**: Може не підтримувати всі типи сайтів
- **Readability**: Може давати неповний контент для документації  
- **API Dependencies**: Зовнішні сервіси можуть падати
- **Performance**: Множинні HTTP requests можуть бути повільними

## 🎯 **SUCCESS CRITERIA**

### **Мінімальний Success (2-3 дні):**
- ✅ TypeScript компілюється без помилок
- ✅ Backend API відповідає на запити
- ✅ FastContentExtractor працює швидше за Jina Reader
- ✅ Можна скрапити ai-sdk.dev за <10 хвилин

### **Повний Success (1 тиждень):**  
- ✅ Hybrid strategy автоматично вибирає кращий extractor
- ✅ URL Discovery знаходить >95% сторінок сайту
- ✅ Quality metrics показують >90% accuracy
- ✅ Система працює стабільно на різних типах сайтів

---

**Поточний режим**: 🚨 КРИТИЧНИЙ - ПОЧИНАЄМО З TYPECSRIPT FIXES
**Наступний крок**: Виправити compilation errors та протестувати FastContentExtractor
**Deadline**: Базова функціональність за 2-3 дні 