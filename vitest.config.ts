import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  
  test: {
    // Test environment
    environment: 'node',
    
    // Test patterns
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'src/**/__tests__/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'web-app/**', // Web-app має власні тести
      '.next/**'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/**/*.ts',
        'web-app/src/**/*.ts'
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/types.ts',
        'tests/**',
        'web-app/src/**/*.d.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 75,
          statements: 75
        }
      }
    },
    
    // Test timeout
    testTimeout: 10000,
    hookTimeout: 5000,
    
    // Global setup - comment out for now
    // globalSetup: ['./tests/setup/global-setup.ts'],
    // setupFiles: ['./tests/setup/test-setup.ts'],
    
    // Reporter
    reporter: ['verbose'],
    
    // Concurrent tests
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true // Для тестів з in-memory storage
      }
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './web-app/src'),
      '@/web-app': path.resolve(__dirname, './web-app/src'),
      '~/': path.resolve(__dirname, './src/')
    }
  }
}); 