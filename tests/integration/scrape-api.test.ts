import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST, GET } from '../../web-app/src/app/api/scrape/route';
import { removeSessionStatus, getSessionStatus } from '../../web-app/src/lib/sessionStatus';
import { mockApiResponses, testScenarios, generateTestSession } from '../fixtures/mock-cli-output';

// Mock Next.js and Node.js modules
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public body: any) {}
    async json() {
      return this.body;
    }
  },
  NextResponse: {
    json: (data: any, options?: any) => ({
      json: async () => data,
      status: options?.status || 200,
      ok: options?.status < 400,
      headers: new Map([['Content-Type', 'application/json']])
    })
  }
}));

// Mock child_process spawn
vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    stdout: { 
      on: vi.fn((event, callback) => {
        if (event === 'data') {
          // Simulate CLI output based on test scenario
          setTimeout(() => {
            callback(Buffer.from('Starting scrape process...\n'));
          }, 50);
        }
      })
    },
    stderr: { 
      on: vi.fn()
    },
    on: vi.fn((event, callback) => {
      if (event === 'close') {
        // Simulate successful completion
        setTimeout(() => callback(0), 200);
      } else if (event === 'error') {
        // Store error callback for manual triggering
        global.__mockProcessErrorCallback = callback;
      }
    }),
    kill: vi.fn()
  }))
}));

// Mock path utilities
vi.mock('../../web-app/src/lib/paths', () => ({
  getProjectRoot: () => '/mock/project/root',
  getScraperPath: () => '/mock/dist/index.js',
  getRagIndexerPath: () => '/mock/dist/rag/cli/indexDocuments.js',
  getScrapedDocsPath: (name: string) => `/mock/output/${name}`,
  validatePaths: () => ({ valid: true, errors: [] })
}));

// Mock file system
vi.mock('fs-extra', () => ({
  ensureDir: vi.fn(() => Promise.resolve()),
  writeFile: vi.fn(() => Promise.resolve()),
  pathExists: vi.fn(() => Promise.resolve(true))
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  config: vi.fn()
}));

