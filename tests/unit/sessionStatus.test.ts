import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  updateSessionStatus,
  getSessionStatus,
  removeSessionStatus,
  updateProgressSettings,
  getProgressSettings,
  calculateScrapingRate,
  estimateTimeRemaining,
  formatBytes,
  formatTime,
  type ProgressStatus,
  type ProgressBarSettings
} from '../../web-app/src/lib/sessionStatus';
import { generateTestSession } from '../fixtures/mock-cli-output';

describe('SessionStatus Management', () => {
  const testSessionId = '1706697600000-testid';
  
  beforeEach(() => {
    // Clean up any existing sessions before each test
    removeSessionStatus(testSessionId);
  });

  afterEach(() => {
    // Clean up after each test
    removeSessionStatus(testSessionId);
  });

  describe('Session CRUD Operations', () => {
    it('should create new session with default values', () => {
      const update: Partial<ProgressStatus> = {
        status: 'starting',
        progress: 20,
        message: 'Test message'
      };

      const result = updateSessionStatus(testSessionId, update);

      expect(result).toMatchObject({
        sessionId: testSessionId,
        status: 'starting',
        currentStep: 'initializing',
        progress: 20,
        message: 'Test message'
      });
    });

    it('should update existing session while preserving other fields', () => {
      // Create initial session
      updateSessionStatus(testSessionId, {
        status: 'starting',
        progress: 10,
        message: 'Starting...',
        url: 'https://example.com'
      });

      // Update progress
      const result = updateSessionStatus(testSessionId, {
        progress: 50,
        message: 'Processing...'
      });

      expect(result).toMatchObject({
        sessionId: testSessionId,
        status: 'starting', // Should be preserved
        progress: 50, // Should be updated
        message: 'Processing...', // Should be updated
        url: 'https://example.com' // Should be preserved
      });
    });

    it('should merge statistics while preserving existing stats', () => {
      // Create session with initial stats
      updateSessionStatus(testSessionId, {
        status: 'scraping',
        statistics: {
          urlsFound: 100,
          urlsProcessed: 10,
          elapsedTime: 30
        }
      });

      // Update some stats
      const result = updateSessionStatus(testSessionId, {
        statistics: {
          urlsProcessed: 25,
          scrapingRate: 0.83,
          currentUrl: 'https://example.com/page25'
        }
      });

      expect(result.statistics).toMatchObject({
        urlsFound: 100, // Preserved
        urlsProcessed: 25, // Updated
        elapsedTime: 30, // Preserved
        scrapingRate: 0.83, // Added
        currentUrl: 'https://example.com/page25' // Added
      });
    });

    it('should retrieve existing session', () => {
      const sessionData: Partial<ProgressStatus> = {
        status: 'indexing',
        progress: 80,
        message: 'Creating index...'
      };

      updateSessionStatus(testSessionId, sessionData);
      const retrieved = getSessionStatus(testSessionId);

      expect(retrieved).toMatchObject(sessionData);
      expect(retrieved?.sessionId).toBe(testSessionId);
    });

    it('should return null for non-existent session', () => {
      const result = getSessionStatus('non-existent-session');
      expect(result).toBeNull();
    });

    it('should remove session completely', () => {
      updateSessionStatus(testSessionId, {
        status: 'completed',
        progress: 100
      });

      expect(getSessionStatus(testSessionId)).not.toBeNull();
      
      removeSessionStatus(testSessionId);
      
      expect(getSessionStatus(testSessionId)).toBeNull();
    });
  });

  describe('Progress Tracking Scenarios', () => {
    it('should track complete scraping lifecycle', () => {
      // 1. Start scraping
      updateSessionStatus(testSessionId, {
        status: 'starting',
        progress: 10,
        message: 'Initializing...',
        url: 'https://docs.example.com',
        collectionName: 'example-docs'
      });

      let status = getSessionStatus(testSessionId);
      expect(status?.status).toBe('starting');
      expect(status?.progress).toBe(10);

      // 2. Found URLs
      updateSessionStatus(testSessionId, {
        status: 'scraping',
        progress: 25,
        message: 'Found 487 pages...',
        statistics: {
          urlsFound: 487,
          urlsTotal: 487,
          elapsedTime: 5
        }
      });

      status = getSessionStatus(testSessionId);
      expect(status?.status).toBe('scraping');
      expect(status?.statistics?.urlsFound).toBe(487);

      // 3. Progress updates
      updateSessionStatus(testSessionId, {
        progress: 45,
        message: 'Scraping: 150/487 pages',
        statistics: {
          urlsProcessed: 150,
          scrapingRate: 10.0, // 150 pages / 15 seconds
          estimatedTimeRemaining: 33.7, // (487-150) / 10.0
          elapsedTime: 15
        }
      });

      status = getSessionStatus(testSessionId);
      expect(status?.statistics?.urlsProcessed).toBe(150);
      expect(status?.statistics?.scrapingRate).toBe(10.0);

      // 4. Completion
      updateSessionStatus(testSessionId, {
        status: 'scraping',
        progress: 74,
        message: 'Scraping completed: 487 pages',
        statistics: {
          urlsProcessed: 487,
          successfulPages: 487,
          failedPages: 0,
          elapsedTime: 50
        }
      });

      status = getSessionStatus(testSessionId);
      expect(status?.statistics?.urlsProcessed).toBe(487);
      expect(status?.statistics?.successfulPages).toBe(487);
    });

    it('should track AI indexing with embeddings progress', () => {
      updateSessionStatus(testSessionId, {
        status: 'indexing',
        progress: 76,
        message: 'Loading 488 documents...',
        statistics: {
          documentsTotal: 488,
          documentsProcessed: 0,
          elapsedTime: 55
        }
      });

      // Embedding progress
      updateSessionStatus(testSessionId, {
        progress: 85,
        message: 'Generating embeddings: 1500/3179',
        statistics: {
          documentsProcessed: 488,
          embeddingsProcessed: 1500,
          embeddingsTotal: 3179,
          elapsedTime: 65
        }
      });

      // Indexing progress  
      updateSessionStatus(testSessionId, {
        progress: 95,
        message: 'Indexing chunks: 2800/3179',
        statistics: {
          embeddingsProcessed: 2800,
          elapsedTime: 75
        }
      });

      // Completion
      updateSessionStatus(testSessionId, {
        status: 'completed',
        progress: 100,
        message: 'AI assistant ready!',
        chatUrl: `/demo/${testSessionId}`,
        statistics: {
          embeddingsProcessed: 3179,
          embeddingsGenerated: 3179,
          elapsedTime: 85
        }
      });

      const status = getSessionStatus(testSessionId);
      expect(status?.status).toBe('completed');
      expect(status?.chatUrl).toBe(`/demo/${testSessionId}`);
      expect(status?.statistics?.embeddingsGenerated).toBe(3179);
    });

    it('should handle error scenarios', () => {
      updateSessionStatus(testSessionId, {
        status: 'scraping',
        progress: 30
      });

      // Simulate error
      updateSessionStatus(testSessionId, {
        status: 'error',
        progress: 30,
        message: 'Scraping failed',
        error: 'Network timeout',
        statistics: {
          failedPages: 5,
          elapsedTime: 20
        }
      });

      const status = getSessionStatus(testSessionId);
      expect(status?.status).toBe('error');
      expect(status?.error).toBe('Network timeout');
      expect(status?.statistics?.failedPages).toBe(5);
    });
  });

  describe('Progress Bar Settings', () => {
    it('should use default settings for new session', () => {
      const settings = getProgressSettings(testSessionId);
      
      expect(settings).toMatchObject({
        showDetailedStats: true,
        showTimingInfo: true,
        showRateInfo: true,
        animateProgress: true,
        showCurrentUrl: false,
        compactView: false
      });
    });

    it('should update and preserve settings', () => {
      const newSettings: Partial<ProgressBarSettings> = {
        showCurrentUrl: true,
        compactView: true
      };

      const updated = updateProgressSettings(testSessionId, newSettings);
      
      expect(updated).toMatchObject({
        showDetailedStats: true, // Default preserved
        showTimingInfo: true, // Default preserved  
        showCurrentUrl: true, // Updated
        compactView: true // Updated
      });

      const retrieved = getProgressSettings(testSessionId);
      expect(retrieved).toEqual(updated);
    });
  });
});

