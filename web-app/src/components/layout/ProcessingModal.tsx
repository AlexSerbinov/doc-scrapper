"use client";

import { X, CheckCircle, Loader, AlertCircle, ExternalLink } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  sessionId: string;
  collectionName: string;
}

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  details?: string;
}

interface ProgressStatus {
  sessionId: string;
  status: 'starting' | 'scraping' | 'indexing' | 'completed' | 'error';
  currentStep: string;
  progress: number;
  message: string;
  error?: string;
  chatUrl?: string;
}

export function ProcessingModal({ isOpen, onClose, url, sessionId, collectionName }: ProcessingModalProps) {
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

  const [progressStatus, setProgressStatus] = useState<ProgressStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функція для отримання статусу прогресу
  const fetchProgress = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/progress/${sessionId}`);
      if (response.ok) {
        const status: ProgressStatus = await response.json();
        setProgressStatus(status);
        
        // Оновлюємо кроки на основі статусу
        updateStepsFromStatus(status);
        
        // Якщо завершено або помилка, зупиняємо polling
        if (status.status === 'completed' || status.status === 'error') {
          setIsPolling(false);
          
          if (status.status === 'completed' && status.chatUrl) {
            // Перенаправляємо на чат через 2 секунди
            setTimeout(() => {
              window.location.href = status.chatUrl!;
            }, 2000);
          }
        }
      } else {
        console.error('Failed to fetch progress');
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Помилка отримання статусу обробки');
    }
  }, [sessionId]);

  // Оновлення кроків на основі статусу
  const updateStepsFromStatus = (status: ProgressStatus) => {
    setSteps(prev => prev.map(step => {
      switch (status.status) {
        case 'starting':
          return step.id === 'analyze' 
            ? { ...step, status: 'processing' }
            : { ...step, status: 'pending' };
        
        case 'scraping':
          if (step.id === 'analyze') {
            return { ...step, status: 'completed' };
          } else if (step.id === 'scrape') {
            return { 
              ...step, 
              status: 'processing',
              details: status.message 
            };
          }
          return { ...step, status: 'pending' };
        
        case 'indexing':
          if (step.id === 'analyze' || step.id === 'scrape') {
            return { ...step, status: 'completed' };
          } else if (step.id === 'process') {
            return { 
              ...step, 
              status: 'processing',
              details: status.message 
            };
          }
          return step;
        
        case 'completed':
          return { ...step, status: 'completed' };
        
        case 'error':
          if (step.status === 'processing') {
            return { ...step, status: 'error', details: status.error };
          }
          return step;
        
        default:
          return step;
      }
    }));
  };

  // Polling для прогресу
  useEffect(() => {
    if (isOpen && sessionId && !isPolling) {
      setIsPolling(true);
      setError(null);
    }
  }, [isOpen, sessionId, isPolling]);

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(fetchProgress, 2000); // Перевіряємо кожні 2 секунди
    
    // Також робимо перший запит одразу
    fetchProgress();

    return () => clearInterval(interval);
  }, [isPolling, fetchProgress]);

  // Скидання стану при закритті
  useEffect(() => {
    if (!isOpen) {
      setSteps(prev => prev.map(step => ({ 
        ...step, 
        status: 'pending',
        details: undefined 
      })));
      setProgressStatus(null);
      setIsPolling(false);
      setError(null);
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

  const getProgressPercentage = () => {
    if (progressStatus?.progress) {
      return progressStatus.progress;
    }
    
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const processingSteps = steps.filter(s => s.status === 'processing').length;
    return ((completedSteps + processingSteps * 0.5) / steps.length) * 100;
  };

  const isCompleted = progressStatus?.status === 'completed';
  const hasError = progressStatus?.status === 'error' || error;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-8 relative">
        {/* Кнопка закриття */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          disabled={isPolling && !hasError && !isCompleted}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-100 mb-3">
            {hasError ? '❌ Помилка обробки' : isCompleted ? '✅ Готово!' : '🪄 Магія Почалася!'}
          </h2>
          <p className="text-slate-300">
            {hasError ? 'Сталася помилка під час обробки' : 
             isCompleted ? 'Ваш AI-помічник готовий для' :
             'Готуємо Вашого AI-Помічника для'}
          </p>
          <p className="text-blue-400 font-medium mt-1">
            {getDomainFromUrl(url)}
          </p>
          {collectionName && (
            <p className="text-slate-500 text-sm mt-1">
              Колекція: {collectionName}
            </p>
          )}
        </div>

        {/* Прогрес */}
        <div className="mb-8">
          {/* Progress Bar */}
          <div className="bg-slate-700 rounded-full h-2 mb-6">
            <div 
              className={`rounded-full h-2 transition-all duration-1000 ${
                hasError ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>

          {/* Поточний статус */}
          {progressStatus?.message && (
            <div className="text-center mb-4">
              <p className="text-sm text-blue-400">
                {progressStatus.message}
              </p>
            </div>
          )}

          {/* Кроки */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    step.status === 'completed' ? 'text-green-400' : 
                    step.status === 'processing' ? 'text-blue-400' : 
                    step.status === 'error' ? 'text-red-400' :
                    'text-slate-300'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {step.details || step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Статус помилки */}
        {hasError && (
          <div className="mb-6">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 font-medium text-center">
                {error || progressStatus?.error || 'Сталася невідома помилка'}
              </p>
              <button
                onClick={onClose}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Закрити
              </button>
            </div>
          </div>
        )}

        {/* Статус завершення */}
        {isCompleted && (
          <div className="mb-6">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-medium text-center">
                Готово! Перенаправляємо вас до чату...
              </p>
              {progressStatus?.chatUrl && (
                <a
                  href={progressStatus.chatUrl}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                >
                  Перейти до чату
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Інформаційний текст */}
        {!hasError && !isCompleted && (
          <div className="text-center">
            <p className="text-sm text-slate-400">
              Це може зайняти від декількох секунд до декількох хвилин, 
              залежно від розміру вашої документації.
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Будь ласка, не закривайте сторінку.
            </p>
            {sessionId && (
              <p className="text-xs text-slate-600 mt-2">
                Session ID: {sessionId}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 