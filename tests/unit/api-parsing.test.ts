import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  updateSessionStatus, 
  removeSessionStatus, 
  getSessionStatus,
  type ProgressStatus 
} from '../../web-app/src/lib/sessionStatus';
import { 
  mockScraperOutputs, 
  mockRAGOutputs, 
  mockApiResponses,
  generateTestSession,
  simulateScrapingProgress
} from '../fixtures/mock-cli-output';

// Mock the actual parsing functions (we'll test their logic)
class CLIOutputParser {
  static parseScraperOutput(sessionId: string, output: string, elapsedTime: number) {
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Parse JSON structured output
      if (line.includes('SCRAPING_STATS:')) {
        try {
          const jsonMatch = line.match(/SCRAPING_STATS:\s*(.+)$/);
          if (jsonMatch) {
            const stats = JSON.parse(jsonMatch[1]);
            updateSessionStatus(sessionId, {
              status: 'scraping',
              progress: 25,
              message: `Знайшли ${stats.urlsFound} сторінок для скрапінгу...`,
              statistics: {
                urlsFound: stats.urlsFound,
                urlsTotal: stats.urlsTotal || stats.urlsFound,
                concurrency: stats.concurrency,
                rateLimitMs: stats.rateLimitMs,
                elapsedTime
              }
            });
          }
        } catch (error) {
          console.error(`Error parsing SCRAPING_STATS:`, error);
        }
      }
      
      // Parse progress updates
      if (line.includes('SCRAPING_PROGRESS:')) {
        try {
          const jsonMatch = line.match(/SCRAPING_PROGRESS:\s*(.+)$/);
          if (jsonMatch) {
            const progress = JSON.parse(jsonMatch[1]);
            
            const scrapingRate = elapsedTime > 0 ? progress.current / elapsedTime : 0;
            const estimatedTimeRemaining = scrapingRate > 0 ? (progress.total - progress.current) / scrapingRate : 0;
            
            const finalProgress = Math.min(25 + (progress.percentage * 0.48), 73);
            
            updateSessionStatus(sessionId, {
              status: 'scraping',
              progress: finalProgress,
              message: `Скрапимо контент: ${progress.current}/${progress.total} сторінок (${progress.percentage}%)`,
              statistics: {
                urlsProcessed: progress.current,
                urlsTotal: progress.total,
                currentUrl: progress.currentUrl,
                scrapingRate: Number(scrapingRate.toFixed(2)),
                estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
                successfulPages: progress.status === 'success' ? progress.current : undefined,
                failedPages: progress.status === 'error' ? 1 : undefined,
                elapsedTime
              }
            });
          }
        } catch (error) {
          console.error(`Error parsing SCRAPING_PROGRESS:`, error);
        }
      }
      
      // Parse completion stats
      if (line.includes('SCRAPING_COMPLETE:')) {
        try {
          const jsonMatch = line.match(/SCRAPING_COMPLETE:\s*(.+)$/);
          if (jsonMatch) {
            const completion = JSON.parse(jsonMatch[1]);
            updateSessionStatus(sessionId, {
              status: 'scraping',
              progress: 74,
              message: `Скрапінг завершено: ${completion.successfulPages} сторінок успішно`,
              statistics: {
                successfulPages: completion.successfulPages,
                failedPages: completion.failedPages,
                totalBytes: completion.totalBytes,
                urlsProcessed: completion.successfulPages,
                urlsTotal: completion.successfulPages,
                elapsedTime
              }
            });
          }
        } catch (error) {
          console.error(`Error parsing SCRAPING_COMPLETE:`, error);
        }
      }
      
      // Legacy parsing
      if (line.includes('Found') && line.includes('URLs')) {
        const match = line.match(/Found\s+(\d+)\s+URLs/i);
        if (match) {
          const urlsFound = parseInt(match[1]);
          updateSessionStatus(sessionId, {
            status: 'scraping',
            progress: 30,
            message: `Знайшли ${urlsFound} сторінок для скрапінгу...`,
            statistics: {
              urlsFound,
              urlsTotal: urlsFound,
              elapsedTime
            }
          });
        }
      }
    }
  }
  
  static parseRAGOutput(sessionId: string, output: string, elapsedTime: number) {
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Parse JSON progress from RAG CLI
      if (line.includes('RAG_PROGRESS:')) {
        try {
          const jsonMatch = line.match(/RAG_PROGRESS:\s*(.+)$/);
          if (jsonMatch) {
            const progressData = JSON.parse(jsonMatch[1]);
            
            // Extract chunk progress from message
            let chunksProcessed = 0;
            let chunksTotal = 0;
            const chunkMatch = progressData.message.match(/(\d+)\/(\d+)/);
            if (chunkMatch) {
              chunksProcessed = parseInt(chunkMatch[1]);
              chunksTotal = parseInt(chunkMatch[2]);
            }
            
            // Map RAG stages to progress percentages and messages
            let progress = progressData.progress;
            let message = progressData.message;
            
            switch (progressData.stage) {
              case 'loading':
                progress = 76;
                message = `Завантажили ${progressData.totalDocuments} документів для індексації...`;
                break;
              case 'chunking':
                message = `Створюємо семантичні блоки: ${progressData.progress}%`;
                break;
              case 'embedding':
                message = `Генеруємо векторні представлення: ${progressData.progress}%`;
                break;
              case 'indexing':
                if (chunksProcessed > 0 && chunksTotal > 0) {
                  const chunkPercent = Math.round((chunksProcessed / chunksTotal) * 100);
                  message = `Індексуємо chunks: ${chunksProcessed}/${chunksTotal} (${chunkPercent}%)`;
                  
                  if (chunkPercent >= 95) {
                    progress = 99;
                  }
                }
                break;
              case 'complete':
                progress = 99;
                message = 'Завершуємо індексацію...';
                break;
            }
            
            updateSessionStatus(sessionId, {
              progress: Math.round(progress),
              message,
              statistics: {
                documentsProcessed: progressData.documentsProcessed,
                documentsTotal: progressData.totalDocuments,
                embeddingsProcessed: chunksProcessed || undefined,
                embeddingsTotal: chunksTotal || undefined,
                elapsedTime
              }
            });
          }
        } catch (error) {
          console.error(`Error parsing RAG_PROGRESS:`, error);
        }
      }
      
      // Parse completion data
      if (line.includes('RAG_COMPLETE:')) {
        try {
          const jsonMatch = line.match(/RAG_COMPLETE:\s*(.+)$/);
          if (jsonMatch) {
            const completionData = JSON.parse(jsonMatch[1]);
            updateSessionStatus(sessionId, {
              progress: 100,
              message: `Проіндексували ${completionData.chunksIndexed} блоків у векторній базі`,
              statistics: {
                embeddingsGenerated: completionData.chunksIndexed,
                elapsedTime
              }
            });
          }
        } catch (error) {
          console.error(`Error parsing RAG_COMPLETE:`, error);
        }
      }
      
      // Legacy parsing
      if (line.includes('Loaded') && line.includes('documents')) {
        const match = line.match(/Loaded\s+(\d+)\s+documents/i);
        if (match) {
          const documentsTotal = parseInt(match[1]);
          updateSessionStatus(sessionId, {
            progress: 76,
            message: `Завантажили ${documentsTotal} документів для індексації...`,
            statistics: {
              documentsTotal,
              documentsProcessed: 0,
              elapsedTime
            }
          });
        }
      }
      
      // Parse created chunks info
      if (line.includes('Created') && line.includes('chunks')) {
        const match = line.match(/Created\s+(\d+)\s+chunks/i);
        if (match) {
          const chunksCreated = parseInt(match[1]);
          updateSessionStatus(sessionId, {
            statistics: {
              chunksCreated,
              elapsedTime
            }
          });
        }
      }
      
      // Parse average chunk size
      if (line.includes('Average chunk size')) {
        const match = line.match(/Average chunk size:\s+(\d+)\s+tokens/i);
        if (match) {
          const averageChunkSize = parseInt(match[1]);
          updateSessionStatus(sessionId, {
            statistics: {
              averageChunkSize,
              elapsedTime
            }
          });
        }
      }
    }
  }
}

