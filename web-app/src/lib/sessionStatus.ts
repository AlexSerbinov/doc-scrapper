// Enhanced progress status with detailed statistics
interface ProgressStatus {
  sessionId: string;
  status: 'initializing' | 'starting' | 'scraping' | 'indexing' | 'completed' | 'error';
  currentStep: string;
  progress: number;
  message: string;
  error?: string;
  chatUrl?: string;
  url?: string;
  collectionName?: string;
  
  // Enhanced statistics ⭐ NEW
  statistics?: {
    // Scraping stats
    urlsFound?: number;
    urlsProcessed?: number;
    urlsTotal?: number;
    currentUrl?: string;
    scrapingRate?: number; // URLs per second
    estimatedTimeRemaining?: number; // seconds
    successfulPages?: number;
    failedPages?: number;
    totalBytes?: number;
    
    // Indexing stats  
    documentsProcessed?: number;
    documentsTotal?: number;
    chunksCreated?: number;
    averageChunkSize?: number; // tokens
    embeddingsGenerated?: number;
    indexingRate?: number; // documents per second
    
    // Timing
    startTime?: string; // ISO string
    elapsedTime?: number; // seconds
    
    // Configuration
    concurrency?: number;
    rateLimitMs?: number;
  };
}

// Progress bar settings 
interface ProgressBarSettings {
  showDetailedStats: boolean;
  showTimingInfo: boolean;
  showRateInfo: boolean;
  animateProgress: boolean;
  showCurrentUrl: boolean;
  compactView: boolean;
}

// Default settings
const defaultProgressSettings: ProgressBarSettings = {
  showDetailedStats: true,
  showTimingInfo: true,
  showRateInfo: true,
  animateProgress: true,
  showCurrentUrl: false, // URL може бути довгим
  compactView: false
};

// In-memory storage для статусів сесій
// В продакшені це має бути в базі даних або Redis
const sessionStatus = new Map<string, ProgressStatus>();
const progressSettings = new Map<string, ProgressBarSettings>();

// Utility функції для оновлення статусу (використовуються іншими API)
export function updateSessionStatus(sessionId: string, update: Partial<ProgressStatus>) {
  const current = sessionStatus.get(sessionId) || {
    sessionId,
    status: 'starting' as const,
    currentStep: 'initializing',
    progress: 0,
    message: 'Ініціалізація...'
  };

  const updated = { ...current, ...update };
  
  // Merge statistics if provided
  if (update.statistics && current.statistics) {
    updated.statistics = { ...current.statistics, ...update.statistics };
  }
  
  sessionStatus.set(sessionId, updated);
  
  console.log(`[${sessionId}] Status updated:`, updated);
  return updated;
}

export function getSessionStatus(sessionId: string): ProgressStatus | null {
  return sessionStatus.get(sessionId) || null;
}

export function removeSessionStatus(sessionId: string) {
  sessionStatus.delete(sessionId);
  progressSettings.delete(sessionId);
}

// Progress bar settings management ⭐ NEW
export function updateProgressSettings(sessionId: string, settings: Partial<ProgressBarSettings>) {
  const current = progressSettings.get(sessionId) || defaultProgressSettings;
  const updated = { ...current, ...settings };
  progressSettings.set(sessionId, updated);
  return updated;
}

export function getProgressSettings(sessionId: string): ProgressBarSettings {
  return progressSettings.get(sessionId) || defaultProgressSettings;
}

// Utility functions for statistics calculations ⭐ NEW
export function calculateScrapingRate(urlsProcessed: number, elapsedTimeSeconds: number): number {
  return elapsedTimeSeconds > 0 ? urlsProcessed / elapsedTimeSeconds : 0;
}

export function estimateTimeRemaining(urlsProcessed: number, urlsTotal: number, elapsedTimeSeconds: number): number {
  if (urlsProcessed === 0 || elapsedTimeSeconds === 0) return 0;
  
  const rate = urlsProcessed / elapsedTimeSeconds;
  const remaining = urlsTotal - urlsProcessed;
  
  return rate > 0 ? remaining / rate : 0;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// Cleanup старих сесій (автоматично через годину)
setInterval(() => {
  for (const [sessionId, status] of sessionStatus.entries()) {
    // Видаляємо завершені/помилкові сесії старше години
    if ((status.status === 'completed' || status.status === 'error')) {
      sessionStatus.delete(sessionId);
      progressSettings.delete(sessionId);
      console.log(`[${sessionId}] Cleaned up old session status`);
    }
  }
}, 60 * 60 * 1000); // Раз на годину

export type { ProgressStatus, ProgressBarSettings }; 