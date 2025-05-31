// Global setup для всіх тестів
import { beforeAll, afterAll } from 'vitest';

export async function setup() {
  console.log('🧪 Setting up global test environment...');
  
  // Mock environment variables
  process.env.NODE_ENV = 'test';
  process.env.CHROMA_HOST = 'localhost';
  process.env.CHROMA_PORT = '8000';
  process.env.RAG_SERVER_PORT = '8001';
  process.env.SCRAPER_CONCURRENCY = '5'; // Lower for tests
  process.env.SCRAPER_DELAY = '100';
  process.env.SCRAPER_MAX_PAGES = '10'; // Limit for tests
  
  // Mock external services (avoid real HTTP calls)
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    console.log(`[MOCK FETCH] ${input.toString()}`);
    return new Response(JSON.stringify({ mock: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
  
  console.log('✅ Global test environment ready');
}

export async function teardown() {
  console.log('🧹 Cleaning up global test environment...');
  
  // Cleanup any global mocks or resources
  delete global.fetch;
  
  console.log('✅ Global teardown complete');
} 