# 📚 Doc Scrapper AI

**Універсальний скрапер документації з Multi-Collection RAG-системою та інтелектуальним чат-ботом**

Автоматично витягує технічну документацію з веб-сайтів, індексує її в окремі векторні колекції та надає контекстуальні AI-відповіді з можливістю вибору конкретного джерела документації.

## 🎯 Архітектура системи

### **3 незалежні сервери:**

| Сервер | Порт | Призначення | Статус |
|--------|------|-------------|---------|
| **ChromaDB** | 8000 | Векторна БД з multi-collection підтримкою | ✅ |
| **RAG API** | 8001 | HTTP API для AI запитів | ✅ |
| **Web App** | 3000 | Next.js інтерфейс з UI | ✅ |

## ✨ Ключові можливості (ОНОВЛЕНО)

### 🗂️ **Multi-Collection система** ⭐ НОВЕ
- **Окремі колекції** для кожного проекту документації
- **Collection Selector UI** з групуванням по проектах
- **Contextual AI відповіді** з правильних джерел
- **Dynamic switching** між колекціями без перезапуску

### 📄 **Консолідація документації для LLM** ⭐ НОВЕ
- **Один файл** з всією документацією для великих LLM контекстів
- **Підтримка Google Gemini Flash/Pro** (2M+ токенів)
- **ChatGPT-4 Turbo сумісність** (128K+ токенів)
- **Claude 3.5 Sonnet підтримка** (200K+ токенів)
- **Markdown рендерінг** з синтаксис підсвічуванням
- **Copy/Download функціональність** з веб-інтерфейсу
- **Статистика токенів** та розміру файлів

### 🔄 **Селективний перезапуск сервісів** ⭐ НОВЕ
- **Include режим**: Перезапуск тільки вибраних сервісів
- **Exclude режим**: Перезапуск всіх крім вибраних
- **Smart cleanup**: Очищення тільки відповідних портів
- **Service monitoring**: Відображення статусу всіх сервісів
- **Flexible commands**: `npm run restart:web`, `npm run restart:backend`, тощо

### 🔍 Інтелектуальний скрапінг
- **Автоматичне знаходження сторінок** через sitemap.xml або навігацію
- **Розумна екстракція контенту** без навігації, реклами та зайвих елементів
- **Структурована організація** файлів відповідно до оригінального сайту
- **Real-time progress tracking** через веб-інтерфейс

### 🤖 RAG-система (Retrieval-Augmented Generation)
- **Векторна індексація** документів через OpenAI embeddings
- **Multi-collection management** з REST API
- **Семантичний пошук** релевантного контенту
- **Інтелектуальні відповіді** з використанням GPT-4o-mini

### 🌐 **Веб-додаток з повним функціоналом** ⭐ ГОТОВО
- **Trial activation form** з real-time scraping
- **Collection Selector** з групуванням документацій
- **Chat Interface** з contextual AI responses
- **Progress tracking** для scraping операцій
- **Consolidation feature** для LLM integration

## 🚀 Швидкий старт (ОНОВЛЕНО)

### **🔥 Запуск на GitHub (Рекомендовано)**

```bash
# 1. Клонування репозиторію
git clone https://github.com/AlexSerbinov/doc-scrapper.git
cd doc-scrapper

# 2. Встановлення залежностей
npm install
cd web-app && npm install && cd ..

# 3. Створення .env файлу
cp env-template.txt .env
# Додайте ваш OPENAI_API_KEY в .env файл

# 4. Компіляція та запуск (НОВЕ!)
npm run restart  # ⭐ Універсальний restart всіх сервісів

# 5. Відкрити веб-додаток
open http://localhost:3000
```

### **⚙️ Управління серверами (РОЗШИРЕНО)**

```bash
# === ПОВНИЙ ПЕРЕЗАПУСК ===
npm run restart         # ⭐ Універсальний restart всіх сервісів
npm run dev:all         # Альтернативний запуск

# === СЕЛЕКТИВНИЙ ПЕРЕЗАПУСК ===
npm run restart:web     # ⭐ НОВЕ: Тільки веб-додаток
npm run restart:rag     # ⭐ НОВЕ: Тільки RAG API
npm run restart:chroma  # ⭐ НОВЕ: Тільки ChromaDB

# === EXCLUDE РЕЖИМ ===
npm run restart:backend    # ⭐ НОВЕ: Все крім веб-додатку
npm run restart:except-web # ⭐ НОВЕ: Все крім веб-додатку
npm run restart:except-rag # ⭐ НОВЕ: Все крім RAG API

# === ЗУПИНКА ===
npm run stop           # ⭐ Зупинити все

# === ОКРЕМИЙ ЗАПУСК ===
npm run dev:backend    # ChromaDB + RAG API
npm run web:dev        # Тільки веб-додаток

# === МОНІТОРИНГ ===
npm run health         # RAG API health check
curl http://localhost:8001/collections  # Список колекцій
```

