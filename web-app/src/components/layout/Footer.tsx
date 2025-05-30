"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Колонка 1: Про нас */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Doc Scrapper AI
            </h3>
            <p className="text-slate-400 text-sm">
              Розблокуйте силу вашої документації з AI. Миттєво
              перетворіть онлайн-документацію на інтерактивного
              помічника.
            </p>
            <p className="text-slate-400 text-sm mt-4">
              Побудовано з ❤️ для розробників та команд
            </p>
          </div>

          {/* Колонка 2: Швидкі посилання */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Швидкі посилання
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Можливості
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Як це працює
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Тарифи
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Демо
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Підтримка */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Підтримка
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Документація
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Центр підтримки
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Зв&apos;язатися з нами
                </Link>
              </li>
              <li>
                <a href="mailto:support@doc-scrapper.ai" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  support@doc-scrapper.ai
                </a>
              </li>
            </ul>
          </div>

          {/* Колонка 4: Правові */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Правові
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Політика Конфіденційності
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Умови Використання
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Файли Cookie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижній рядок */}
        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Doc Scrapper AI. Всі права захищені.
          </p>
        </div>
      </div>
    </footer>
  );
} 