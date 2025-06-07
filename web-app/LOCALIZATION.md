# 🌍 Localization Guide for Doc Scrapper AI

## Overview

This project now supports **multi-language localization** with a type-safe translation system. Currently supported languages:
- 🇺🇦 **Ukrainian** (ua) - Default
- 🇺🇸 **English** (en)

## 📁 File Structure

```
web-app/src/
├── locales/
│   ├── index.ts          # Main localization logic
│   ├── ua.ts            # Ukrainian translations
│   └── en.ts            # English translations
├── hooks/
│   └── useTranslation.ts # Translation hook for components
└── config/
    └── language.ts       # Language configuration
```

## 🚀 Usage

### In React Components

```tsx
import { useTranslation } from '../hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      {/* With parameters */}
      <p>{t('chat.activeCollection', { collection: 'my-docs' })}</p>
    </div>
  );
}
```

### Direct Usage (outside components)

```tsx
import { t } from '../locales';

const message = t('common.loading');
const withParams = t('chat.sourcesCount', { count: 5 });
```

## 🔧 Changing Language

### Method 1: Configuration File
Edit `web-app/src/config/language.ts`:

```tsx
export const DEFAULT_LANGUAGE: Language = 'en'; // Change to 'en' for English
```

### Method 2: Programmatically
```tsx
import { switchLanguage } from '../locales';

// Switch to English
switchLanguage('en');

// Switch to Ukrainian  
switchLanguage('ua');
```

## ➕ Adding New Languages

### Step 1: Create Language File

Create `web-app/src/locales/[language-code].ts`:

```tsx
// Example: web-app/src/locales/es.ts
export const es = {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    // ... copy structure from ua.ts or en.ts
  },
  hero: {
    title: 'Desbloquea el Poder de Tu',
    titleHighlight: 'Documentación con IA',
    // ... continue translation
  }
  // ... rest of translations
} as const;
```

### Step 2: Update Index File

Add to `web-app/src/locales/index.ts`:

```tsx
import { ua } from './ua';
import { en } from './en';
import { es } from './es'; // Add new language

export type Language = 'ua' | 'en' | 'es'; // Add to type

export const languages = {
  ua,
  en,
  es // Add to languages object
} as const;
```

### Step 3: Update Configuration

Add to `web-app/src/config/language.ts`:

```tsx
export const AVAILABLE_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'ua', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' }, // Add new language
];
```

## 📝 Translation Key Structure

The translation keys follow a hierarchical structure:

```
common.*           - Common elements (buttons, loading, etc.)
header.*           - Header navigation
hero.*             - Landing page hero section
features.*         - Features section
chat.*             - Chat interface
workspace.*        - Documentation workspace
collections.*      - Collection selector
consolidatedDocs.* - Document consolidation
form.*             - Forms and inputs
trial.*            - Trial version info
footer.*           - Footer content
```

## 🔍 Key Features

### Type Safety
- Full TypeScript support with autocompletion
- Compile-time checking for missing translation keys
- Parameter validation for dynamic content

### Parameter Substitution
```tsx
// Translation with placeholder: "Active collection: {collection}"
t('chat.activeCollection', { collection: 'my-docs' })
// Result: "Active collection: my-docs"
```

### Fallback System
- Missing keys return the key itself as fallback
- Console warnings for missing translations in development

## 🛠 Development Tips

### Finding Untranslated Text
Search for Cyrillic characters in your codebase:
```bash
grep -r "[а-яіїєґ]" web-app/src/components/
```

### Validation
The system includes a `hasTranslation()` helper:
```tsx
const { hasTranslation } = useTranslation();

if (hasTranslation('some.key')) {
  // Key exists
}
```

## 📚 Advanced Usage

### Language Switching Component (Future Enhancement)
```tsx
import { switchLanguage, currentLanguage } from '../locales';
import { AVAILABLE_LANGUAGES } from '../config/language';

export function LanguageSwitcher() {
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => switchLanguage(e.target.value as Language)}
    >
      {AVAILABLE_LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
```

## 🚦 Migration Status

### ✅ Completed Components
- Header navigation
- Hero section (landing page)
- Documentation workspace
- Chat interface (partial)

### 🔄 Remaining Components
- Features section
- How it works section
- Pricing section
- Footer
- Processing modals
- Form validation messages
- Collection selector
- Consolidated docs viewer

## 📋 Recommended Libraries for Large Projects

For larger applications, consider these libraries:

1. **react-i18next** - Full-featured i18n framework
2. **react-intl** - Format.js internationalization library  
3. **lingui** - Modern i18n library with macro support
4. **next-translate** - Lightweight solution for Next.js

Our current solution is perfect for small to medium projects and provides:
- Zero dependencies
- Full type safety
- Simple implementation
- Easy maintenance

## 🔗 Related Files

- `/web-app/src/locales/` - Translation files
- `/web-app/src/hooks/useTranslation.ts` - Translation hook
- `/web-app/src/config/language.ts` - Language configuration
- This guide: `/web-app/LOCALIZATION.md`