## 📚 **Multi-Collection система в дії**

### **Поточні колекції:**
```
📚 Активні колекції:
├── ai-sdk-dev-docs (6,358 документів)   # AI SDK документація
├── astro-test (6,216 документів)        # Astro документація  
└── doc-scrapper-docs (3,178 документів) # Doc Scrapper документація
```

### **Як використовувати:**
1. **Відкрити веб-додаток**: http://localhost:3000
2. **Ввести URL документації** у форму (або використати готові колекції)
3. **Дочекатися завершення** scraping + indexing процесу
4. **Обрати колекцію** в Collection Selector
5. **Ставити питання** та отримувати contextual відповіді

### **Консолідація для LLM:**
1. **Оберіть колекцію** в веб-інтерфейсі
2. **Натисніть "Consolidate for LLM"** кнопку
3. **Переглядайте об'єднану документацію** з markdown рендерінгом
4. **Копіюйте або завантажуйте** для використання з великими LLM
5. **Статистика**: Кількість файлів, розмір, оцінка токенів

### **REST API для колекцій:**
```bash
# Список всіх колекцій
curl http://localhost:8001/collections

# Запит до конкретної колекції
curl -X POST http://localhost:8001/query \
  -d '{"message":"How to use AI SDK?", "collectionName":"ai-sdk-dev-docs"}'

# Консолідація колекції
curl -X POST http://localhost:8001/consolidate \
  -d '{"collectionName":"ai-sdk-dev-docs", "projectName":"AI SDK"}'

# Перемикання колекції
curl -X POST http://localhost:8001/switch-collection \
  -d '{"collectionName":"astro-test"}'
```

## 🌐 Веб-інтерфейс функції

### **✅ Готові функції:**
- 🎯 **Trial Activation Form** - real-time scraping нових документацій
- 📊 **Progress Tracking** - live updates під час обробки
- 🗂️ **Collection Selector** - вибір між проектами документації
- 💬 **Chat Interface** - AI assistant з contextual відповідями
- 📄 **LLM Consolidation** - об'єднання документації для великих LLM
- 📋 **Copy/Download** - зручне копіювання та завантаження
- 📱 **Responsive Design** - адаптивний дизайн
- 🔄 **Real-time Switching** - перемикання між колекціями

### **🚀 Робочий процес:**
```
URL Input → Progress Bar → Scraping → Indexing → 
Collection Created → Demo Chat → AI Responses → LLM Consolidation
```

## 📖 Детальне використання

### CLI Скрапінг (альтернативний спосіб)

```bash
# Базовий скрапінг через CLI
npm run build  # Компіляція перед використанням
npm run dev -- "https://docs.example.com"

# З налаштуваннями
npm run dev -- "https://ai-sdk.dev/docs/introduction" \
  -o ./my-docs \
  -f markdown \
  -m 100 \
  -c 5 \
  -d 1500 \
  --verbose

# ВАЖЛИВО: Використовуйте подвійний дефіс --
npm run dev -- "URL" -c 10 -d 2000  # ✅ ПРАВИЛЬНО
npm run dev "URL" -c 10              # ❌ НЕПРАВИЛЬНО
```

### RAG система команди

```bash
# Індексування документів
npm run rag:index <path-to-docs> [options]

# CLI чат (альтернатива веб-інтерфейсу)
npm run rag:chat

# Статистика колекцій
npm run rag:stats
```

## 🛠️ Технології (ОНОВЛЕНО)

### **Backend Stack**
- **TypeScript** - Строга типізація
- **Node.js** v24+ - Runtime
- **ChromaDB** - Multi-collection векторна БД
- **OpenAI** - Embeddings (text-embedding-3-small) + LLM (GPT-4o-mini)
- **AI SDK** - Vercel AI SDK v3.0

### **Frontend Stack ⭐ НОВИЙ**
- **Next.js 15** - Full-stack framework з App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Modern styling з темною темою
- **React Server/Client Components** - Optimal architecture

