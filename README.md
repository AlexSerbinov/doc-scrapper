# 📚 Doc Scrapper

**Універсальний скрапер документації з RAG-системою та інтелектуальним чат-ботом**

Автоматично витягує технічну документацію з веб-сайтів, індексує її у векторну базу даних та надає інтелектуальні відповіді на запитання з посиланнями на джерела.

## 🎯 Структура проєкту

У проєкті **два окремі додатки**:

### 1. **CLI Скрапер** (корінь папки)
- 🔧 **Node.js/TypeScript** додаток для скрапінгу та RAG
- 📄 Створює файли документації
- 💬 CLI чат з AI асистентом
- ⚡ Запуск: `npm run dev -- "URL" <параметри>`

### 2. **Веб-додаток** (папка `web-app/`)
- 🌐 **Next.js** інтерфейс з красивим UI
- 💻 Браузерний доступ до RAG системи  
- 📊 Статистика та візуалізація
- 🚀 Запуск: `npm run web:dev` (порт 3333)

## ✨ Ключові можливості

### 🔍 Інтелектуальний скрапінг
- **Автоматичне знаходження сторінок** через sitemap.xml або навігацію
- **Розумна екстракція контенту** без навігації, реклами та зайвих елементів
- **Структурована організація** файлів відповідно до оригінального сайту
- **Етичний підхід** з дотриманням robots.txt та rate limiting

### 🤖 RAG-система (Retrieval-Augmented Generation)
- **Векторна індексація** документів через OpenAI embeddings
- **Семантичний пошук** релевантного контенту
- **Інтелектуальні відповіді** з використанням GPT-4o-mini
- **Посилання на джерела** в кожній відповіді

### 💬 Чат-бот інтерфейс
- **CLI чат** для швидкого доступу до документації
- **Веб-інтерфейс** (в розробці) з сучасним UI
- **Автоматичні редіректи** на оригінальні сторінки документації
- **Контекстні відповіді** з витягами та посиланнями

## 🚀 Швидкий старт

### Встановлення

```bash
# Клонування репозиторію
git clone https://github.com/your-username/doc_scrapper.git
cd doc_scrapper

# Встановлення залежностей CLI
npm install

# Встановлення залежностей веб-додатку
npm run web:install

# Компіляція TypeScript
npm run build
```

### Налаштування

1. **Створіть .env файл:**
```bash
cp env-template.txt .env
```

2. **Додайте ваші API ключі в .env:**
```bash
# Обов'язково для RAG системи
OPENAI_API_KEY=sk-your-openai-api-key-here

# Опціонально
COHERE_API_KEY=your-cohere-api-key-here
```

3. **Встановіть та запустіть ChromaDB:**
```bash
pip install chromadb
export PATH="/Users/$USER/Library/Python/3.9/bin:$PATH"
chroma run --host localhost --port 8000
```

## 📋 NPM Scripts

### CLI Команди
```bash
# 🔍 Скрапінг документації (дефолт: 25 сторінок за раз, 10сек пауза)
npm run dev -- "https://ai-sdk.dev/docs" 

# ⚙️ З кастомними параметрами  
npm run dev -- "https://ai-sdk.dev/docs" -c 5 -d 2000 -m 50

# 🏗️ Компіляція TypeScript
npm run build

# 🤖 RAG команди
npm run rag:index    # Індексування документів
npm run rag:chat     # CLI чат з AI

# 🧪 Тестування та якість коду
npm run test
npm run lint
npm run format
```

### Веб-додаток команди
```bash
# 🌐 Запуск веб-додатку (localhost:3333)
npm run web:dev

# 📦 Збірка для продакшену  
npm run web:build

# 📋 Встановлення залежностей веб-додатку
npm run web:install
```

## 🔧 **ВАЖЛИВО: Синтаксис параметрів**

**ПРАВИЛЬНО** ✅:
```bash
npm run dev -- "https://ai-sdk.dev/docs" -c 10 -d 2000
```

