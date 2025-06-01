# Tech Context - Doc Scrapper

## Технічний стек

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Lucide Icons
- **UI Components**: Custom components з dark theme
- **State Management**: React hooks + Context API
- **HTTP Client**: Fetch API

### Backend Services

#### RAG API Server
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Integration**: OpenAI API (embeddings + GPT-4o-mini)
- **Vector DB Client**: ChromaDB JavaScript client
- **Port**: 8001

#### CLI Scraper
- **Language**: TypeScript (компільований в JavaScript)
- **Build Tool**: TSC (TypeScript Compiler)
- **Entry Point**: `/dist/index.js`
- **Dependencies**: 
  - Web scraping libraries
  - Document processing utilities
  - ChromaDB integration

#### Vector Database
- **Database**: ChromaDB
- **Port**: 8000
- **Storage**: Local persistent storage
- **API**: REST API для векторних операцій

## Структура проєкту

```
doc_scrapper/
├── parser-test-service/          # Web App (Next.js)
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   ├── components/           # React components
│   │   └── lib/                  # Utilities
│   ├── package.json
│   └── memory-bank/              # Memory Bank файли
├── dist/                         # Compiled CLI scraper
│   └── index.js
├── rag-api/                      # RAG API server
├── chroma-data/                  # ChromaDB data storage
└── scraped-docs/                 # Output директорія
```

## Environment Variables

### Required для RAG API
```bash
OPENAI_API_KEY=sk-...              # OpenAI API key
CHROMA_DB_URL=http://localhost:8000 # ChromaDB endpoint
COLLECTION_NAME=default-docs        # Default collection name
```

### Required для Web App
```bash
NEXT_PUBLIC_RAG_API_URL=http://localhost:8001  # RAG API endpoint
```

## Налаштування розробки

### Prerequisites
- **Node.js**: v18+ (рекомендовано v20)
- **npm**: v9+
- **TypeScript**: v5+
- **Python**: v3.8+ (для ChromaDB)

### Початкове налаштування
```bash
# 1. Install dependencies
cd parser-test-service
npm install

# 2. Build CLI scraper (якщо потрібно)
npm run build

# 3. Start ChromaDB (в окремому терміналі)
chroma run --host localhost --port 8000

# 4. Start RAG API (в окремому терміналі)
cd ../rag-api
npm start

# 5. Start Web App (в окремому терміналі)
cd ../parser-test-service
npm run dev
```

### Порти та сервіси
- **3006**: Next.js Development Server
- **8000**: ChromaDB Vector Database
- **8001**: RAG API Server

## Технічні обмеження

### Поточні обмеження
1. **Local-only deployment** - всі сервіси працюють локально
2. **Single-user mode** - немає мультитенантності
3. **Manual collection management** - немає UI для управління колекціями
4. **Limited error handling** - базове error handling

### Performance характеристики
- **Scraping speed**: залежить від розміру документації
- **Query response time**: ~1-3 секунди (включаючи LLM)
- **Concurrent users**: обмежено single-instance deployment

## Залежності та версії

### CLI Scraper Dependencies
```json
{
  "typescript": "^5.0.0",
  "node": ">=18.0.0"
}
```

### Web App Dependencies  
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "tailwindcss": "^3.0.0",
  "lucide-react": "latest"
}
```

### RAG API Dependencies
```json
{
  "express": "^4.18.0",
  "openai": "^4.0.0",
  "chromadb": "^1.5.0"
}
```

## Build та Deployment

### Development Mode
```bash
# Terminal 1: ChromaDB
chroma run --host localhost --port 8000

# Terminal 2: RAG API  
cd rag-api && npm start

# Terminal 3: Web App
cd parser-test-service && npm run dev
```

### Production Considerations
- **Environment variables** management
- **Process management** (PM2, systemd)
- **Nginx reverse proxy** для static files
- **Docker containers** для isolation
- **Database backup** strategy для ChromaDB

## Debugging та logging

### Логування
- **Console logs** у development mode
- **Error tracking** через console.error
- **ChromaDB logs** через database console

### Common debugging scenarios
1. **Port conflicts** - перевірити чи всі порти доступні
2. **API connectivity** - перевірити з'єднання між сервісами
3. **Environment variables** - валідація всіх required змінних
4. **ChromaDB connectivity** - перевірити статус vector database

## Безпека

### API Security
- **CORS** налаштовано для локального development
- **Environment variables** для sensitive data
- **Input validation** для user inputs

### Current security gaps
- Немає authentication/authorization
- Відсутнє rate limiting
- Немає input sanitization для scraping URLs 