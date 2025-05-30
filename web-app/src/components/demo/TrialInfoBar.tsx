"use client";

import { AlertTriangle, Crown } from "lucide-react";
import { useState } from "react";
import { UpgradeModal } from "./UpgradeModal";

interface TrialInfoBarProps {
  trialId: string;
}

export function TrialInfoBar({ trialId }: TrialInfoBarProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Симулюємо дані тріалу на основі ID
  const getTrialData = (id: string) => {
    const num = parseInt(id) || 1;
    
    // Різні стани для демонстрації
    if (num % 3 === 0) {
      return { daysLeft: 1, queriesUsed: 95, maxQueries: 100, docName: "AI SDK Documentation" };
    } else if (num % 2 === 0) {
      return { daysLeft: 3, queriesUsed: 75, maxQueries: 100, docName: "React Documentation" };
    } else {
      return { daysLeft: 5, queriesUsed: 25, maxQueries: 100, docName: "Next.js Documentation" };
    }
  };

  const { daysLeft, queriesUsed, maxQueries, docName } = getTrialData(trialId);
  const queryProgress = (queriesUsed / maxQueries) * 100;
  
  // Визначаємо стан попередження
  const isLowDays = daysLeft <= 2;
  const isHighUsage = queriesUsed >= 80;
  const showWarning = isLowDays || isHighUsage;

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  return (
    <>
      <div className={`border-b p-4 ${
        showWarning 
          ? 'bg-orange-900/20 border-orange-500/50' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Інформація про тріал */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {showWarning && <AlertTriangle className="w-4 h-4 text-orange-400" />}
              <h3 className="text-sm font-medium text-slate-200">
                Тріальна версія для: <span className="text-blue-400">{docName}</span>
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              {/* Лічильник днів */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Залишилось:</span>
                <span className={`font-semibold ${
                  isLowDays ? 'text-orange-400' : 'text-slate-200'
                }`}>
                  {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дні' : 'днів'}
                </span>
              </div>

              {/* Лічильник запитів */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Запитів:</span>
                <span className={`font-semibold ${
                  isHighUsage ? 'text-orange-400' : 'text-slate-200'
                }`}>
                  {queriesUsed} / {maxQueries}
                </span>
                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      queryProgress >= 80 ? 'bg-orange-400' : 'bg-blue-500'
                    }`}
                    style={{ width: `${queryProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Попередження */}
            {showWarning && (
              <div className="mt-2 text-sm text-orange-300">
                {isLowDays && isHighUsage 
                  ? 'Час тріалу та запити на межі! Оновіться зараз.'
                  : isLowDays 
                    ? 'Час тріалу майже закінчився!'
                    : 'Запити майже вичерпані!'
                }
              </div>
            )}
          </div>

          {/* Кнопка оновлення */}
          <button
            onClick={handleUpgradeClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
              showWarning 
                ? 'bg-orange-600 hover:bg-orange-700 text-white pulse-animation'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            Оновити до Pro
          </button>
        </div>
      </div>

      {/* Модальне вікно оновлення */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="upgrade_button"
      />
    </>
  );
} 