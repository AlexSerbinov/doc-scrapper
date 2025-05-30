"use client";

import { X, CheckCircle, Loader, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export function ProcessingModal({ isOpen, onClose, url }: ProcessingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'analyze',
      title: 'Аналіз структури сайту',
      description: 'Досліджуємо архітектуру та навігацію вашої документації',
      status: 'pending'
    },
    {
      id: 'scrape',
      title: 'Збір контенту сторінок',
      description: 'Завантажуємо та обробляємо всі сторінки документації',
      status: 'pending'
    },
    {
      id: 'process',
      title: 'AI обробка та індексація',
      description: 'Створюємо векторну базу знань для оптимального пошуку',
      status: 'pending'
    }
  ]);

  // Симуляція процесу обробки
  useEffect(() => {
    if (!isOpen) return;

    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Оновлюємо статус поточного кроку на 'processing'
        setSteps(prev => prev.map((step, stepIndex) => 
          stepIndex === i ? { ...step, status: 'processing' } : step
        ));
        setCurrentStep(i);

        // Симулюємо час обробки (2-4 секунди на крок)
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

        // Оновлюємо статус на 'completed'
        setSteps(prev => prev.map((step, stepIndex) => 
          stepIndex === i ? { ...step, status: 'completed' } : step
        ));
      }

      // Після завершення всіх кроків, закриваємо модал через 2 секунди
      setTimeout(() => {
        onClose();
        // TODO: Перенаправити на сторінку чату
        console.log("Redirecting to chat...");
      }, 2000);
    };

    processSteps();
  }, [isOpen, onClose, steps.length]);

  // Скидання стану при закритті
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'processing':
        return <Loader className="w-6 h-6 text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-slate-600"></div>;
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-8 relative">
        {/* Кнопка закриття */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          disabled={currentStep < steps.length - 1} // Вимкнути поки не завершено
        >
          <X className="w-6 h-6" />
        </button>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-100 mb-3">
            🪄 Магія Почалася!
          </h2>
          <p className="text-slate-300">
            Готуємо Вашого AI-Помічника для
          </p>
          <p className="text-blue-400 font-medium mt-1">
            {getDomainFromUrl(url)}
          </p>
        </div>

        {/* Прогрес */}
        <div className="mb-8">
          {/* Progress Bar */}
          <div className="bg-slate-700 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-500 rounded-full h-2 transition-all duration-1000"
              style={{ 
                width: `${((currentStep + (steps[currentStep]?.status === 'completed' ? 1 : 0.5)) / steps.length) * 100}%` 
              }}
            />
          </div>

          {/* Кроки */}
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
            {steps.map((step, _index) => (
              <div key={step.id} className="flex items-start gap-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    step.status === 'completed' ? 'text-green-400' : 
                    step.status === 'processing' ? 'text-blue-400' : 
                    'text-slate-300'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Інформаційний текст */}
        <div className="text-center">
          <p className="text-sm text-slate-400">
            Це може зайняти від декількох секунд до декількох хвилин, 
            залежно від розміру вашої документації.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Будь ласка, не закривайте сторінку.
          </p>
        </div>

        {/* Статус завершення */}
        {steps.every(step => step.status === 'completed') && (
          <div className="mt-6 text-center">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-medium">
                Готово! Перенаправляємо вас до чату...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 