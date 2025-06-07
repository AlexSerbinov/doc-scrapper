"use client";

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslationSafe } from '../hooks/useTranslationSafe';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../config/language';
import type { Language } from '../locales';

/**
 * Language switcher component
 * Simple dropdown for changing interface language
 */
export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { language: currentLanguage, switchLanguage, isHydrated } = useTranslationSafe();

  const handleLanguageChange = (lang: Language) => {
    switchLanguage(lang);
    setIsOpen(false);
    
    // Trigger page reload to update all components
    // In a real app, you might use React context or state management
    window.location.reload();
  };

  const currentLang = AVAILABLE_LANGUAGES.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-slate-100 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">
          {isHydrated ? currentLang?.nativeName : AVAILABLE_LANGUAGES.find(lang => lang.code === DEFAULT_LANGUAGE)?.nativeName}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 min-w-[140px]">
            {AVAILABLE_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentLanguage === language.code
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{language.nativeName}</span>
                  {currentLanguage === language.code && (
                    <span className="text-xs">✓</span>
                  )}
                </div>
                <div className="text-xs opacity-75">{language.name}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
