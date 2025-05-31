import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../../web-app/src/app/api/progress/[sessionId]/route';
import { updateSessionStatus, removeSessionStatus, getSessionStatus } from '../../web-app/src/lib/sessionStatus';
import { mockApiResponses, generateTestSession } from '../fixtures/mock-cli-output';

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string) {}
  },
  NextResponse: {
    json: (data: any, options?: any) => ({
      json: async () => data,
      status: options?.status || 200,
      ok: (options?.status || 200) < 400,
      headers: new Map([['Content-Type', 'application/json']])
    })
  }
}));

describe('GET /api/progress/[sessionId] Integration Tests', () => {
  const testSessionId = generateTestSession();
  
  beforeEach(() => {
    // Clean up session before each test
    removeSessionStatus(testSessionId);
  });

  afterEach(() => {
    // Clean up session after each test
    removeSessionStatus(testSessionId);
  });

  describe('Session Status Retrieval', () => {
    it('should return 404 for non-existent session', async () => {
      const mockRequest = new (NextRequest as any)('http://localhost:3000/api/progress/nonexistent');
      const mockParams = Promise.resolve({ sessionId: 'nonexistent' });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data).toMatchObject({
        error: 'Session not found'
      });
    });

    it('should return session status for existing session', async () => {
      // Create a session first
      updateSessionStatus(testSessionId, {
        sessionId: testSessionId,
        status: 'scraping',
        currentStep: 'processing',
        progress: 45,
        message: 'Скрапимо контент: 250/487 сторінок (51%)',
        url: 'https://docs.example.com',
        collectionName: 'example-docs',
        statistics: {
          urlsFound: 487,
          urlsProcessed: 250,
          urlsTotal: 487,
          currentUrl: 'https://docs.example.com/configuration',
          scrapingRate: 5.0,
          estimatedTimeRemaining: 47,
          successfulPages: 248,
          failedPages: 2,
          totalBytes: 1024000,
          elapsedTime: 50
        }
      });
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${testSessionId}`);
      const mockParams = Promise.resolve({ sessionId: testSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        sessionId: testSessionId,
        status: 'scraping',
        currentStep: 'processing',
        progress: 45,
        message: 'Скрапимо контент: 250/487 сторінок (51%)',
        url: 'https://docs.example.com',
        collectionName: 'example-docs'
      });
      
      expect(data.statistics).toMatchObject({
        urlsFound: 487,
        urlsProcessed: 250,
        urlsTotal: 487,
        scrapingRate: 5.0,
        estimatedTimeRemaining: 47,
        successfulPages: 248,
        failedPages: 2
      });
    });
  });

  describe('Progress Status Stages', () => {
    it('should return starting status correctly', async () => {
      updateSessionStatus(testSessionId, mockApiResponses.progressResponses.starting);
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${testSessionId}`);
      const mockParams = Promise.resolve({ sessionId: testSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(data.status).toBe('starting');
      expect(data.progress).toBe(10);
      expect(data.message).toBe('Ініціалізуємо процес скрапінгу...');
    });

    it('should return scraping status with progress', async () => {
      updateSessionStatus(testSessionId, mockApiResponses.progressResponses.scraping);
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${testSessionId}`);
      const mockParams = Promise.resolve({ sessionId: testSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(data.status).toBe('scraping');
      expect(data.progress).toBe(45);
      expect(data.statistics.urlsProcessed).toBe(250);
      expect(data.statistics.urlsTotal).toBe(487);
    });

    it('should return indexing status with embeddings progress', async () => {
      updateSessionStatus(testSessionId, mockApiResponses.progressResponses.indexing);
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${testSessionId}`);
      const mockParams = Promise.resolve({ sessionId: testSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(data.status).toBe('indexing');
      expect(data.progress).toBe(90);
      expect(data.statistics.embeddingsProcessed).toBe(2800);
      expect(data.statistics.embeddingsTotal).toBe(3179);
    });

    it('should return completed status with chat URL', async () => {
      updateSessionStatus(testSessionId, mockApiResponses.progressResponses.completed);
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${testSessionId}`);
      const mockParams = Promise.resolve({ sessionId: testSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(data.status).toBe('completed');
      expect(data.progress).toBe(100);
      expect(data.chatUrl).toBe('/demo/1706697600000-example');
      expect(data.statistics.embeddingsGenerated).toBe(3179);
    });

    it('should return error status with error details', async () => {
      updateSessionStatus(testSessionId, mockApiResponses.progressResponses.error);
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${testSessionId}`);
      const mockParams = Promise.resolve({ sessionId: testSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(data.status).toBe('error');
      expect(data.error).toBe('Network timeout after 5 retries');
      expect(data.statistics.failedPages).toBe(10);
    });
  });

  describe('Statistics Validation', () => {
    it('should include all expected statistics fields', async () => {
      updateSessionStatus(testSessionId, {
        sessionId: testSessionId,
        status: 'scraping',
        currentStep: 'processing',
        progress: 60,
        message: 'Processing...',
        statistics: {
          urlsFound: 487,
          urlsProcessed: 300,
          urlsTotal: 487,
          currentUrl: 'https://docs.example.com/page300',
          scrapingRate: 6.0,
          estimatedTimeRemaining: 31,
          successfulPages: 298,
          failedPages: 2,
          totalBytes: 1536000,
          elapsedTime: 50,
          concurrency: 5,
          rateLimitMs: 1000
        }
      });
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${testSessionId}`);
      const mockParams = Promise.resolve({ sessionId: testSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(data.statistics).toMatchObject({
        urlsFound: 487,
        urlsProcessed: 300,
        urlsTotal: 487,
        scrapingRate: 6.0,
        estimatedTimeRemaining: 31,
        successfulPages: 298,
        failedPages: 2,
        totalBytes: 1536000,
        elapsedTime: 50,
        concurrency: 5,
        rateLimitMs: 1000
      });
    });

    it('should handle missing statistics gracefully', async () => {
      updateSessionStatus(testSessionId, {
        sessionId: testSessionId,
        status: 'starting',
        currentStep: 'initializing',
        progress: 10,
        message: 'Starting...'
        // No statistics provided
      });
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${testSessionId}`);
      const mockParams = Promise.resolve({ sessionId: testSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sessionId).toBe(testSessionId);
      expect(data.statistics).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long session IDs', async () => {
      const longSessionId = 'very-long-session-id-' + 'x'.repeat(100);
      
      updateSessionStatus(longSessionId, {
        sessionId: longSessionId,
        status: 'scraping',
        currentStep: 'processing',
        progress: 50,
        message: 'Processing...'
      });
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${longSessionId}`);
      const mockParams = Promise.resolve({ sessionId: longSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sessionId).toBe(longSessionId);
      
      // Cleanup
      removeSessionStatus(longSessionId);
    });

    it('should handle special characters in session ID', async () => {
      const specialSessionId = '1706697600000-test-site.com';
      
      updateSessionStatus(specialSessionId, {
        sessionId: specialSessionId,
        status: 'completed',
        currentStep: 'completed',
        progress: 100,
        message: 'Done!'
      });
      
      const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${specialSessionId}`);
      const mockParams = Promise.resolve({ sessionId: specialSessionId });
      
      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sessionId).toBe(specialSessionId);
      
      // Cleanup
      removeSessionStatus(specialSessionId);
    });
  });

  describe('Real-time Progress Simulation', () => {
    it('should track progress from start to completion', async () => {
      const stages = [
        { status: 'starting', progress: 10, message: 'Initializing...' },
        { status: 'scraping', progress: 25, message: 'Found 487 pages...' },
        { status: 'scraping', progress: 45, message: 'Scraping: 250/487 pages' },
        { status: 'scraping', progress: 74, message: 'Scraping completed' },
        { status: 'indexing', progress: 85, message: 'Generating embeddings...' },
        { status: 'indexing', progress: 95, message: 'Indexing chunks...' },
        { status: 'completed', progress: 100, message: 'AI assistant ready!' }
      ];
      
      for (const stage of stages) {
        updateSessionStatus(testSessionId, {
          sessionId: testSessionId,
          status: stage.status as any,
          currentStep: 'processing',
          progress: stage.progress,
          message: stage.message
        });
        
        const mockRequest = new (NextRequest as any)(`http://localhost:3000/api/progress/${testSessionId}`);
        const mockParams = Promise.resolve({ sessionId: testSessionId });
        
        const response = await GET(mockRequest, { params: mockParams });
        const data = await response.json();
        
        expect(data.status).toBe(stage.status);
        expect(data.progress).toBe(stage.progress);
        expect(data.message).toBe(stage.message);
      }
    });
  });
}); 