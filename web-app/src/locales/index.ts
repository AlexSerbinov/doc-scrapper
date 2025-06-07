import { ua } from './ua';
import { en } from './en';
import { getStoredLanguage } from '../config/language';

export type Language = 'ua' | 'en';

// Use a more flexible type for translations

export const languages = {
  ua,
  en
} as const;

// Current language - can be changed dynamically, with localStorage persistence
export let currentLanguage: Language = getStoredLanguage();

// Get current translations
export const getCurrentTranslations = () => {
  return languages[currentLanguage];
};

// Type-safe translation function
export const t = (key: string, params?: Record<string, string | number>): string => {
  const translations = getCurrentTranslations();
  
  // Split key by dots to navigate nested objects
  const keys = key.split('.');
  let value: unknown = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && value !== null && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return key as fallback
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }
  
  // Replace parameters in the string
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value;
};

// Switch language function
export const switchLanguage = (lang: Language): void => {
  currentLanguage = lang;
  // Save to localStorage for persistence
  import('../config/language').then(({ setStoredLanguage }) => {
    setStoredLanguage(lang);
  });
  console.log(`Language switched to: ${lang}`);
};

// Export individual languages for direct access if needed
export { ua, en };
