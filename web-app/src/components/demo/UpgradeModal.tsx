"use client";

import { X, Crown, Check } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'time_limit' | 'query_limit' | 'upgrade_button';
}

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (reason) {
      case 'time_limit':
        return 'Час тріалу закінчився';
      case 'query_limit':
        return 'Ліміт запитів вичерпано';
      default:
        return 'Розблокуйте повний потенціал';
    }
  };

  const getDescription = () => {
    switch (reason) {
      case 'time_limit':
        return 'Ваш 7-денний тестовий період закінчився. Оновіться до Pro плану, щоб продовжити користуватися AI-помічником.';
      case 'query_limit':
        return 'Ви використали всі 100 безкоштовних запитів. Оновіться до Pro плану для необмежених запитів.';
      default:
        return 'Отримайте повний доступ до всіх можливостей Doc Scrapper AI з Pro підпискою.';
    }
  };

  const handleUpgrade = () => {
    // Перенаправляємо на секцію тарифів
    window.location.href = '/#pricing';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-8 relative">
        {/* Кнопка закриття */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Іконка Crown */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-3">
            {getTitle()}
          </h2>
          <p className="text-slate-300">
            {getDescription()}
          </p>
        </div>

        {/* Pro план переваги */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-slate-100 mb-4">
            Pro план включає:
          </h3>
          <div className="space-y-3">
            {[
              'Необмежена кількість запитів',
              'До 5 сайтів документації',
              'Пріоритетна обробка',
              'Розширена аналітика',
              'Пріоритетна підтримка'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
          >
            Продовжити тріал
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
          >
            Оновити до Pro
          </button>
        </div>

        {/* Додаткова інформація */}
        <p className="text-center text-sm text-slate-400 mt-4">
          Відмініть в будь-який час. Без прихованих платежів.
        </p>
      </div>
    </div>
  );
} 