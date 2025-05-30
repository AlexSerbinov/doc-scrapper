## Аналіз Проекту та План Виправлень

Після детального аналізу коду виявлено низку проблем, що спричиняють "зламаний" лейаут та некоректне відображення на різних пристроях. Основні проблеми пов'язані з відсутністю або неправильним використанням обмежуючих контейнерів для контенту, некоректною обробкою фіксованого хедера та потенційними конфліктами у глобальних стилях.

Нижче наведено детальний звіт із виявленими проблемами та запропонованими виправленнями для кожного відповідного файлу.

---

### 1. Глобальний Лейаут та Стилі

#### Файл: `src/app/layout.tsx`

*   **Проблема:** Фіксований хедер (`Header.tsx` має `fixed`) перекриває верхню частину основного контенту (`<main>`), оскільки для `<main>` не задано верхній відступ, що компенсував би висоту хедера. Висота хедера становить `h-16` (4rem або 64px).
*   **Виправлення:** Додати клас `pt-16` до тегу `<main>`, щоб контент починався під хедером.

```diff
--- a/src/app/layout.tsx
+++ b/src/app/layout.tsx
@@ -22,7 +22,7 @@
       <body className={`${inter.className} antialiased bg-slate-900 text-slate-100`}>
         <div className="min-h-screen flex flex-col">
           <Header />
-          <main className="flex-1">
+          <main className="flex-1 pt-16">
             {children}
           </main>
           <Footer />

```

#### Файл: `src/app/globals.css`

*   **Проблема 1:** Директива `overflow-x: hidden;` на `html, body` приховує проблеми з горизонтальним переповненням, замість того, щоб дозволити їх виявити та виправити.
*   **Проблема 2:** Наявність як `@import "tailwindcss";` (для Tailwind v4+), так і директив `@tailwind base; @tailwind components; @tailwind utilities;` може призвести до конфліктів або подвійного завантаження стилів.
*   **Проблема 3:** Дублювання визначень CSS змінних для теми (наприклад, кольори `--primary`, `--background` тощо), які вже мають керуватися через `tailwind.config.ts`.
*   **Проблема 4:** Глобальний reset `* { padding: 0; margin: 0; }` дублює функціонал Tailwind Preflight.
*   **Виправлення:**
    1.  Видалити `overflow-x: hidden;` з `html, body`.
    2.  Залишити тільки `@import "tailwindcss";` для імпорту базових стилів Tailwind. Видалити окремі директиви `@tailwind base/components/utilities;`.
    3.  Видалити дублюючі визначення CSS змінних для теми, покладаючись на конфігурацію в `tailwind.config.ts`.
    4.  Видалити глобальний reset, оскільки Tailwind Preflight вже виконує цю функцію.
    5.  Упорядкувати решту кастомних стилів у відповідних шарах (`@layer base`, `@layer components`, `@layer utilities`).

