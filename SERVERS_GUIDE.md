# 🚀 Гід по Серверах Doc Scrapper AI

## 📋 Швидкий старт

### 1. Запуск системи (ОНОВЛЕНО ✅):

```bash
# Універсальний restart всіх сервісів (НОВЕ!)
npm run restart         # Зупиняє та перезапускає всі сервери

# Або окремо:
npm run dev:all         # ChromaDB + RAG API + Web App
npm run dev:backend     # ChromaDB + RAG API
npm run web:dev         # Тільки веб-сайт
```

### 2. Зупинка системи:

```bash
# Зупинити всі сервіси (НОВЕ!)
npm run stop           # Вбиває процеси на портах 3000, 8000, 8001

# Або manually:
./stop.sh              # Bash скрипт для зупинки
```

### 3. Скрейпинг нової документації:

```bash
# Скрейпинг через форму на сайті (рекомендовано)
# Відкрити http://localhost:3000 та ввести URL

# Або через CLI:
npm run scrape https://docs.example.com

# Переіндексація:
npm run reindex
```

---

## 🌐 Сервери та Порти

| Сервер | Порт | Призначення | Команда | Статус |
|--------|------|-------------|---------|---------|
| **ChromaDB** | 8000 | Векторна БД | `npm run chroma:start` | ✅ ПРАЦЮЄ |
| **RAG API** | 8001 | AI запити | `npm run rag:server` | ✅ ПРАЦЮЄ |
| **Web App** | 3000 | Сайт | `npm run web:dev` | ✅ ПРАЦЮЄ |

---

## 🔧 Корисні команди

### Системні операції (ОНОВЛЕНО):
```bash
npm run restart         # ⭐ НОВЕ: Універсальний restart
npm run stop           # ⭐ НОВЕ: Зупинити всі сервіси
npm run health         # Перевірити RAG сервер
npm run rag:stats      # Статистика колекцій
```

### Multi-Collection система (НОВЕ ✅):
```bash
# Список всіх колекцій
curl http://localhost:8001/collections

# Запит до конкретної колекції
curl -X POST http://localhost:8001/query \
  -d '{"message":"test", "collectionName":"ai-sdk-dev-docs"}'

# Перемикання колекції
curl -X POST http://localhost:8001/switch-collection \
  -d '{"collectionName":"astro-test"}'
```

### Робота з даними:
```bash
npm run chroma:clean    # Очистити векторну БД
npm run reindex         # Переіндексувати документи
```

### Розробка:
```bash
npm run dev:all         # Все разом
npm run dev:backend     # Тільки бекенд
npm run web:dev         # Тільки фронтенд
```

---

## 🗂️ Multi-Collection Архітектура (РЕАЛІЗОВАНО ✅)

**Статус**: ✅ ПОВНІСТЮ ФУНКЦІОНАЛЬНА  
**Дата**: 31 травня 2025

### Поточні колекції:
```
📚 Активні колекції:
├── ai-sdk-dev-docs (6,358 документів)   # AI SDK документація
├── astro-test (6,216 документів)        # Astro документація  
└── doc-scrapper-docs (3,178 документів) # Doc Scrapper документація
```

### Групування по проектах:
- **ai**: ai-sdk-dev-docs
- **astro**: astro-test  
- **doc**: doc-scrapper-docs

### Функціонал:
- ✅ Collection Selector UI в веб-інтерфейсі
- ✅ Dynamic switching між колекціями
- ✅ Contextual AI відповіді з правильних джерел
- ✅ REST API для collection management
- ✅ Автоматичне створення колекцій при scraping

---

## 🚨 Troubleshooting

### Порти зайняті:
```bash
npm run stop           # Автоматично звільнить порти
# або manually:
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9  
lsof -ti:8001 | xargs kill -9
```

### ChromaDB проблеми:
```bash
# Перевірити чи працює ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# Рестарт ChromaDB
npm run chroma:restart
```

### RAG API проблеми:
```bash
# Перевірити health
curl http://localhost:8001/health

# Лог помилок
npm run rag:server --verbose
```

---

## ⚡ Швидкі дії

**Запустити систему:** `npm run restart` ⭐  
**Відкрити сайт:** http://localhost:3000  
**Тестувати API:** http://localhost:8001/health  
**Перевірити колекції:** http://localhost:8001/collections  
**Зупинити все:** `npm run stop` ⭐

---

## 🎯 Готові сценарії

### Повний цикл розробки:
1. `npm run restart` - запустити всі сервіси
2. Відкрити http://localhost:3000
3. Ввести URL документації у форму
4. Чекати завершення scraping + indexing
5. Використовувати AI chat з multi-collection підтримкою

### Production deployment:
1. Налаштувати environment variables (.env)
2. `npm run build` - build усіх компонентів
3. `npm run start` - production запуск
4. Налаштувати reverse proxy для портів 