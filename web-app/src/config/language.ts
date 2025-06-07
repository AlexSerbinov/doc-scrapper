import type { Language } from '../locales';

/**
 * Language configuration
 * Change this value to switch the default language
 */
export const DEFAULT_LANGUAGE: Language = 'ua';

/**
 * Available languages
 */
export const AVAILABLE_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'ua', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

/**
 * Get language from localStorage or fallback to default
 */
export const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const stored = localStorage.getItem('doc-scrapper-language') as Language;
  return AVAILABLE_LANGUAGES.find(lang => lang.code === stored)?.code || DEFAULT_LANGUAGE;
};

/**
 * Save language to localStorage
 */
export const setStoredLanguage = (language: Language): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('doc-scrapper-language', language);
};
