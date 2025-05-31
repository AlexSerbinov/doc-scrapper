// Setup що виконується перед кожним тест файлом
import { vi, beforeEach, afterEach } from 'vitest';

// Mock Node.js modules
vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn((event, callback) => {
      if (event === 'close') {
        setTimeout(() => callback(0), 100); // Simulate successful completion
      }
    }),
    kill: vi.fn()
  }))
}));

vi.mock('fs-extra', () => ({
  ensureDir: vi.fn(() => Promise.resolve()),
  writeFile: vi.fn(() => Promise.resolve()),
  readFile: vi.fn(() => Promise.resolve('mock file content')),
  pathExists: vi.fn(() => Promise.resolve(true))
}));

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: 'mock response' })),
    post: vi.fn(() => Promise.resolve({ data: 'mock response' }))
  }
}));

// Mock console methods (optional - remove if you want to see console output)
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
};

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset Date.now for consistent timing tests
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-31T10:00:00.000Z'));
});

afterEach(() => {
  // Restore real timers after each test
  vi.useRealTimers();
  
  // Additional cleanup if needed
  vi.clearAllTimers();
}); 