# Resolved Problems - Doc Scrapper

## Огляд
Цей файл містить детальний опис складних проблем, які були успішно вирішені під час розробки doc scrapper. Кожен запис включає симптоми проблеми, кроки діагностики та остаточне рішення.

---

*Поки що немає вирішених проблем - проєкт тільки розпочався*

---

## Шаблон для додавання нових записів:

### [Дата] - [Назва проблеми]
**Симптоми:**
- Опис того, що відбувалося

**Діагностика:**
- Кроки, які були зроблені для виявлення причини

**Рішення:**
- Детальний опис того, як проблему було вирішено
- Код або конфігурація, які допомогли

**Запобігання:**
- Як уникнути цієї проблеми в майбутньому 

## Проблема: ChromaDB API сумісність (2024-12-19)
**Симптоми**: 
- Помилки імпорту `ChromaApi`
- Версія 1.5.0 використовує `ChromaClient` замість `ChromaApi`
- Відсутність `openai` пакету для `OpenAIEmbeddingFunction`

**Діагностика**: 
- ChromaDB змінила API в новій версії
- Неправильні імпорти в коді RAG системи

**Рішення**:
1. Оновлено імпорти: `ChromaClient` замість `ChromaApi`
2. Встановлено `openai` пакет: `npm install openai`
3. Виправлено ініціалізацію клієнта в `ragPipeline.ts`

**Статус**: ✅ ВИРІШЕНО

## Проблема: RAG система ініціалізація (2024-12-19)
**Симптоми**: 
- `getCollectionInfo()` викликався без ініціалізації vector store
- Помилки при перевірці статусу колекції

**Діагностика**: 
- Відсутність методу `initialize()` в `DocumentationRAGPipeline`
- Неправильний порядок викликів в CLI

**Рішення**:
1. Додано метод `initialize()` в `DocumentationRAGPipeline`
2. Виправлено `chat.ts` для правильної ініціалізації
3. Налаштовано послідовність: initialize() → getCollectionInfo() → query()

**Статус**: ✅ ВИРІШЕНО

## Проблема: Next.js Build помилки (2024-12-20) ⭐ НОВИЙ
**Симптоми**: 
1. ESLint помилки з невикористовуваними змінними
2. Syntax error з довгим URL в className
3. TypeScript помилки з empty interface
4. React помилки з неескейпованими лапками

**Діагностика**: 
- Довгий `data:image/svg+xml` URL в Tailwind className
- Невикористовувані параметри в API routes
- Порожній інтерфейс InputProps
- HTML entities в JSX

**Рішення**:
1. **URL в className**: Винесено в змінну `backgroundPattern`
```typescript
const backgroundPattern = "data:image/svg+xml...";
<div style={{ backgroundImage: `url("${backgroundPattern}")` }} />
```

2. **ESLint невикористовувані змінні**: Видалено або змінено параметри
```typescript
// Було: export async function GET(request: NextRequest)
// Стало: export async function GET()
```

3. **Empty interface**: Додано властивість variant
```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error';
}
```

4. **HTML entities**: Замінено лапки на `&ldquo;` та `&rdquo;`

5. **CSS помилка**: Виправлено `@apply border-border` на `border-color: hsl(var(--border))`

**Статус**: ✅ ВИРІШЕНО

## Проблема: RAG імпорти в Next.js (2024-12-20) ⭐ НОВИЙ
**Симптоми**: 
- Не можна імпортувати `../../rag/core/ragPipeline.js` в Next.js
- Module resolution помилки
- TypeScript декларації не знайдено

**Діагностика**: 
- Next.js та основний проєкт мають різні модульні системи
- Шляхи до RAG системи не працюють з web-app/

**ТИМЧАСОВЕ РІШЕННЯ** ⚠️:
Створено mock RAG клієнт з заглушками:
```typescript
// web-app/src/lib/ragClient.ts
async query(message: string): Promise<ChatResponse> {
  // Mock response замість реальної RAG системи
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { content: mockContent, sources: mockSources, ... };
}
```

**ПОТРЕБУЄ ПОСТІЙНОГО РІШЕННЯ**:
1. Налаштувати symlinks або monorepo структуру
2. Створити окремий API сервер для RAG
3. Або винести RAG в npm пакет

**Статус**: ⚠️ ЧАСТКОВО ВИРІШЕНО (через mock)

## Проблема: TailwindCSS border-border utility (2024-12-20) ⭐ НОВИЙ
**Симптоми**: 
- Build помилка: "Cannot apply unknown utility class `border-border`"
- CSS compilation fails

**Діагностика**: 
- `@apply border-border` не розпізнається TailwindCSS
- Неправильне використання CSS змінних

**Рішення**:
```css
/* Було */
@layer base {
  * {
    @apply border-border;
  }
}

/* Стало */
@layer base {
  * {
    border-color: hsl(var(--border));
  }
}
```

**Статус**: ✅ ВИРІШЕНО

