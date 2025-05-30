"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // TODO: Додати функціонал перемикання теми пізніше
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Логотип/Назва */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-xl font-semibold text-blue-400">
            Doc Scrapper AI
          </div>
        </Link>

        {/* Навігаційні посилання та перемикач теми */}
        <div className="flex items-center space-x-6">
          {/* Навігація */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="#features" 
              className="text-slate-300 hover:text-slate-100 transition-colors"
            >
              Можливості
            </Link>
            <Link 
              href="#pricing" 
              className="text-slate-300 hover:text-slate-100 transition-colors"
            >
              Тарифи
            </Link>
            <Link 
              href="/login" 
              className="text-slate-300 hover:text-slate-100 transition-colors"
            >
              Увійти
            </Link>
          </nav>

          {/* Перемикач теми */}
          <button
            onClick={toggleTheme}
            className="text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-md hover:bg-slate-800"
            aria-label="Перемикач теми"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
} 