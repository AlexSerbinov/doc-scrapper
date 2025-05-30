# Архітектура веб-сайту для Doc Scrapper

## 🎯 Концепція сайту

**AI-Powered Documentation Assistant** - Інтелектуальний помічник для пошуку та навігації по технічній документації.

## 🎨 UI/UX Дизайн

### Головна сторінка
- **Hero Section**: Великий заголовок + короткий опис + приклад запиту
- **Chat Interface**: Центральний елемент - розмовний інтерфейс 
- **Features Section**: Ключові можливості (швидкий пошук, посилання, багатомовність)
- **Stats**: Кількість індексованих документів, швидкість відповідей

### Chat Interface (основний компонент)
```
┌─────────────────────────────────────────┐
│  🤖 AI Documentation Assistant         │
├─────────────────────────────────────────┤
│  [Chat History]                         │
│  ┌─ User: Як використовувати AI SDK?    │
│  └─ Bot: Ось інструкція... [📖 Source] │
│                                         │
│  ┌─ User: Покажи приклад streaming      │
│  └─ Bot: [typing...] ✨                │
├─────────────────────────────────────────┤
│  💬 Type your question...        [Send]│
└─────────────────────────────────────────┘
```

### Sidebar (додатково)
- **Quick Actions**: Популярні запити
- **Recent Queries**: Історія запитів
- **Documentation Sections**: Навігація по розділах
- **Settings**: Мова, тема, API налаштування

## 🏗️ Технічна архітектура

### Frontend (Next.js 14)
```
web-app/
├── app/
│   ├── page.tsx                 # Головна сторінка з чатом
│   ├── api/
│   │   ├── chat/route.ts        # Chat API endpoint
│   │   ├── health/route.ts      # Health check
│   │   └── stats/route.ts       # Statistics API
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx    # Головний чат компонент
│   │   ├── MessageList.tsx      # Список повідомлень
│   │   ├── MessageBubble.tsx    # Окреме повідомлення
│   │   ├── QueryInput.tsx       # Поле вводу
│   │   ├── TypingIndicator.tsx  # Індикатор друку
│   │   └── SourceCard.tsx       # Картка джерела
│   ├── ui/
│   │   ├── Button.tsx           # Кнопки
│   │   ├── Input.tsx            # Поля вводу
│   │   ├── Card.tsx             # Картки
│   │   └── Badge.tsx            # Бейджики
│   ├── layout/
│   │   ├── Header.tsx           # Верхня панель
│   │   ├── Sidebar.tsx          # Бічна панель
│   │   └── Footer.tsx           # Футер
│   └── features/
│       ├── HeroSection.tsx      # Hero блок
│       ├── FeaturesSection.tsx  # Можливості
│       └── StatsSection.tsx     # Статистика
├── lib/
│   ├── ragClient.ts             # RAG API клієнт
│   ├── utils.ts                 # Утиліти
│   └── types.ts                 # TypeScript типи
├── hooks/
│   ├── useChat.ts               # Хук для чату
│   ├── useLocalStorage.ts       # Локальне збереження
│   └── useDebounce.ts           # Debounce хук
└── styles/
    └── globals.css              # TailwindCSS
```

## 🎨 Дизайн система

### Кольорова палітра
```css
/* Primary - Blue/Indigo */
--primary-50: #eff6ff
--primary-500: #3b82f6  
--primary-600: #2563eb
--primary-900: #1e3a8a

/* Secondary - Gray */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-500: #6b7280
--gray-900: #111827

/* Accent - Green (for success) */
--green-500: #10b981
--green-600: #059669

/* Warning - Amber */
--amber-500: #f59e0b
```

### Typography
- **Headers**: Inter font, weights 600-800
- **Body**: Inter font, weights 400-500  
- **Code**: JetBrains Mono font

### Компоненти
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Primary/Secondary variants, loading states
- **Messages**: Different styles for user/assistant
- **Sources**: Compact cards with preview

## 🚀 Ключові функції

### 1. Real-time Chat
- **Streaming responses**: Відповіді з'являються поступово
- **Typing indicators**: Показує коли бот "друкує"
- **Message history**: Зберігається в localStorage
- **Quick actions**: Швидкі кнопки для популярних запитів

### 2. Smart Source Links
- **Automatic linking**: Посилання генеруються автоматично
- **Preview cards**: Попередній перегляд без переходу
- **Direct navigation**: Кнопки для переходу на оригінальні сторінки
- **Highlight excerpts**: Виділення релевантних частин

### 3. Enhanced UX
- **Dark/Light mode**: Перемикач теми
- **Responsive design**: Адаптація для мобільних
- **Keyboard shortcuts**: Ctrl+Enter для відправки
- **Copy responses**: Кнопка копіювання відповідей

### 4. Analytics Dashboard (майбутнє)
- **Popular queries**: Найчастіші запити
- **Response quality**: Оцінки користувачів
- **Usage statistics**: Графіки використання

## 🔧 API Endpoints

### `/api/chat` (POST)
```typescript
// Request
{
  message: string;
  history?: ChatMessage[];
  sessionId?: string;
}

// Response (Streaming)
{
  content: string;
  sources: SourceLink[];
  isComplete: boolean;
}
```

### `/api/stats` (GET)
```typescript
// Response
{
  totalDocuments: number;
  totalChunks: number;
  averageResponseTime: number;
  popularQueries: string[];
}
```

## 📱 Responsive Breakpoints

- **Mobile**: 0-640px (single column, full-width chat)
- **Tablet**: 641-1024px (chat + minimal sidebar)
- **Desktop**: 1025px+ (full layout з sidebar)

## 🎯 User Experience Flow

1. **Landing**: Користувач бачить hero + приклади запитів
2. **First Query**: Вводить запитання в центральний чат
3. **Response**: Отримує streaming відповідь з джерелами
4. **Navigation**: Переходить за посиланнями або продовжує діалог
5. **History**: Може переглянути попередні запити в sidebar

## 🔮 Майбутні можливості

- **Multi-language**: Переклад інтерфейсу
- **Voice input**: Голосові запити
- **Export chat**: Збереження в PDF/Markdown
- **Collaborative**: Поділитися чатом з іншими
- **Integrations**: Slack/Discord боти

**Порт**: 3333 (унікальний для розробки)
**Theme**: Modern, clean, ChatGPT-inspired але з унікальними елементами 