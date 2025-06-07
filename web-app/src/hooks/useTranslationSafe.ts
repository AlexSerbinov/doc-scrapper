"use client";

import { useState, useEffect } from 'react';
import { ua } from '../locales/ua';
import { en } from '../locales/en';
import { DEFAULT_LANGUAGE, getStoredLanguage } from '../config/language';
import type { Language } from '../locales';

const languages = {
  ua,
  en
} as const;

// Universal fallback texts for hydration safety
const fallbackTexts: Record<string, string> = {
  // Header
  'header.logo': 'Doc Scrapper',
  'header.features': 'Features',
  'header.pricing': 'Pricing',
  'header.login': 'Login',
  
  // Collections
  'collections.loading': 'Loading collections...',
  'collections.notLoaded': 'No collections loaded yet',
  'collections.title': 'Collections',
  'collections.notSelected': 'No collection selected',
  'collections.refreshList': 'Refresh List',
  
  // Workspace
  'workspace.tabs.chat.label': 'AI Chat',
  'workspace.tabs.chat.description': 'Ask questions about your documentation',
  'workspace.tabs.docs.label': 'Consolidated Documents',
  'workspace.tabs.docs.description': 'View and export unified documentation',
  'common.readyToWork': 'Ready to work',
  'workspace.selectCollection.title': 'Select Documentation Collection',
  'workspace.selectCollection.subtitle': 'First select a documentation collection to work with',
  'workspace.tips.chat': 'Tip: Ask specific questions for better results',
  'workspace.tips.docs': 'Tip: Use consolidated documents with ChatGPT, Claude or Gemini',
  
  // Common
  'common.files': 'files',
  'common.size': 'Size',
  'common.tokens': 'Tokens',
  
  // Chat
  'chat.assistant': 'Documentation Assistant',
  'chat.placeholder': 'Ask something about your documentation...',
  'chat.sendMessage': 'Send message',
  'chat.copyMessage': 'Copy message',
  'chat.aiTyping': 'AI is typing',
  'chat.welcomeMessage': 'Hello! I\'m your AI documentation assistant. Ask any questions about your documentation - I\'ll find the most relevant information and provide detailed answers with source links.',
  'chat.errorMessage': 'Sorry, an error occurred while processing your request. Please try again.',
  'chat.exampleQueries.title': 'Try these examples:',
  'chat.exampleQueries.examples': JSON.stringify([
    'What are the main features?',
    'How do I get started?',
    'What are the installation requirements?',
    'How does authentication work?',
    'Can you explain the API?'
  ]),
  
  // Consolidated Docs
  'consolidatedDocs.title': 'Consolidated Documentation',
  'consolidatedDocs.subtitle': 'Generate a single file with all your documentation for use with large language models.',
  'consolidatedDocs.perfectFor': 'Perfect for:',
  'consolidatedDocs.generateButton': 'Generate Consolidated Documentation',
  'consolidatedDocs.generating': 'Generating consolidated documentation...',
  'consolidatedDocs.viewModes.rendered': 'Rendered',
  'consolidatedDocs.viewModes.raw': 'Raw',
  
  // Processing
  'processing.status.started': 'Magic Started!',
  'processing.status.inProgress': 'Magic in Progress',
  'processing.status.ready': 'Ready!',
  'processing.status.error': 'Processing Error',
  
  // Form
  'form.urlLabel': 'Documentation URL',
  'form.urlPlaceholder': 'https://docs.example.com',
  'form.createButton': 'Create AI Assistant',
  'form.creatingButton': 'Starting AI assistant...',
  
  // Hero
  'hero.title': 'Turn Your Documentation Into an AI Assistant',
  'hero.subtitle': 'Get instant answers from your docs, not just search results',
  'hero.cta': 'Try It Now - It\'s Free',
  
  // Features
  'features.title': 'Why Choose Doc Scrapper?',
  'features.subtitle': 'Transform static documentation into intelligent, interactive assistance'
};

/**
 * Safe translation hook that prevents hydration mismatches
 * Always starts with default language on server, then switches to stored language on client
 */
export const useTranslationSafe = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only run on client side
    const storedLanguage = getStoredLanguage();
    setCurrentLanguage(storedLanguage);
    setIsHydrated(true);
  }, []);

  const getCurrentTranslations = () => {
    return languages[currentLanguage];
  };

  // Universal fallback function
  const getFallbackText = (key: string): string => {
    return fallbackTexts[key] || key;
  };

  // Special function for getting arrays from translations
  const getTranslationArray = (key: string): string[] => {
    if (!isHydrated) {
      const fallback = fallbackTexts[key];
      if (fallback) {
        try {
          return JSON.parse(fallback);
        } catch {
          return [fallback];
        }
      }
      return [];
    }

    const translations = getCurrentTranslations();
    const keys = key.split('.');
    let value: unknown = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to fallbackTexts
        const fallback = fallbackTexts[key];
        if (fallback) {
          try {
            return JSON.parse(fallback);
          } catch {
            return [fallback];
          }
        }
        return [];
      }
    }
    
    if (Array.isArray(value)) {
      return value as string[];
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // If parsing fails, return as single item array
        return [value];
      }
    }
    
    return [];
  };

  // Type-safe translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Use fallback during hydration
    if (!isHydrated) {
      return getFallbackText(key);
    }

    const translations = getCurrentTranslations();
    
    // Split key by dots to navigate nested objects
    const keys = key.split('.');
    let value: unknown = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return getFallbackText(key); // Use fallback instead of key
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return getFallbackText(key);
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
  const switchLanguage = (lang: Language): void => {
    setCurrentLanguage(lang);
    // Save to localStorage for persistence
    import('../config/language').then(({ setStoredLanguage }) => {
      setStoredLanguage(lang);
    });
    console.log(`Language switched to: ${lang}`);
  };

  return {
    t,
    language: currentLanguage,
    switchLanguage,
    isHydrated,
    translations: getCurrentTranslations(),
    getFallbackText, // Export for manual use if needed
    getTranslationArray, // Export for array translations
    hasTranslation: (key: string): boolean => {
      const keys = key.split('.');
      let value: unknown = getCurrentTranslations();
      
      for (const k of keys) {
        if (value && typeof value === 'object' && value !== null && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return false;
        }
      }
      
      return typeof value === 'string' || Array.isArray(value);
    }
  };
}; 