```css
/* web-app/src/app/globals.css */
@import "tailwindcss"; /* Tailwind v4+ main import. Handles base, components, utilities. */

:root {
  /* Глобальні змінні, які не керуються Tailwind, якщо вони дійсно потрібні. */
  /* Наприклад, для градієнта body, якщо він не з Tailwind кольорів. */
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 15, 23, 42;  /* slate-900 */
  --background-end-rgb: 30, 41, 59;    /* slate-800 */
}

/*
  Видалено блок @theme inline {...} - для Tailwind v4 краще використовувати @theme {} або tailwind.config.ts.
  Змінні --color-background, --color-foreground, --font-sans, --font-mono вже визначені
  або керуються через tailwind.config.ts та next/font.
*/

html {
  color-scheme: dark; /* Підтримує системні переваги темної теми */
  scroll-behavior: smooth;
}

body {
  /* Кольори та фон вже встановлені в RootLayout через Tailwind класи bg-slate-900, text-slate-100. */
  /* Якщо потрібен специфічний градієнт, який неможливо досягти класами Tailwind: */
  background: linear-gradient(180deg, rgb(var(--background-start-rgb)), rgb(var(--background-end-rgb)));
  min-height: 100vh;
  max-width: 100%; /* Замість 100vw, щоб уникнути проблем зі скролбаром */
  /* overflow-x: hidden; -- ВИДАЛЕНО для діагностики проблем з шириною! */
}

/*
  * { box-sizing: border-box; padding: 0; margin: 0; } -- ВИДАЛЕНО. Це робить Tailwind Preflight.
*/

a {
  color: inherit;
  text-decoration: none;
}

/* ВИДАЛЕНО директиви @tailwind base; @tailwind components; @tailwind utilities; */

/* Кастомні CSS змінні для теми (HSL), визначені в @layer base нижче, можуть дублювати
   те, що має бути в tailwind.config.ts. Рекомендовано тримати конфігурацію теми
   в tailwind.config.ts.
*/
@layer base {
  /*
    :root { ... HSL variables ... } -- ВИДАЛЕНО. Це вже має бути в tailwind.config.ts.
    Tailwind автоматично генерує CSS змінні для кольорів з конфігу.
  */

  /* * { border-color: hsl(var(--border)); } -- ВИДАЛЕНО. Tailwind робить це для класів border-* */
  
  /*
    body {
      color: hsl(var(--foreground));
      background: hsl(var(--background));
      -- ВИДАЛЕНО. Ці стилі вже задані в RootLayout.tsx Tailwind класами.
    }
  */

  /* Smooth focus transitions - перенесено до @layer utilities як .focus-ring */
  
  /* Code syntax highlighting improvements - перенесено до @layer utilities */
}

@layer components {
  .glass-effect {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .gradient-text { /* Залишено одне визначення, що використовує CSS змінні */
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-foreground)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

@layer utilities {
  .line-clamp-1 { /* ... без змін ... */ }
  .line-clamp-2 { /* ... без змін ... */ }
  .line-clamp-3 { /* ... без змін ... */ }

  .scrollbar-thin { /* ... без змін ... */ }
  
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900;
  }

  .backdrop-blur-light { /* ... без змін ... */ }

  .prose code {
    @apply text-blue-300 bg-slate-800 px-1 py-0.5 rounded text-sm font-mono;
  }
  .prose pre {
    @apply bg-slate-900 border border-slate-600 overflow-x-auto;
  }
  .prose pre code {
    @apply bg-transparent text-slate-200 p-0;
  }

  .message-enter { /* ... без змін ... */ }
  @keyframes messageEnter { /* ... без змін ... */ }

  .typing-dot { /* ... без змін ... */ }
  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }
  @keyframes typingDot { /* ... без змін ... */ }

  .interactive { /* ... без змін ... */ }
  .interactive:hover { /* ... без змін ... */ }

  .glass { /* Це визначення .glass відрізняється від .glass-effect, можливо, одне з них зайве */
    background: rgba(15, 23, 42, 0.7); /* slate-900 з прозорістю */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  /* .gradient-text - визначення з конкретними кольорами, ВИДАЛЕНО на користь варіанту з CSS змінними вище */

  /* Custom scrollbar - класи з префіксом scrollbar-* вже є в Tailwind v3+, або можна зробити як плагін */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .animate-fade-in { /* ... без змін ... */ }
  @keyframes fadeIn { /* ... без змін ... */ }

  .pulse-animation { /* ... без змін ... */ }
  @keyframes pulse { /* ... без змін ... */ }
}

/* Кастомний скролбар для Webkit (може конфліктувати з .scrollbar-thin) - ВИДАЛЕНО, якщо .scrollbar-thin достатньо. */
/* ::-webkit-scrollbar { ... } */
/* ::-webkit-scrollbar-track { ... } */
/* ::-webkit-scrollbar-thumb { ... } */
/* ::-webkit-scrollbar-thumb:hover { ... } */
```
**Примітка:** `globals.css` потребує ретельного аудиту для усунення всіх дублювань та узгодження з `tailwind.config.ts`. Наведені зміни є основними рекомендаціями.

---

### 2. Компоненти Лейауту Головної Сторінки

Загальна проблема для секцій `HeroSection`, `FeaturesSection`, `HowItWorksSection`, `PricingSection`: горизонтальні відступи (`px-*`) застосовуються до зовнішнього тегу `<section>`, а не до внутрішнього `div` з класами `max-w-* mx-auto`. Це призводить до неправильних відступів контенту від країв екрану.