**НЕПРАВИЛЬНО** ❌:
```bash
npm run dev "https://ai-sdk.dev/docs" -c 10    # Без --
```

> **Пояснення**: `--` каже npm передати всі наступні параметри до CLI програми

## 📖 Детальне використання

### Скрапінг документації

```bash
# Базовий скрапінг (дефолт: 25 сторінок, 10сек пауза)
npm run dev -- "https://docs.example.com"

# З налаштуваннями
npm run dev -- "https://ai-sdk.dev/docs/introduction" \
  -o ./my-docs \
  -f markdown \
  -m 100 \
  -c 5 \
  -d 1500 \
  --verbose

# З фільтрацією
npm run dev -- "https://docs.example.com" \
  --include "/docs,/guide,/api" \
  --exclude "/legacy,/deprecated"
```

**Опції CLI:**
- `-o, --output <dir>` - Папка для збереження (за замовчуванням: `./scraped-docs`)
- `-f, --format <format>` - Формат: `markdown`, `json`, `html`
- `-c, --concurrency <number>` - Паралельні запити (за замовчуванням: `25`)
- `-d, --delay <ms>` - Затримка між запитами (за замовчуванням: `10000`)
- `-m, --max-pages <number>` - Максимум сторінок (за замовчуванням: без обмежень)
- `--include <patterns>` - Включити тільки URL з паттернами
- `--exclude <patterns>` - Виключити URL з паттернами
- `-v, --verbose` - Детальний вивід

### RAG система

```bash
# Індексування документів
npm run rag:index <path-to-docs> [options]

# Опції індексування:
npm run rag:index scraped-docs/ --reset --verbose

# Інтерактивний чат
npm run rag:chat

# Одиночний запит
npm run rag:chat --query "How to use AI SDK?"

# З детальною інформацією
npm run rag:chat --verbose
```

**Команди в чаті:**
- `/help` - Допомога
- `/stats` - Статистика колекції
- `/quit` або `/exit` - Вихід

### Веб-додаток

```bash
# Запуск локального сервера
npm run web:dev

# Відкрийте браузер на http://localhost:3333
# Інтерфейс включає:
# - Hero section з градієнтами та анімаціями  
# - Chat interface для спілкування з AI
# - Stats dashboard з метриками RAG системи
# - Responsive дизайн для всіх пристроїв
```

## 🏗️ Архітектура

### Компоненти скрапінгу
```
src/
├── core/           # Основна логіка скрапінгу
├── extractors/     # Стратегії витягування контенту
├── formatters/     # Конвертери у різні формати
├── storage/        # Адаптери збереження
└── utils/          # Допоміжні утиліти
```

### RAG система
```
src/rag/
├── chunking/       # Розбивка документів на частини
├── embedding/      # Генерація embeddings
├── vectorstore/    # Векторна база даних (ChromaDB)
├── retrieval/      # Пошук релевантного контенту
├── generation/     # Генерація відповідей (LLM)
├── core/           # Координація RAG pipeline
└── cli/            # CLI інтерфейси
```

## 🛠️ Технології

### Core Stack
- **TypeScript** - Строга типізація
- **Node.js** v24+ - Runtime
- **Cheerio** - HTML parsing
- **Axios** - HTTP клієнт
- **Commander.js** - CLI framework

### RAG Stack
- **ChromaDB** - Векторна база даних
- **OpenAI** - Embeddings та LLM
- **AI SDK** - Vercel AI SDK v3.0
- **UUID** - Унікальні ідентифікатори

### Майбутні технології (веб-додаток)
- **Next.js 14+** - Full-stack framework
- **TailwindCSS** - Стилізація
- **shadcn/ui** - UI компоненти

## 📊 Результати тестування

### Тест на ai-sdk.dev (50 сторінок)
- ✅ **487 URL** знайдено через sitemap.xml
- ✅ **53 секунди** час скрапінгу
- ✅ **51 файл** створено (280KB)
- ✅ **Якісний Markdown** з метаданими
- ✅ **Структурована організація** файлів