### **DevOps & Scripts ⭐ НОВІ**
- **Universal restart scripts** - `restart.sh`, `stop.sh`
- **NPM scripts integration** - `npm run restart`, `npm run stop`
- **Port management** - Automatic cleanup портів 3000, 8000, 8001
- **Process monitoring** - Health checks та automatic recovery

## 🔧 Troubleshooting

### **Порти зайняті:**
```bash
npm run stop           # Автоматично звільнить порти
# або manually:
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9  
lsof -ti:8001 | xargs kill -9
```

### **ChromaDB проблеми:**
```bash
# Перевірити чи працює
curl http://localhost:8000/api/v1/heartbeat

# Restart ChromaDB
npm run chroma:restart
```

### **Build помилки веб-додатку:**
```bash
# Next.js build
cd web-app && npm run build

# Якщо utility function помилки:
# Перевірте що всі utility functions винесені в lib/ папку
```

## 📊 Результати тестування (ОНОВЛЕНІ)

### **Multi-Collection система:**
- ✅ **3 активні колекції** з різним контентом
- ✅ **Collection-specific queries** працюють коректно
- ✅ **UI/UX** з expandable selector та real-time switching
- ✅ **Web API інтеграція** (/api/collections, /api/chat) функціональна

### **Performance тести:**
- ✅ **Form submission** → real scraping процес
- ✅ **Progress tracking** → real-time updates
- ✅ **RAG indexing** → автоматично після scraping
- ✅ **Chat responses** → contextual з правильних джерел

### **Тест на ai-sdk.dev:**
- ✅ **487 URL** знайдено через sitemap.xml
- ✅ **53 секунди** час скрапінгу
- ✅ **51 файл** створено (280KB)
- ✅ **Колекція створена** автоматично з 6,358 документів

## 🎯 Готові сценарії використання

### **Scenario 1: Новий користувач**
1. `git clone https://github.com/AlexSerbinov/doc-scrapper.git`
2. `npm install && cd web-app && npm install && cd ..`
3. Додати `OPENAI_API_KEY` в `.env` файл
4. `npm run restart`
5. Відкрити http://localhost:3000
6. Ввести URL документації
7. Дочекатися completion та використовувати chat

### **Scenario 2: Розробник**
1. `npm run restart` - запустити всі сервіси
2. Працювати з кодом
3. `npm run stop` - зупинити все при завершенні

### **Scenario 3: API тестування**
```bash
# Health check
curl http://localhost:8001/health

# Список колекцій
curl http://localhost:8001/collections | jq .

# Query specific collection
curl -X POST http://localhost:8001/query \
  -d '{"message":"test", "collectionName":"ai-sdk-dev-docs"}'
```

## 🚧 Roadmap

### **✅ Завершено:**
- Multi-Collection система з UI
- Web App з повним функціоналом
- Universal restart scripts
- Real-time progress tracking
- Collection-aware chat interface

### **🔄 В планах:**
- Authentication система з trial limitations
- CLI collection parameter (`--collection-name`)
- Export to single file functionality
- Embedable chat widget для websites
- Production deployment guides

## 📄 Встановлення Environment

### **Обов'язково:**
```bash
# .env файл
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### **Опціонально:**
```bash
# Налаштування RAG
RAG_LLM_MODEL=gpt-4o-mini
RAG_EMBEDDING_MODEL=text-embedding-3-small
RAG_VECTOR_STORE_CONNECTION_STRING=http://localhost:8000

# Налаштування Web App
NEXT_PUBLIC_RAG_API_URL=http://localhost:8001
```

## 🤝 Contributing

1. **Fork** репозиторію: https://github.com/AlexSerbinov/doc-scrapper
2. Створіть **feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit** зміни: `git commit -m 'Add amazing feature'`
4. **Push** до branch: `git push origin feature/amazing-feature`
5. Відкрийте **Pull Request**

## 📄 Ліцензія

MIT License - дивіться [LICENSE](LICENSE) файл для деталей.

---

**🔗 Корисні посилання:**
- [📚 Детальний гід по серверах](./SERVERS_GUIDE.md)
- [🐛 Звітувати про баг](https://github.com/AlexSerbinov/doc-scrapper/issues)
- [💡 Запропонувати функцію](https://github.com/AlexSerbinov/doc-scrapper/issues)
- [💬 GitHub Discussions](https://github.com/AlexSerbinov/doc-scrapper/discussions)

**🎯 Система готова для production використання як multi-collection documentation AI assistant!** 🚀 