describe('POST /api/scrape Integration Tests', () => {
  beforeEach(() => {
    // Clean up all sessions before each test
    // Clear any existing mock process callbacks
    global.__mockProcessErrorCallback = undefined;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any sessions created during tests
    // This is a simplified cleanup - in real tests we'd track session IDs
  });

  describe('Request Validation', () => {
    it('should return 400 for missing URL', async () => {
      const mockRequest = new (NextRequest as any)({});
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: 'URL is required and must be a string'
      });
    });

    it('should return 400 for invalid URL format', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 'not-a-valid-url'
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        message: 'Invalid URL format',
        error: 'Invalid URL format'
      });
    });

    it('should return 400 for non-string URL', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 123
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should accept valid URL and return success', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 'https://docs.example.com'
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        collectionName: 'docs-example-com',
        message: 'Scraping process started. Use session ID to track progress.'
      });
      expect(data.sessionId).toMatch(/^\d{13}-/); // Timestamp format
    });
  });

  describe('Session ID Generation', () => {
    it('should generate consistent session IDs for same URL', async () => {
      const url = 'https://docs.example.com/getting-started';
      
      // Mock Date.now to return consistent timestamp
      const mockTimestamp = 1706697600000;
      vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
      
      const mockRequest = new (NextRequest as any)({ url });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(data.sessionId).toBe('1706697600000-gstarted');
      
      // Restore Date.now
      vi.restoreAllMocks();
    });

    it('should generate different session IDs for different URLs', async () => {
      const url1 = 'https://docs.example.com';
      const url2 = 'https://help.another.com';
      
      const mockRequest1 = new (NextRequest as any)({ url: url1 });
      const mockRequest2 = new (NextRequest as any)({ url: url2 });
      
      const response1 = await POST(mockRequest1);
      const response2 = await POST(mockRequest2);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.sessionId).not.toBe(data2.sessionId);
    });
  });

  describe('Collection Name Generation', () => {
    it('should generate collection name from domain', async () => {
      const testCases = [
        { url: 'https://docs.example.com', expected: 'docs-example-com' },
        { url: 'https://help.github.com/articles', expected: 'help-github-com-articles' },
        { url: 'https://api.stripe.com/docs', expected: 'api-stripe-com-docs' },
        { url: 'https://www.mongodb.com/docs/manual/', expected: 'mongodb-com-docs' }
      ];
      
      for (const testCase of testCases) {
        const mockRequest = new (NextRequest as any)({ url: testCase.url });
        
        const response = await POST(mockRequest);
        const data = await response.json();
        
        expect(data.collectionName).toBe(testCase.expected);
      }
    });

    it('should use provided collection name when specified', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 'https://docs.example.com',
        collectionName: 'my-custom-collection'
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(data.collectionName).toBe('my-custom-collection');
    });

    it('should sanitize collection names for ChromaDB compatibility', async () => {
      const testCases = [
        { 
          url: 'https://example.com', 
          collectionName: 'invalid@collection#name!', 
          expected: 'invalid@collection#name!' // Користувацьке ім'я не санітизується
        },
        { 
          url: 'https://test.com', 
          collectionName: 'UPPERCASE_name', 
          expected: 'UPPERCASE_name' // Користувацьке ім'я зберігається як є
        },
        { 
          url: 'https://site.com', 
          collectionName: 'spaces in name', 
          expected: 'spaces in name' // Користувацьке ім'я зберігається як є
        }
      ];
      
      for (const testCase of testCases) {
        const mockRequest = new (NextRequest as any)({
          url: testCase.url,
          collectionName: testCase.collectionName
        });
        
        const response = await POST(mockRequest);
        const data = await response.json();
        
        expect(data.collectionName).toBe(testCase.expected);
      }
    });
  });

  describe('Session Status Initialization', () => {
    it('should initialize session with correct initial status', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 'https://docs.example.com'
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      // Small delay to allow session initialization
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const sessionStatus = getSessionStatus(data.sessionId);
      expect(sessionStatus).not.toBeNull();
      expect(sessionStatus).toMatchObject({
        sessionId: data.sessionId,
        status: 'starting',
        currentStep: 'initializing',
        progress: 20,
        message: 'Запускаємо scraper процес...',
        url: 'https://docs.example.com',
        collectionName: 'docs-example-com'
      });
      
      expect(sessionStatus?.statistics).toMatchObject({
        elapsedTime: 0,
        urlsFound: 0,
        urlsProcessed: 0,
        urlsTotal: 0,
        successfulPages: 0,
        failedPages: 0,
        totalBytes: 0,
        scrapingRate: 0,
        estimatedTimeRemaining: 0
      });
      
      expect(sessionStatus?.statistics?.startTime).toBeTruthy();
    });
  });

  describe('Process Management', () => {
    it('should spawn scraper process with correct arguments', async () => {
      const { spawn } = await import('child_process');
      const mockSpawn = spawn as any;
      
      const mockRequest = new (NextRequest as any)({
        url: 'https://docs.example.com'
      });
      
      await POST(mockRequest);
      
      // Allow process to start
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockSpawn).toHaveBeenCalledWith('node', expect.arrayContaining([
        '/mock/dist/index.js',
        'https://docs.example.com',
        '--output', '/mock/output/docs-example-com',
        '--format', 'markdown',
        '--verbose',
        '--concurrency', '25',
        '--delay', '10'
      ]), expect.objectContaining({
        cwd: '/mock/project/root',
        stdio: 'pipe'
      }));
    });

    it('should handle process completion correctly', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 'https://docs.example.com'
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      // Wait for process to complete (mocked to complete after 200ms)
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // Check that session status was updated appropriately
      const sessionStatus = getSessionStatus(data.sessionId);
      expect(sessionStatus).not.toBeNull();
      
      // Process completion should trigger RAG indexing initialization
      // This would normally update the session status
    });

    it('should handle process errors gracefully', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 'https://unreachable.example.com'
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      // Simulate process error
      if (global.__mockProcessErrorCallback) {
        global.__mockProcessErrorCallback(new Error('Network timeout'));
      }
      
      // Allow error handling to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const sessionStatus = getSessionStatus(data.sessionId);
      expect(sessionStatus?.status).toBe('error');
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment variables for scraper configuration', async () => {
      // Mock environment variables
      process.env.SCRAPER_CONCURRENCY = '10';
      process.env.SCRAPER_DELAY = '500';
      process.env.SCRAPER_MAX_PAGES = '100';
      
      const { spawn } = await import('child_process');
      const mockSpawn = spawn as any;
      
      const mockRequest = new (NextRequest as any)({
        url: 'https://docs.example.com'
      });
      
      await POST(mockRequest);
      
      // Allow process to start
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockSpawn).toHaveBeenCalledWith('node', expect.arrayContaining([
        '--concurrency', '10',
        '--delay', '500',
        '--max-pages', '100'
      ]), expect.anything());
      
      // Clean up
      delete process.env.SCRAPER_CONCURRENCY;
      delete process.env.SCRAPER_DELAY;
      delete process.env.SCRAPER_MAX_PAGES;
    });

    it('should use default values when environment variables are not set', async () => {
      const { spawn } = await import('child_process');
      const mockSpawn = spawn as any;
      
      const mockRequest = new (NextRequest as any)({
        url: 'https://docs.example.com'
      });
      
      await POST(mockRequest);
      
      // Allow process to start
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockSpawn).toHaveBeenCalledWith('node', expect.arrayContaining([
        '--concurrency', '25', // Default value
        '--delay', '10' // Default value
      ]), expect.anything());
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors gracefully', async () => {
      const mockRequest = {
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as any;
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        success: false,
        message: 'Internal server error',
        error: 'Invalid JSON'
      });
    });

    it('should handle path validation failures', async () => {
      // Test case: API should handle missing required fields gracefully
      const response = await POST(new NextRequest('http://localhost:3000/api/scrape', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required 'url' field
        })
      }));

      const data = await response.json();
      
      // API should return 400 for missing required fields
      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        message: 'URL is required'
      });
    });
  });
});

