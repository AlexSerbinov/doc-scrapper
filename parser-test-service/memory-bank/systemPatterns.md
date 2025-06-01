# System Patterns - Doc Scrapper

## Архітектура системи

### Загальна архітектура
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   RAG API       │    │   ChromaDB      │
│   (Next.js)     │◄──►│   (Port 8001)   │◄──►│   (Port 8000)   │
│   Port 3006     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│   CLI Scraper   │──────────────┘
                        │   (Background)  │
                        └─────────────────┘
```

### Компоненти системи

#### 1. CLI Scraper (Основний компонент)
- **Розташування**: `/dist/index.js` (TypeScript компільований)
- **Функціональність**: 
  - Скрапінг веб-сторінок
  - Обробка та парсинг контенту
  - Генерація векторних індексів
  - Завантаження даних в ChromaDB

#### 2. RAG API Server
- **Порт**: 8001
- **Технології**: Node.js + Express
- **Функціональність**:
  - Query processing
  - Vector similarity search
  - OpenAI integration (embeddings + GPT-4o-mini)
  - Response generation

#### 3. ChromaDB Vector Database
- **Порт**: 8000
- **Функціональність**:
  - Векторне зберігання document embeddings
  - Semantic search
  - Collection management
  - Метадані та filtering

#### 4. Web Application
- **Порт**: 3006
- **Framework**: Next.js 14 (App Router)
- **Функціональність**:
  - Landing page з формою активації
  - Chat interface
  - Processing modals
  - Responsive UI з dark theme

## Патерни проєктування

### 1. Microservices Pattern
Кожен компонент працює як окремий сервіс:
- **Незалежне масштабування**
- **Ізоляція помилок**
- **Технологічна різноманітність**

### 2. Event-Driven Architecture
- CLI scraper генерує events про прогрес
- Web UI реагує на зміни стану
- Асинхронна обробка запитів

### 3. Repository Pattern
Для роботи з даними:
```typescript
// RAG система використовує абстракцію
interface VectorStore {
  search(query: string): Promise<Document[]>
  add(documents: Document[]): Promise<void>
}
```

### 4. Strategy Pattern
Для різних типів скрапінгу:
- Documentation scraper
- API reference scraper  
- Generic web scraper

## Потоки даних

### 1. Скрапінг потік
```
URL Input → Scraper → Document Processing → Embeddings → ChromaDB
```

### 2. Query потік
```
User Query → Embeddings → Vector Search → Context Retrieval → LLM → Response
```

### 3. Real-time потік
```
Scraping Progress → Events → WebSocket/SSE → UI Updates
```

## Ключові технічні рішення

### 1. Векторна база даних
- **ChromaDB** - локальна, швидка, Python-friendly
- **OpenAI embeddings** - високоякісні векторні представлення
- **Collection-based organization** - окремі колекції для різних документацій

### 2. LLM Integration
- **GPT-4o-mini** - баланс якість/вартість
- **RAG pattern** - точні відповіді базуючись на контексті
- **Prompt engineering** - оптимізовані промпти для документації

### 3. Web Scraping
- **Puppeteer/Playwright-like approach** - динамічний контент
- **Content extraction** - структурований парсинг
- **Rate limiting** - повага до серверів документації

## Конфігурація та deployment

### Environment Variables
```bash
# RAG API Configuration
OPENAI_API_KEY=sk-...
CHROMA_DB_URL=http://localhost:8000
COLLECTION_NAME=default-docs

# Web App Configuration  
NEXT_PUBLIC_RAG_API_URL=http://localhost:8001
```

### Port Configuration
- **3006**: Next.js Web App
- **8000**: ChromaDB Vector Database
- **8001**: RAG API Server

## Виявлені патерни та обмеження

### Сильні сторони
1. **Модульність** - кожен компонент має чітку відповідальність
2. **Масштабованість** - можна легко додавати нові типи скраперів
3. **Гнучкість** - підтримка різних колекцій документації

### Поточні обмеження
1. **Відсутня інтеграція** - Web форма не підключена до CLI scraper
2. **Немає real-time feedback** - користувач не бачить прогрес скрапінгу
3. **Відсутнє session management** - немає зв'язку між запитом та результатом

### Технічний борг
1. Потрібен API endpoint для ініціювання скрапінгу
2. Система real-time прогресу (WebSocket або SSE)
3. Session management для відстеження стану обробки 