describe('Statistics Calculations', () => {
  describe('calculateScrapingRate', () => {
    it('should calculate correct rate for valid inputs', () => {
      expect(calculateScrapingRate(100, 50)).toBe(2.0); // 100 pages / 50 seconds = 2 pages/sec
      expect(calculateScrapingRate(487, 97.4)).toBeCloseTo(5.0, 1); // ~5 pages/sec
      expect(calculateScrapingRate(25, 10)).toBe(2.5);
    });

    it('should handle edge cases', () => {
      expect(calculateScrapingRate(0, 10)).toBe(0); // No pages processed
      expect(calculateScrapingRate(10, 0)).toBe(0); // No time elapsed
      expect(calculateScrapingRate(0, 0)).toBe(0); // Both zero
    });
  });

  describe('estimateTimeRemaining', () => {
    it('should calculate correct time estimates', () => {
      // (500-100) / (100/50) = 400 / 2 = 200 seconds
      expect(estimateTimeRemaining(100, 500, 50)).toBe(200); 
      // (487-250) / (250/50) = 237 / 5 = 47.4 seconds
      expect(estimateTimeRemaining(250, 487, 50)).toBeCloseTo(47.4, 1); 
    });

    it('should handle edge cases', () => {
      expect(estimateTimeRemaining(0, 100, 10)).toBe(0); // No progress yet
      expect(estimateTimeRemaining(50, 100, 0)).toBe(0); // No time elapsed  
      expect(estimateTimeRemaining(100, 100, 50)).toBe(0); // Already complete
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(512)).toBe('512 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB'); // 1024 + 512
      expect(formatBytes(1048576)).toBe('1 MB'); // 1024^2
      expect(formatBytes(1073741824)).toBe('1 GB'); // 1024^3
      expect(formatBytes(2621440)).toBe('2.5 MB'); // 2.5 * 1024^2
    });
  });

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(30)).toBe('30s');
      expect(formatTime(59)).toBe('59s');
      expect(formatTime(90)).toBe('1m 30s');
      expect(formatTime(3600)).toBe('1h 0m');
      expect(formatTime(3665)).toBe('1h 1m'); // 1 hour, 1 minute, 5 seconds (rounded)
      expect(formatTime(7890)).toBe('2h 11m'); // 2 hours, 11 minutes, 30 seconds
    });

    it('should handle edge cases', () => {
      expect(formatTime(0)).toBe('0s');
      expect(formatTime(0.5)).toBe('1s'); // Rounded up
    });
  });
});