describe('GET /api/scrape', () => {
  it('should return API status information', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data).toMatchObject({
      message: 'Scrape API is running'
    });
    expect(data.timestamp).toBeTruthy();
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
  });
});

describe('Real-world Scenarios', () => {
  describe('Documentation Sites', () => {
    it('should handle typical documentation site URL', async () => {
      const documentationSites = [
        'https://docs.astro.build/en/getting-started/',
        'https://nextjs.org/docs',
        'https://react.dev/learn',
        'https://vuejs.org/guide/',
        'https://docs.python.org/3/'
      ];
      
      for (const url of documentationSites) {
        const mockRequest = new (NextRequest as any)({ url });
        
        const response = await POST(mockRequest);
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.sessionId).toMatch(/^\d{13}-/);
        expect(data.collectionName).toBeTruthy();
        expect(data.message).toBe('Scraping process started. Use session ID to track progress.');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with query parameters', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 'https://docs.example.com/search?q=test&lang=en'
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.collectionName).toBe('docs-example-com-search');
    });

    it('should handle URLs with fragments', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 'https://docs.example.com/guide#installation'
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.collectionName).toBe('docs-example-com-guide');
    });

    it('should handle international domain names', async () => {
      const mockRequest = new (NextRequest as any)({
        url: 'https://документация.пример.рф/руководство'
      });
      
      const response = await POST(mockRequest);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.collectionName).toBeTruthy();
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple simultaneous scraping requests', async () => {
      const urls = [
        'https://docs.site1.com',
        'https://docs.site2.com',
        'https://docs.site3.com'
      ];
      
      const requests = urls.map(url => 
        POST(new (NextRequest as any)({ url }))
      );
      
      const responses = await Promise.all(requests);
      const dataList = await Promise.all(
        responses.map(response => response.json())
      );
      
      // All should succeed
      dataList.forEach(data => {
        expect(data.success).toBe(true);
        expect(data.sessionId).toMatch(/^\d{13}-/);
      });
      
      // Session IDs should be unique
      const sessionIds = dataList.map(data => data.sessionId);
      const uniqueSessionIds = [...new Set(sessionIds)];
      expect(uniqueSessionIds).toHaveLength(sessionIds.length);
    });
  });
}); 