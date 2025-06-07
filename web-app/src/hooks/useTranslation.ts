import { t, getCurrentTranslations, currentLanguage } from '../locales';
import type { Language } from '../locales';

/**
 * Custom hook for translations
 * Provides type-safe translation function and current language info
 */
export const useTranslation = () => {
  // Get current translations
  const translations = getCurrentTranslations();
  
  return {
    // Translation function
    t,
    
    // Current language
    language: currentLanguage,
    
    // Direct access to translations object (for complex cases)
    translations,
    
    // Helper function to check if a key exists
    hasTranslation: (key: string): boolean => {
      const keys = key.split('.');
      let value: unknown = translations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && value !== null && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return false;
        }
      }
      
      return typeof value === 'string';
    }
  };
};

// Export the translation function for convenience
export { t };

// Export types
export type { Language };
