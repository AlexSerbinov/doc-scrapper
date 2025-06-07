"use client";

import { X, CheckCircle, Loader, AlertCircle, ExternalLink, FileText, Settings, Clock, Zap, Database, Globe } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ConsolidatedDocsViewer } from "../ConsolidatedDocsViewer";
import { formatTime, type ProgressStatus, type ProgressBarSettings } from "../../lib/sessionStatus";
import { useTranslationSafe } from "../../hooks/useTranslationSafe";

interface EnhancedProcessingModalProps {
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

export function EnhancedProcessingModal({ 
  isOpen, 
  onClose, 
  url, 
  sessionId, 
  collectionName 
}: EnhancedProcessingModalProps) {
  const { t } = useTranslationSafe();
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'analyze',
      title: t('processing.steps.analyze.title'),
      description: t('processing.steps.analyze.description'),
      status: 'pending'
    },
    {
      id: 'scrape',
      title: t('processing.steps.scrape.title'),
      description: t('processing.steps.scrape.description'),
      status: 'pending'
    },
    {
      id: 'process',
      title: t('processing.steps.process.title'),
      description: t('processing.steps.process.description'),
      status: 'pending'
    }
  ]);

  const [progressStatus, setProgressStatus] = useState<ProgressStatus | null>(null);
  const [progressSettings, setProgressSettings] = useState<ProgressBarSettings>({
    showDetailedStats: true,
    showTimingInfo: true,
    showRateInfo: true,
    animateProgress: true,
    showCurrentUrl: false,
    compactView: false
  });
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsolidation, setShowConsolidation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Оновлення кроків на основі статусу
  const updateStepsFromStatus = useCallback((status: ProgressStatus) => {
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
            // ⭐ FIXED: Check if scraping is actually completed (all pages processed)
            const isScrapingComplete = status.statistics?.urlsProcessed && 
                                     status.statistics?.urlsTotal && 
                                     status.statistics.urlsProcessed >= status.statistics.urlsTotal;
            
            return { 
              ...step, 
              status: isScrapingComplete ? 'completed' : 'processing',
              details: status.statistics?.urlsTotal 
                ? `${status.statistics.urlsProcessed || 0}/${status.statistics.urlsTotal} ${t('processing.pages')}`
                : status.message 
            };
          }
          return { ...step, status: 'pending' };
        
        case 'indexing':
          if (step.id === 'analyze') {
            return { ...step, status: 'completed' };
          } else if (step.id === 'scrape') {
            // Update details with final numbers when moving to indexing
            return { 
              ...step, 
              status: 'completed',
              details: status.statistics?.urlsTotal 
                ? `${status.statistics.urlsTotal}/${status.statistics.urlsTotal} ${t('processing.pages')}`
                : step.details 
            };
          } else if (step.id === 'process') {
            // Enhanced AI processing details ⭐ FIXED: Prioritize chunks over documents
            let details = status.message;
            
            // ⭐ FIXED: Show embeddings progress, then chunks, avoid embeddingsGenerated
            if (status.statistics?.embeddingsProcessed && status.statistics?.embeddingsTotal) {
              details = `Embeddings: ${status.statistics.embeddingsProcessed}/${status.statistics.embeddingsTotal}`;
            } else if (status.statistics?.chunksCreated) {
              details = t('processing.createdBlocks', { count: status.statistics.chunksCreated });
            } else if (status.statistics?.documentsTotal && status.statistics?.documentsProcessed !== undefined) {
              details = `${t('processing.progress.documents')}: ${status.statistics.documentsProcessed}/${status.statistics.documentsTotal}`;
            }
            // Remove embeddingsGenerated to prevent accumulation issues
            
            return { 
              ...step, 
              status: 'processing',
              details
            };
          }
          return step;
        
        case 'completed':
          if (step.id === 'process') {
            // Update AI processing details with final numbers when completed
            let finalDetails = t('common.ready');
            
            // Use embeddingsTotal as the authoritative source for final count
            if (status.statistics?.embeddingsTotal) {
              finalDetails = t('processing.indexedBlocks', { count: status.statistics.embeddingsTotal });
            } else if (status.statistics?.chunksCreated) {
              finalDetails = t('processing.createdBlocks', { count: status.statistics.chunksCreated });
            }
            // Remove embeddingsGenerated fallback as it accumulates across sessions
            
            return { 
              ...step, 
              status: 'completed',
              details: finalDetails
            };
          }
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
  }, [t]);

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
        }
      } else {
        console.error('Failed to fetch progress');
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(t('processing.statusError'));
    }
  }, [sessionId, t, updateStepsFromStatus]);

  // Функція для отримання та оновлення налаштувань
  const fetchSettings = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/progress/settings?sessionId=${sessionId}`);
      if (response.ok) {
        const { settings } = await response.json();
        setProgressSettings(settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, [sessionId]);

  const updateSettings = async (newSettings: Partial<ProgressBarSettings>) => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/progress/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          settings: { ...progressSettings, ...newSettings }
        })
      });

      if (response.ok) {
        const { settings } = await response.json();
        setProgressSettings(settings);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };



  // Polling для прогресу
  useEffect(() => {
    if (isOpen && sessionId && !isPolling) {
      setIsPolling(true);
      setError(null);
      fetchSettings(); // Завантажити налаштування
    }
  }, [isOpen, sessionId, isPolling, fetchSettings]);

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
      setShowSettings(false);
    }
  }, [isOpen]);

  // Обробники для показу додаткових панелей
  const handleShowConsolidation = () => setShowConsolidation(true);
  const handleCloseConsolidation = () => setShowConsolidation(false);
  const handleToggleSettings = () => setShowSettings(!showSettings);

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

  // Показ consolidation viewer
  if (showConsolidation) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
          <ConsolidatedDocsViewer
            collectionName={collectionName}
            projectName={getDomainFromUrl(url)}
            onClose={handleCloseConsolidation}
          />
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-slate-800 rounded-lg shadow-2xl w-full max-h-[90vh] overflow-y-auto relative ${
        progressSettings.compactView ? 'max-w-lg' : 'max-w-2xl'
      }`}>
        
        {/* Header */}
        <div className="bg-slate-700 border-b border-slate-600 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
              <h2 className="text-xl font-semibold text-slate-100">
                {hasError ? t('processing.status.error') : isCompleted ? t('processing.status.ready') : t('processing.status.inProgress')}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Settings button */}
              <button
                onClick={handleToggleSettings}
                className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-600"
                title={t('processing.settings.title')}
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-600"
                disabled={isPolling && !hasError && !isCompleted}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Site info */}
          <div className="mt-2">
            <p className="text-slate-300 text-sm">
              {hasError ? t('processing.errorProcessing') : 
               isCompleted ? t('processing.readyFor') :
               t('processing.preparingFor')}
            </p>
            <p className="text-blue-400 font-medium">
              {getDomainFromUrl(url)}
            </p>
            {collectionName && (
              <p className="text-slate-500 text-xs">
                {t('processing.collection')} {collectionName}
              </p>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
              <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('processing.settings.title')}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={progressSettings.showDetailedStats}
                    onChange={(e) => updateSettings({ showDetailedStats: e.target.checked })}
                    className="rounded border-slate-500 bg-slate-600 text-blue-500"
                  />
                  <span className="text-slate-300">{t('processing.settings.detailed')}</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={progressSettings.showTimingInfo}
                    onChange={(e) => updateSettings({ showTimingInfo: e.target.checked })}
                    className="rounded border-slate-500 bg-slate-600 text-blue-500"
                  />
                  <span className="text-slate-300">{t('processing.settings.timing')}</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={progressSettings.showRateInfo}
                    onChange={(e) => updateSettings({ showRateInfo: e.target.checked })}
                    className="rounded border-slate-500 bg-slate-600 text-blue-500"
                  />
                  <span className="text-slate-300">{t('processing.settings.rate')}</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={progressSettings.showCurrentUrl}
                    onChange={(e) => updateSettings({ showCurrentUrl: e.target.checked })}
                    className="rounded border-slate-500 bg-slate-600 text-blue-500"
                  />
                  <span className="text-slate-300">{t('processing.settings.currentPage')}</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={progressSettings.animateProgress}
                    onChange={(e) => updateSettings({ animateProgress: e.target.checked })}
                    className="rounded border-slate-500 bg-slate-600 text-blue-500"
                  />
                  <span className="text-slate-300">{t('processing.settings.animation')}</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={progressSettings.compactView}
                    onChange={(e) => updateSettings({ compactView: e.target.checked })}
                    className="rounded border-slate-500 bg-slate-600 text-blue-500"
                  />
                  <span className="text-slate-300">{t('processing.settings.compact')}</span>
                </label>
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div className="mb-8">
            {/* Main Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-300">
                  {t('processing.progress.overall')}
                </span>
                <span className="text-sm text-slate-400">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <div className="bg-slate-700 rounded-full h-3">
                <div 
                  className={`rounded-full h-3 ${progressSettings.animateProgress ? 'transition-all duration-1000' : ''} ${
                    hasError ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Enhanced Statistics Display */}
            {progressSettings.showDetailedStats && progressStatus?.statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* URLs Found/Processed */}
                {progressStatus.statistics.urlsTotal && (
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <Globe className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-400">
                      {progressStatus.statistics.urlsProcessed || 0}/{progressStatus.statistics.urlsTotal}
                    </div>
                    <div className="text-xs text-slate-400">{t('processing.progress.pages')}</div>
                  </div>
                )}



                {/* Embeddings Progress */}
                {progressStatus.statistics.embeddingsProcessed && progressStatus.statistics.embeddingsTotal && (
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-yellow-400">
                      {progressStatus.statistics.embeddingsProcessed}/{progressStatus.statistics.embeddingsTotal}
                    </div>
                    <div className="text-xs text-slate-400">{t('processing.progress.embeddings')}</div>
                  </div>
                )}

                {/* Chunks Created */}
                {progressStatus.statistics.chunksCreated && (
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <Database className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-400">
                      {progressStatus.statistics.chunksCreated.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">{t('processing.progress.blocks')}</div>
                  </div>
                )}

                {/* Processing Rate */}
                {progressSettings.showRateInfo && (progressStatus.statistics.scrapingRate || progressStatus.statistics.indexingRate) && (
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-yellow-400">
                      {(progressStatus.statistics.scrapingRate || progressStatus.statistics.indexingRate || 0).toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {progressStatus.status === 'scraping' ? t('processing.progress.pagesSec') : t('processing.progress.docsSec')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timing Information */}
            {progressSettings.showTimingInfo && progressStatus?.statistics && (
              <div className="flex gap-4 mb-6">
                {progressStatus.statistics.elapsedTime && (
                  <div className="bg-slate-700 rounded-lg p-3 flex-1">
                    <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      {t('processing.progress.elapsed')}
                    </div>
                    <div className="text-blue-400 font-medium">
                      {formatTime(progressStatus.statistics.elapsedTime)}
                    </div>
                  </div>
                )}

                {progressStatus.statistics.estimatedTimeRemaining && 
                 progressStatus.statistics.estimatedTimeRemaining > 0 && 
                 formatTime(progressStatus.statistics.estimatedTimeRemaining) !== '0' && (
                  <div className="bg-slate-700 rounded-lg p-3 flex-1">
                    <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      {t('processing.progress.remaining')}
                    </div>
                    <div className="text-green-400 font-medium">
                      ~{formatTime(progressStatus.statistics.estimatedTimeRemaining)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current URL */}
            {progressSettings.showCurrentUrl && progressStatus?.statistics?.currentUrl && (
              <div className="bg-slate-700 rounded-lg p-3 mb-4">
                <div className="text-slate-300 text-sm mb-1">{t('processing.progress.currentUrl')}</div>
                <div className="text-blue-400 text-sm font-mono truncate">
                  {progressStatus.statistics.currentUrl}
                </div>
              </div>
            )}

            {/* Current Status Message */}
            {progressStatus?.message && (
              <div className="text-center mb-4">
                <p className="text-sm text-blue-400">
                  {progressStatus.message}
                </p>
              </div>
            )}

            {/* Processing Steps */}
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

          {/* Error Status */}
          {hasError && (
            <div className="mb-6">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 font-medium text-center">
                  {error || progressStatus?.error || t('processing.error.unknown')}
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  {t('processing.error.close')}
                </button>
              </div>
            </div>
          )}

          {/* Completion Status */}
          {isCompleted && (
            <div className="mb-6">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium text-center mb-4">
                  {t('processing.completed.success')}
                </p>
                
                {/* Main Actions */}
                <div className="space-y-3">
                  {progressStatus?.chatUrl && (
                    <a
                      href={progressStatus.chatUrl}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded transition-colors flex items-center justify-center gap-2"
                    >
                      {t('processing.completed.goToChat')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  {/* Consolidation button */}
                  <button
                    onClick={handleShowConsolidation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {t('processing.completed.getConsolidated')}
                  </button>
                  
                  <p className="text-xs text-green-300 text-center mt-2">
                    💡 {t('processing.completed.perfectFor')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Information Text */}
          {!hasError && !isCompleted && (
            <div className="text-center">
              <p className="text-sm text-slate-400">
                {t('processing.info.duration')}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {t('processing.info.dontClose')}
              </p>
              {sessionId && (
                <p className="text-xs text-slate-600 mt-2">
                  {t('processing.info.sessionId')} {sessionId}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 