## Проблема: Запуск Bitcoin Core (2024-12-19)
**Симптоми**: Bitcoin Core не запускався, помилки з ініціалізацією
**Діагностика**: Конфлікт версій та неправильні шляхи
**Рішення**: Перевстановлено через Homebrew з правильною конфігурацією
**Статус**: ✅ ВИРІШЕНО

## Проблема: Передача параметрів через npm scripts (2024-12-20) ⭐ НОВИЙ
**Симптоми**: 
- `npm run dev "URL" -c 10` не працює
- Параметри не передаються до CLI програми
- "error: missing required argument 'url'" при спробі передати аргументи

**Діагностика**: 
- npm scripts не передають аргументи автоматично
- Потрібен спеціальний синтаксис для передачі параметрів
- Користувач не знав про подвійний дефіс `--`

**Рішення**:
Використовувати подвійний дефіс `--` для передачі аргументів через npm:
```bash
# ПРАВИЛЬНО ✅
npm run dev -- "https://ai-sdk.dev/docs" -c 10 -d 1000

# НЕПРАВИЛЬНО ❌ 
npm run dev "https://ai-sdk.dev/docs" -c 10
```

**Пояснення**:
- `--` каже npm передати всі наступні аргументи до програми
- Без `--` npm намагається інтерпретувати параметри як власні опції
- URL треба брати в лапки для захисту від спеціальних символів

**Статус**: ✅ ВИРІШЕНО

## Проблема: Глобальний Layout веб-додатку (31.05.2025) ⭐ НОВИЙ

**Симптоми**:
- Контент розтягувався на всю ширину браузера
- Відсутнє центрування та обмеження максимальної ширини
- Елементи накладалися один на одного
- Все зрушувалося "до лівого боку"
- Фіксований header перекривав основний контент

**Діагностика**:
Проблема була в CSS файлі `web-app/src/app/globals.css`:
1. **Неправильний viewport**: `max-width: 100vw` + `overflow-x: hidden` створювали horizontal overflow
2. **Агресивний reset**: `* { padding: 0; margin: 0; }` конфліктував з Tailwind Preflight 
3. **Відсутність відступу від header**: `<main>` не компенсував `h-16` фіксованого header'а

**Рішення**:
1. **Очистив globals.css** - видалив проблемні CSS правила:
```css
/* ВИДАЛЕНО - проблемні правила */
html, body {
  max-width: 100vw;        /* Викликало viewport issues */
  overflow-x: hidden;      /* Приховувало симптоми */
}

* {
  padding: 0;             /* Конфліктував з Tailwind */
  margin: 0;              
}
```

2. **Виправив layout.tsx** - додав відступ від header:
```typescript
// Було
<main className="min-h-screen">

// Стало  
<main className="min-h-screen pt-16">  // pt-16 компенсує h-16 header'а
```

3. **Залишив чистий Tailwind** у globals.css:
```css
@import "tailwindcss";
@tailwind base;
@tailwind components; 
@tailwind utilities;
/* + proper @layer structures */
```

**Технічне пояснення**:
- `max-width: 100vw` включає ширину scrollbar, що створює horizontal overflow
- `overflow-x: hidden` приховує scrollbar але не виправляє основну проблему
- Агресивний `* { padding: 0; margin: 0; }` конфліктує з Tailwind Preflight normalization

**Результат**:
✅ Layout повністю виправлений
✅ Правильне центрування контенту
✅ Адаптивні відступи на всіх екранах
✅ Header не перекриває контент
✅ Немає horizontal scroll issues

**Запобігання**:
- Використовувати Tailwind utilities замість custom CSS для layout
- Не додавати `overflow-x: hidden` без розуміння причини overflow
- Не дублювати Tailwind Preflight з власними global resets
- Завжди компенсувати фіксовані позиціоновані елементи відповідними відступами

**Статус**: ✅ ПОВНІСТЮ ВИРІШЕНО

## Загальні уроки
1. **Module systems**: Next.js та TypeScript проєкти мають різні підходи до імпортів
2. **Build tools**: ESLint та TypeScript можуть блокувати build навіть при working коді
3. **Incremental development**: Mock systems дозволяють швидко прототипувати UI
4. **CSS frameworks**: TailwindCSS має специфічні правила для CSS змінних 
5. **Layout debugging**: CSS проблеми можуть здаватися функціональними, але корінь в styling
6. **Viewport issues**: Комбінація `max-width: 100vw` + `overflow-x: hidden` = класична пастка

## Проблема #1: Запуск Bitcoin Core на macOS (25.05.2025)

**Симптоми:**
- Bitcoin Core daemon не запускався
- Помилки з конфігурацією ports
- Конфлікт версій

**Діагностика:**
- Неправильні шляхи в конфігурації
- Застарілі залежності

**Рішення:**
- Перевстановлення через Homebrew
- Оновлення конфігураційного файлу
- Правильні permissions для директорій

**Статус:** ✅ ВИРІШЕНО