# 🚀 Гід по Серверах Doc Scrapper AI

## 📋 Швидкий старт

### 1. Якщо документація вже проскрейпена (ваш випадок):

```bash
# Запустити все разом (рекомендовано)
npm run dev:all

# Або окремо:
npm run dev:backend  # ChromaDB + RAG API
npm run web:dev      # Тільки веб-сайт
```

### 2. Якщо треба проскрейпити нову документацію:

```bash
# Скрейпинг (замість старого npm run dev)
npm run scrape https://docs.example.com

# Переіндексація (якщо змінили chunking)
npm run reindex
```

---

## 🌐 Сервери та Порти

| Сервер | Порт | Призначення | Команда |
|--------|------|-------------|---------|
| **ChromaDB** | 8000 | Векторна БД | `npm run chroma:start` |
| **RAG API** | 8001 | AI запити | `npm run rag:server` |
| **Web App** | 3000 | Сайт | `npm run web:dev` |

---

## 🔧 Корисні команди

### Перевірка статусу:
```bash
npm run health          # Перевірити RAG сервер
npm run rag:stats       # Статистика колекції
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

## 🗂️ Структура даних для різних документацій

**Поточна проблема**: Одна колекція для всіх документацій
**Майбутнє рішення**: Окремі колекції або namespace для кожного сайту

```
chroma/
├── ai-sdk-docs/           # AI SDK документація
├── react-docs/            # React документація  
├── nextjs-docs/           # Next.js документація
└── ...
```

**TODO**: Додати параметр `--collection-name` до індексації.

---

## ⚡ Швидкі дії

**Запустити систему:** `npm run dev:all`
**Відкрити сайт:** http://localhost:3000
**Тестувати API:** http://localhost:8001/health 