describe('Data Consistency', () => {
  const testSessionId = generateTestSession();
  
  beforeEach(() => {
    removeSessionStatus(testSessionId);
  });

  afterEach(() => {
    removeSessionStatus(testSessionId);
  });

  it('should maintain type safety for ProgressStatus', () => {
    const validStatuses: ProgressStatus['status'][] = [
      'initializing', 'starting', 'scraping', 'indexing', 'completed', 'error'
    ];

    validStatuses.forEach(status => {
      const result = updateSessionStatus(testSessionId, { status });
      expect(result.status).toBe(status);
    });
  });

  it('should handle concurrent session updates', () => {
    const sessionId1 = 'session1';
    const sessionId2 = 'session2';

    updateSessionStatus(sessionId1, {
      status: 'scraping',
      progress: 30,
      statistics: { urlsProcessed: 100 }
    });

    updateSessionStatus(sessionId2, {
      status: 'indexing', 
      progress: 80,
      statistics: { embeddingsProcessed: 500 }
    });

    const status1 = getSessionStatus(sessionId1);
    const status2 = getSessionStatus(sessionId2);

    expect(status1?.status).toBe('scraping');
    expect(status1?.statistics?.urlsProcessed).toBe(100);
    expect(status2?.status).toBe('indexing');
    expect(status2?.statistics?.embeddingsProcessed).toBe(500);

    // Cleanup
    removeSessionStatus(sessionId1);
    removeSessionStatus(sessionId2);
  });
}); 