**Правильний підхід:**
```html
<section class="bg-color py-Y"> <!-- Фон на всю ширину, вертикальні відступи -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Обмеження ширини, центрування, горизонтальні відступи -->
    <!-- Контент секції -->
  </div>
</section>
```

#### Файл: `src/components/layout/HeroSection.tsx`

*   **Проблема:** `px-4` застосовано до `<section>`, а не до внутрішнього `div.max-w-4xl.mx-auto`. Хоча для Hero секції з `text-center` це може бути менш критично, для консистентності краще виправити. `pt-20` може потребувати корекції, якщо `pt-16` було додано до `<main>` в `layout.tsx` (щоб уникнути подвійного відступу). Однак, `min-h-screen pt-20` може бути спеціальним дизайнерським рішенням для першого екрану, тому залишимо `pt-20` без змін, припускаючи, що це бажаний великий відступ зверху для Hero.
*   **Виправлення:** Перенести `px-4` (та додати адаптивні `sm:px-6 lg:px-8`) до внутрішнього `div`.

```diff
--- a/src/components/layout/HeroSection.tsx
+++ b/src/components/layout/HeroSection.tsx
@@ -20,11 +20,11 @@
   return (
     <>
       <section
         id="hero"
-        className="min-h-screen bg-slate-900 pt-20 flex items-center justify-center px-4"
+        className="min-h-screen bg-slate-900 pt-20 flex items-center justify-center" // Видалено px-4
       >
-        <div className="max-w-4xl mx-auto text-center w-full">
+        <div className="max-w-4xl mx-auto text-center w-full px-4 sm:px-6 lg:px-8"> {/* Додано px-* тут */}
           {/* Заголовок */}
           <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-6 leading-tight">
             Розблокуйте Силу Вашої{" "}

```

#### Файл: `src/components/layout/FeaturesSection.tsx`

*   **Проблема:** `px-4` на `<section>`, внутрішній `div` не має горизонтальних відступів.
*   **Виправлення:** Видалити `px-4` з `<section>` та додати `px-4 sm:px-6 lg:px-8` до внутрішнього `div.max-w-7xl.mx-auto`.

```diff
--- a/src/components/layout/FeaturesSection.tsx
+++ b/src/components/layout/FeaturesSection.tsx
@@ -39,8 +39,8 @@
   ];
 
   return (
-    <section id="features" className="bg-slate-900 py-16 sm:py-20 px-4">
-      <div className="max-w-7xl mx-auto">
+    <section id="features" className="bg-slate-900 py-16 sm:py-20">
+      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Заголовок секції */}
         <div className="text-center mb-12 sm:mb-16">
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4">

```

#### Файл: `src/components/layout/HowItWorksSection.tsx`

*   **Проблема:** Аналогічно `FeaturesSection`.
*   **Виправлення:** Аналогічно `FeaturesSection`.

```diff
--- a/src/components/layout/HowItWorksSection.tsx
+++ b/src/components/layout/HowItWorksSection.tsx
@@ -51,8 +51,8 @@
   ];
 
   return (
-    <section id="how-it-works" className="bg-slate-900 py-16 sm:py-20 px-4">
-      <div className="max-w-7xl mx-auto">
+    <section id="how-it-works" className="bg-slate-900 py-16 sm:py-20">
+      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Заголовок секції */}
         <div className="text-center mb-12 sm:mb-16">
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4">

```

#### Файл: `src/components/layout/PricingSection.tsx`

*   **Проблема:** Аналогічно `FeaturesSection`.
*   **Виправлення:** Аналогічно `FeaturesSection`.

```diff
--- a/src/components/layout/PricingSection.tsx
+++ b/src/components/layout/PricingSection.tsx
@@ -75,8 +75,8 @@
   };
 
   return (
-    <section id="pricing" className="bg-slate-900 py-16 sm:py-20 px-4">
-      <div className="max-w-7xl mx-auto">
+    <section id="pricing" className="bg-slate-900 py-16 sm:py-20">
+      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Заголовок секції */}
         <div className="text-center mb-12 sm:mb-16">
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4">

```

