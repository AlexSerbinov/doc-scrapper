"use client";

import Link from "next/link";
import { useTranslationSafe } from "../../hooks/useTranslationSafe";
import { LanguageSwitcher } from "../LanguageSwitcher";
// Temporarily disabled import - will be needed when re-enabling theme switcher
// import { Moon } from "lucide-react";

export function Header() {
  const { t } = useTranslationSafe();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип/Назва */}
          <div className="flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
              {t('header.logo')}
            </Link>
          </div>

          {/* Навігація */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className="text-slate-300 hover:text-slate-100 transition-colors"
            >
              {t('header.features')}
            </Link>
            <Link 
              href="#pricing" 
              className="text-slate-300 hover:text-slate-100 transition-colors"
            >
              {t('header.pricing')}
            </Link>
            <Link 
              href="/login" 
              className="text-slate-300 hover:text-slate-100 transition-colors"
            >
              {t('header.login')}
            </Link>
          </nav>

          {/* Language switcher */}
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
          
          {/* Theme switcher (temporarily disabled) */}
          {/* <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors md:ml-4">
            <Moon className="w-5 h-5" />
          </button> */}
        </div>
      </div>
    </header>
  );
} 