### RAG система
- ✅ **488 документів** готові до індексації
- ✅ **4812 chunks** семантичних блоків
- ✅ **ChromaDB** працює локально
- ✅ **CLI команди** повністю функціональні

## 🔧 Розробка

```bash
# Розробка з watch mode
npm run dev

# Компіляція
npm run build

# Тестування
npm test

# Лінтинг
npm run lint

# Форматування коду
npm run format
```

## 🌐 Планований веб-додаток

### Функції (в розробці)
- 💬 **Інтерактивний чат-бот** з сучасним UI
- 🔗 **Автоматичні посилання** на оригінальну документацію
- 📱 **Responsive дизайн** для всіх пристроїв
- ⚡ **Real-time відповіді** через WebSocket
- 📚 **Попередній перегляд** витягів з документації
- 🔍 **Фільтрація по джерелах** та типах контенту
- 📝 **Історія чату** та закладки

### Технічна архітектура
- **Frontend**: Next.js з TypeScript
- **Backend**: Next.js API routes
- **RAG інтеграція**: Використання існуючих компонентів
- **Real-time**: Server-Sent Events або WebSocket
- **Стилізація**: TailwindCSS + shadcn/ui

## 📋 Приклади використання

### Скрапінг популярних документацій

```bash
# AI SDK документація
node dist/index.js https://ai-sdk.dev/docs/introduction -o ./ai-sdk-docs

# Next.js документація
node dist/index.js https://nextjs.org/docs -o ./nextjs-docs --include="/docs"

# React документація
node dist/index.js https://react.dev/learn -o ./react-docs
```

### Робота з RAG системою

```bash
# Індексувати кілька джерел
npm run rag:index ./ai-sdk-docs --verbose
npm run rag:index ./nextjs-docs --verbose

# Запитати про конкретну технологію
npm run rag:chat --query "How to implement streaming in AI SDK?"
npm run rag:chat --query "What are React Server Components?"
```

## 🛡️ Етика та обмеження

### Етичні принципи
- ✅ Дотримання `robots.txt`
- ✅ Rate limiting (мін. 1 сек між запитами)
- ✅ Дружелюбний User-Agent
- ✅ Повне логування для аудиту

### Технічні обмеження
- **ChromaDB**: Потребує локального сервера (port 8000)
- **API ключі**: OpenAI API key обов'язковий для RAG
- **Пам'ять**: Великі колекції можуть споживати багато RAM
- **Швидкість**: Початкова індексація може тривати довго

## 📚 Підтримувані сайти

Протестовано та працює з:
- ✅ **GitBook** документація
- ✅ **Docusaurus** сайти
- ✅ **Next.js/React** документація
- ✅ **AI SDK** та подібні API docs
- ✅ Стандартні HTML сайти з навігацією
- ✅ Сайти з `sitemap.xml`

## 🤝 Внесок у розвиток

1. **Fork** репозиторію
2. Створіть **feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit** зміни: `git commit -m 'Add amazing feature'`
4. **Push** до branch: `git push origin feature/amazing-feature`
5. Відкрийте **Pull Request**

## 📄 Ліцензія

MIT License - дивіться [LICENSE](LICENSE) файл для деталей.

## 🙏 Подяки

- **Vercel AI SDK** - За чудовий AI framework
- **ChromaDB** - За локальну векторну базу даних
- **OpenAI** - За потужні embeddings та LLM моделі
- **Open Source спільнота** - За інспірацію та інструменти

---

**🔗 Корисні посилання:**
- [📖 Документація](./docs)
- [🐛 Звітувати про баг](https://github.com/your-username/doc_scrapper/issues)
- [💡 Запропонувати функцію](https://github.com/your-username/doc_scrapper/issues)
- [💬 Обговорення](https://github.com/your-username/doc_scrapper/discussions) 