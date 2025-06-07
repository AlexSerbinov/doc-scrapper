"use client";

import Link from "next/link";
import { useTranslationSafe } from "../../hooks/useTranslationSafe";

export function Footer() {
  const { t } = useTranslationSafe();
  
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
              {t('footer.description')}
            </p>
            <p className="text-slate-400 text-sm mt-4">
              {t('footer.builtWith')}
            </p>
          </div>

          {/* Колонка 2: Швидкі посилання */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              {t('footer.quickLinks.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.quickLinks.features')}
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.quickLinks.howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.quickLinks.pricing')}
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.quickLinks.demo')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Підтримка */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              {t('footer.support.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.support.docs')}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.support.helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.support.contact')}
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
              {t('footer.legal.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.legal.terms')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  {t('footer.legal.cookies')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижній рядок */}
        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
} 