#### Файл: `src/components/layout/Footer.tsx`

*   **Проблема:** Повідомлялося, що "Footer повністю зламаний". Однак, код футера виглядає структурно правильним (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` та адаптивна сітка колонок `grid-cols-1 md:grid-cols-4`). Ймовірно, проблеми з лейаутом на решті сторінки (розтягування контенту) візуально "ламали" і футер.
*   **Виправлення:** Прямих виправлень у самому коді футера не виявлено як необхідних. Виправлення контейнерів в інших секціях та глобальних стилів мають позитивно вплинути на відображення футера.

---

### 3. Компоненти Сторінки Демонстрації (`/demo`)

#### Файл: `src/app/demo/[id]/page.tsx`

*   **Проблема:** Основний `div` цієї сторінки не має відступу зверху для компенсації фіксованого хедера. Це призведе до того, що `TrialInfoBar` буде частково перекритий хедером.
*   **Виправлення:** Це вже вирішено додаванням `pt-16` до `<main>` в `src/app/layout.tsx`. Якщо з якихось причин це рішення не застосовується глобально, то потрібно було б додати `pt-16` до кореневого `div` тут.

#### Файл: `src/components/demo/ChatInterface.tsx`

*   **Проблема:** Компонент `ExampleQueries` відображається всередині `div` з класом `px-4 pb-4`, але цей `div` не має обмеження по ширині (`max-w-*`). Це може призвести до того, що кнопки прикладів запитів будуть розтягуватися на всю ширину чат-інтерфейсу, яка, в свою чергу, може бути ширшою за `max-w-4xl`, встановлений для `MessageList` та `QueryInputArea`.
*   **Виправлення:** Обгорнути `ExampleQueries` у внутрішній `div` з класами `max-w-4xl mx-auto`, щоб узгодити його ширину з іншими елементами чату.

```diff
--- a/src/components/demo/ChatInterface.tsx
+++ b/src/components/demo/ChatInterface.tsx
@@ -80,11 +80,13 @@
 
       {/* Example Queries - показуємо тільки якщо є тільки початкове повідомлення */}
       {messages.length === 1 && (
-        <div className="px-4 pb-4">
-          <ExampleQueries 
-            onSelectQuery={handleSendMessage}
-            disabled={isLoading}
-          />
+        <div className="px-4 pb-4"> {/* Зовнішній div для відступів */}
+          <div className="max-w-4xl mx-auto"> {/* Внутрішній div для обмеження ширини, як у MessageList/QueryInputArea */}
+            <ExampleQueries
+              onSelectQuery={handleSendMessage}
+              disabled={isLoading}
+            />
+          </div>
         </div>
       )}
 
```

---

### Очікуваний Результат після Виправлень:

1.  **Обмеження ширини контенту:** Усі основні секції сторінки будуть правильно обмежені по ширині (`max-w-7xl` або `max-w-4xl` відповідно) та центровані з коректними бічними відступами (`px-4 sm:px-6 lg:px-8`).
2.  **Компенсація фіксованого хедера:** Контент на всіх сторінках починатиметься під фіксованим хедером.
3.  **Покращення Responsive Design:** Завдяки правильному використанню контейнерів та адаптивних класів Tailwind, сайт має краще виглядати на мобільних пристроях та планшетах.
4.  **Усунення проблем з `globals.css`:** Мінімізація конфліктів та надмірності стилів. Видалення `overflow-x: hidden` дозволить виявити та виправити будь-які залишкові проблеми з горизонтальним переповненням.
5.  **Лейаут Footer:** Має відображатися коректно, оскільки проблеми з розтягуванням контенту на сторінці будуть усунені.
6.  **Лейаут Demo сторінки:** Компоненти чату, включаючи `ExampleQueries`, будуть вирівняні по ширині та матимуть коректні відступи.

Після внесення цих змін рекомендується ретельно протестувати сайт на різних пристроях та розмірах екрану, а також перевірити, чи не з'явився горизонтальний скрол після видалення `overflow-x: hidden`.