describe('CLI Output Parsing', () => {
  const testSessionId = generateTestSession();
  
  beforeEach(() => {
    // Clean up session before each test
    removeSessionStatus(testSessionId);
  });

  afterEach(() => {
    // Clean up session after each test
    removeSessionStatus(testSessionId);
  });

  describe('Scraper Output Parsing', () => {
    it('should parse SCRAPING_STATS correctly', () => {
      const elapsedTime = 5;
      
      CLIOutputParser.parseScraperOutput(testSessionId, mockScraperOutputs.scrapingStats, elapsedTime);
      
      const status = getSessionStatus(testSessionId);
      expect(status).not.toBeNull();
      expect(status?.status).toBe('scraping');
      expect(status?.progress).toBe(25);
      expect(status?.message).toBe('Знайшли 487 сторінок для скрапінгу...');
      expect(status?.statistics).toMatchObject({
        urlsFound: 487,
        urlsTotal: 487,
        concurrency: 5,
        rateLimitMs: 1000,
        elapsedTime: 5
      });
    });

    it('should parse SCRAPING_PROGRESS updates correctly', () => {
      const progressUpdates = mockScraperOutputs.scrapingProgress;
      const timeIntervals = [10, 25, 55, 85, 115]; // Seconds for each update
      
      progressUpdates.forEach((progressOutput, index) => {
        CLIOutputParser.parseScraperOutput(testSessionId, progressOutput, timeIntervals[index]);
      });
      
      const finalStatus = getSessionStatus(testSessionId);
      expect(finalStatus?.status).toBe('scraping');
      
      // Should track final progress  
      expect(finalStatus?.statistics?.urlsProcessed).toBe(487);
      expect(finalStatus?.statistics?.urlsTotal).toBe(487);
      expect(finalStatus?.statistics?.currentUrl).toBe('https://docs.example.com/troubleshooting');
      
      // Should calculate scraping rate (487 pages / 115 seconds ≈ 4.23 pages/sec)
      expect(finalStatus?.statistics?.scrapingRate).toBeCloseTo(4.23, 1);
    });

    it('should parse SCRAPING_COMPLETE correctly', () => {
      const elapsedTime = 120;
      
      CLIOutputParser.parseScraperOutput(testSessionId, mockScraperOutputs.scrapingComplete, elapsedTime);
      
      const status = getSessionStatus(testSessionId);
      expect(status?.progress).toBe(74);
      expect(status?.message).toBe('Скрапінг завершено: 487 сторінок успішно');
      expect(status?.statistics).toMatchObject({
        successfulPages: 487,
        failedPages: 0,
        totalBytes: 2048000,
        urlsProcessed: 487,
        urlsTotal: 487,
        elapsedTime: 120
      });
    });

    it('should handle scraping errors gracefully', () => {
      const errorOutputs = mockScraperOutputs.scrapingErrors;
      
      // Create session first before testing error handling
      updateSessionStatus(testSessionId, {
        sessionId: testSessionId,
        status: 'starting',
        currentStep: 'initializing',
        progress: 10,
        message: 'Starting...'
      });
      
      errorOutputs.forEach(errorOutput => {
        CLIOutputParser.parseScraperOutput(testSessionId, errorOutput, 30);
      });
      
      // Should not crash and should maintain basic state
      const status = getSessionStatus(testSessionId);
      expect(status).toBeTruthy(); // Session should still exist
    });

    it('should parse legacy output format for backwards compatibility', () => {
      const legacyOutputs = mockScraperOutputs.legacyOutput;
      
      CLIOutputParser.parseScraperOutput(testSessionId, legacyOutputs[0], 8); // "Found 487 URLs"
      
      const status = getSessionStatus(testSessionId);
      expect(status?.statistics?.urlsFound).toBe(487);
      expect(status?.statistics?.urlsTotal).toBe(487);
    });
  });

  describe('RAG Output Parsing', () => {
    it('should parse RAG_PROGRESS loading stage', () => {
      CLIOutputParser.parseRAGOutput(testSessionId, mockRAGOutputs.loadingDocuments, 125);
      
      const status = getSessionStatus(testSessionId);
      expect(status?.progress).toBe(76);
      expect(status?.message).toBe('Завантажили 488 документів для індексації...');
      expect(status?.statistics).toMatchObject({
        documentsProcessed: 0,
        documentsTotal: 488,
        elapsedTime: 125
      });
    });

    it('should parse chunking progress correctly', () => {
      const chunkingUpdates = mockRAGOutputs.chunkingProgress;
      const timeIntervals = [135, 150, 165];
      
      chunkingUpdates.forEach((chunkOutput, index) => {
        CLIOutputParser.parseRAGOutput(testSessionId, chunkOutput, timeIntervals[index]);
      });
      
      const finalStatus = getSessionStatus(testSessionId);
      expect(finalStatus?.statistics?.documentsProcessed).toBe(488);
      expect(finalStatus?.statistics?.documentsTotal).toBe(488);
    });

    it('should parse embedding generation progress', () => {
      const embeddingUpdates = mockRAGOutputs.embeddingProgress;
      const timeIntervals = [175, 205, 235, 250];
      
      embeddingUpdates.forEach((embeddingOutput, index) => {
        CLIOutputParser.parseRAGOutput(testSessionId, embeddingOutput, timeIntervals[index]);
      });
      
      const finalStatus = getSessionStatus(testSessionId);
      expect(finalStatus?.statistics?.embeddingsProcessed).toBe(3179);
      expect(finalStatus?.statistics?.embeddingsTotal).toBe(3179);
      expect(finalStatus?.message).toBe('Генеруємо векторні представлення: 98%');
    });

    it('should parse indexing progress with chunk tracking', () => {
      const indexingUpdates = mockRAGOutputs.indexingProgress;
      const timeIntervals = [255, 275, 290];
      
      indexingUpdates.forEach((indexingOutput, index) => {
        CLIOutputParser.parseRAGOutput(testSessionId, indexingOutput, timeIntervals[index]);
      });
      
      const finalStatus = getSessionStatus(testSessionId);
      expect(finalStatus?.progress).toBe(99); // Should be 99% when chunks are 100%
      expect(finalStatus?.statistics?.embeddingsProcessed).toBe(3179);
      expect(finalStatus?.statistics?.embeddingsTotal).toBe(3179);
      expect(finalStatus?.message).toBe('Індексуємо chunks: 3179/3179 (100%)');
    });

    it('should parse RAG_COMPLETE correctly', () => {
      CLIOutputParser.parseRAGOutput(testSessionId, mockRAGOutputs.ragComplete, 295);
      
      const status = getSessionStatus(testSessionId);
      expect(status?.progress).toBe(100);
      expect(status?.message).toBe('Проіндексували 3179 блоків у векторній базі');
      expect(status?.statistics?.embeddingsGenerated).toBe(3179);
    });

    it('should handle legacy RAG output format', () => {
      const legacyRAGOutputs = mockRAGOutputs.legacyRAGOutput;
      
      // Test "Loaded 488 documents"
      CLIOutputParser.parseRAGOutput(testSessionId, legacyRAGOutputs[0], 127);
      
      let status = getSessionStatus(testSessionId);
      expect(status?.statistics?.documentsTotal).toBe(488);
      expect(status?.statistics?.documentsProcessed).toBe(0);
      
      // Test "Created 3179 chunks"
      CLIOutputParser.parseRAGOutput(testSessionId, legacyRAGOutputs[1], 160);
      
      status = getSessionStatus(testSessionId);
      expect(status?.statistics?.chunksCreated).toBe(3179);
      
      // Test "Average chunk size: 245 tokens"
      CLIOutputParser.parseRAGOutput(testSessionId, legacyRAGOutputs[2], 265);
      
      status = getSessionStatus(testSessionId);
      expect(status?.statistics?.averageChunkSize).toBe(245);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle complete scraping to indexing flow', () => {
      const sessionId = generateTestSession('https://docs.complex-site.com');
      
      // 1. Start with scraping stats
      CLIOutputParser.parseScraperOutput(sessionId, mockScraperOutputs.scrapingStats, 5);
      
      let status = getSessionStatus(sessionId);
      expect(status?.status).toBe('scraping');
      expect(status?.statistics?.urlsFound).toBe(487);
      
      // 2. Simulate progress updates  
      const progressUpdates = simulateScrapingProgress(487);
      progressUpdates.forEach((update, index) => {
        const progressOutput = `SCRAPING_PROGRESS: ${JSON.stringify(update)}`;
        CLIOutputParser.parseScraperOutput(sessionId, progressOutput, (index + 1) * 20);
      });
      
      status = getSessionStatus(sessionId);
      expect(status?.statistics?.urlsProcessed).toBe(487);
      
      // 3. Complete scraping
      CLIOutputParser.parseScraperOutput(sessionId, mockScraperOutputs.scrapingComplete, 120);
      
      status = getSessionStatus(sessionId);
      expect(status?.progress).toBe(74);
      expect(status?.statistics?.successfulPages).toBe(487);
      
      // 4. Start RAG indexing
      CLIOutputParser.parseRAGOutput(sessionId, mockRAGOutputs.loadingDocuments, 125);
      
      status = getSessionStatus(sessionId);
      expect(status?.progress).toBe(76);
      expect(status?.statistics?.documentsTotal).toBe(488);
      
      // 5. Complete RAG indexing
      CLIOutputParser.parseRAGOutput(sessionId, mockRAGOutputs.ragComplete, 300);
      
      status = getSessionStatus(sessionId);
      expect(status?.progress).toBe(100);
      expect(status?.statistics?.embeddingsGenerated).toBe(3179);
      
      // Cleanup
      removeSessionStatus(sessionId);
    });

    it('should maintain data consistency across multiple updates', () => {
      // Initialize with scraping stats
      CLIOutputParser.parseScraperOutput(testSessionId, mockScraperOutputs.scrapingStats, 5);
      
      // Add progress update
      CLIOutputParser.parseScraperOutput(testSessionId, mockScraperOutputs.scrapingProgress[2], 55);
      
      // Add completion
      CLIOutputParser.parseScraperOutput(testSessionId, mockScraperOutputs.scrapingComplete, 120);
      
      const status = getSessionStatus(testSessionId);
      
      // Should maintain consistency
      expect(status?.statistics?.urlsTotal).toBe(487); // From completion
      expect(status?.statistics?.successfulPages).toBe(487); // From completion
      expect(status?.statistics?.totalBytes).toBe(2048000); // From completion
      expect(status?.statistics?.elapsedTime).toBe(120); // Latest time
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedOutputs = [
        'SCRAPING_STATS: {invalid json}',
        'RAG_PROGRESS: {missing closing brace',
        'SCRAPING_PROGRESS: {"valid": "json", "but": incomplete',
        'SCRAPING_COMPLETE: null'
      ];
      
      // Create session first
      updateSessionStatus(testSessionId, {
        sessionId: testSessionId,
        status: 'starting',
        currentStep: 'initializing',
        progress: 10,
        message: 'Starting...'
      });
      
      malformedOutputs.forEach(malformedOutput => {
        // Should not throw errors
        expect(() => {
          CLIOutputParser.parseScraperOutput(testSessionId, malformedOutput, 30);
          CLIOutputParser.parseRAGOutput(testSessionId, malformedOutput, 30);
        }).not.toThrow();
      });
      
      // Session should still be manageable
      const status = getSessionStatus(testSessionId);
      expect(status?.sessionId).toBe(testSessionId);
    });

    it('should calculate correct rates and estimates', () => {
      // Test with known values for precise calculations
      const testProgressOutput = `SCRAPING_PROGRESS: {"current": 200, "total": 500, "percentage": 40, "currentUrl": "https://test.com/page200", "status": "success"}`;
      const elapsedTime = 50; // 50 seconds
      
      CLIOutputParser.parseScraperOutput(testSessionId, testProgressOutput, elapsedTime);
      
      const status = getSessionStatus(testSessionId);
      
      // Rate: 200 pages / 50 seconds = 4 pages/sec
      expect(status?.statistics?.scrapingRate).toBe(4.0);
      
      // Estimated time remaining: (500 - 200) / 4 = 75 seconds
      expect(status?.statistics?.estimatedTimeRemaining).toBe(75);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      const zeroProgressOutput = `SCRAPING_PROGRESS: {"current": 0, "total": 487, "percentage": 0, "currentUrl": "https://docs.example.com/start", "status": "success"}`;
      
      CLIOutputParser.parseScraperOutput(testSessionId, zeroProgressOutput, 0);
      
      const status = getSessionStatus(testSessionId);
      expect(status?.statistics?.scrapingRate).toBe(0);
      expect(status?.statistics?.estimatedTimeRemaining).toBe(0);
    });

    it('should handle very large numbers', () => {
      const largeProgressOutput = `SCRAPING_STATS: {"urlsFound": 50000, "urlsTotal": 50000, "concurrency": 10, "rateLimitMs": 100}`;
      
      CLIOutputParser.parseScraperOutput(testSessionId, largeProgressOutput, 10);
      
      const status = getSessionStatus(testSessionId);
      expect(status?.statistics?.urlsFound).toBe(50000);
      expect(status?.statistics?.urlsTotal).toBe(50000);
    });

    it('should handle empty and whitespace-only output', () => {
      const emptyOutputs = ['', '   ', '\n\n\n', '\t\t'];
      
      emptyOutputs.forEach(emptyOutput => {
        expect(() => {
          CLIOutputParser.parseScraperOutput(testSessionId, emptyOutput, 30);
          CLIOutputParser.parseRAGOutput(testSessionId, emptyOutput, 30);
        }).not.toThrow();
      });
    });
  });
});

describe('Progress Validation', () => {
  const testSessionId = generateTestSession();
  
  beforeEach(() => {
    removeSessionStatus(testSessionId);
  });

  afterEach(() => {
    removeSessionStatus(testSessionId);
  });

  it('should ensure progress values stay within 0-100 range', () => {
    // Test edge case where calculated progress might exceed bounds
    const edgeCaseOutputs = [
      `SCRAPING_PROGRESS: {"current": 487, "total": 487, "percentage": 100, "currentUrl": "https://docs.example.com/last", "status": "success"}`,
      `RAG_PROGRESS: {"stage": "indexing", "progress": 99, "message": "Indexing chunks: 3179/3179", "documentsProcessed": 488, "totalDocuments": 488}`
    ];
    
    edgeCaseOutputs.forEach(output => {
      CLIOutputParser.parseScraperOutput(testSessionId, output, 100);
      CLIOutputParser.parseRAGOutput(testSessionId, output, 200);
    });
    
    const status = getSessionStatus(testSessionId);
    expect(status?.progress).toBeGreaterThanOrEqual(0);
    expect(status?.progress).toBeLessThanOrEqual(100);
  });
}); 