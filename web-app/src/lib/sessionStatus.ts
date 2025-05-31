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
}

// In-memory storage для статусів сесій
// В продакшені це має бути в базі даних або Redis
const sessionStatus = new Map<string, ProgressStatus>();

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
  sessionStatus.set(sessionId, updated);
  
  console.log(`[${sessionId}] Status updated:`, updated);
  return updated;
}

export function getSessionStatus(sessionId: string): ProgressStatus | null {
  return sessionStatus.get(sessionId) || null;
}

export function removeSessionStatus(sessionId: string) {
  sessionStatus.delete(sessionId);
}

// Cleanup старих сесій (автоматично через годину)
setInterval(() => {
  for (const [sessionId, status] of sessionStatus.entries()) {
    // Видаляємо завершені/помилкові сесії старше години
    if ((status.status === 'completed' || status.status === 'error')) {
      sessionStatus.delete(sessionId);
      console.log(`[${sessionId}] Cleaned up old session status`);
    }
  }
}, 60 * 60 * 1000); // Раз на годину

export type { ProgressStatus }; 