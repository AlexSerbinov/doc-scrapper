# Testing Infrastructure - Doc Scrapper Project

## Загальний огляд

Поточна тестова інфраструктура побудована на **Vitest** і покриває API endpoints та CLI парсинг логіку з використанням mock data замість залежності від зовнішніх сайтів.

**Статус**: ✅ 81/81 тестів проходять (100% success rate)  
**Час виконання**: ~935ms для всіх тестів  
**Останнє оновлення**: 31.05.2025

## Архітектура тестів

```
tests/
├── setup/
│   ├── global-setup.ts      # Global test configuration
│   └── test-setup.ts        # Node.js environment mocks
├── fixtures/
│   └── mock-cli-output.ts   # Realistic mock data
├── unit/
│   ├── api-parsing.test.ts  # CLI output parsing logic
│   └── sessionStatus.test.ts # Session management
└── integration/
    ├── scrape-api.test.ts   # POST/GET /api/scrape endpoints
    └── progress-api.test.ts # GET /api/progress/[sessionId] endpoint
```

## Конфігурація

### vitest.config.ts
```typescript
export default defineConfig({
  plugins: [tsconfigPaths()], // Для @/ алиасів
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, functions: 80, branches: 70 }
    }
  }
});
```

### Ключові залежності
- **Vitest**: Test runner + assertions
- **vite-tsconfig-paths**: Для модульного resolution
- **Node.js mocks**: child_process, fs-extra, Next.js modules

## Що РЕАЛЬНО тестується

### ✅ API Logic (High Coverage)
- **Request validation**: URL format, required fields, type checking
- **Response formats**: Consistent JSON structure, status codes
- **Session ID generation**: Timestamp + URL hash algorithm
- **Collection name generation**: Domain parsing, path processing, ChromaDB compatibility
- **Error handling**: JSON parsing errors, validation failures, graceful degradation

```typescript
// Приклад реального тестування
it('should generate collection name from domain', async () => {
  const testCases = [
    { url: 'https://docs.example.com', expected: 'docs-example-com' },
    { url: 'https://help.github.com/articles', expected: 'help-github-com-articles' }
  ];
  // Тестується РЕАЛЬНА функція generateCollectionName()
});
```

### ✅ CLI Output Parsing (Realistic Mock Data)
- **Scraper output patterns**: SCRAPING_STATS, SCRAPING_PROGRESS, SCRAPING_COMPLETE
- **RAG output patterns**: Loading, chunking, embedding, indexing stages  
- **Progress calculation**: Percentage mapping, time estimates, statistics
- **Data consistency**: Progress bounds (0-100%), incremental updates
- **Error scenarios**: Malformed JSON, network timeouts, parsing failures

```typescript
// Mock data відображає реальні CLI patterns
const mockScraperOutputs = {
  scrapingStats: 'SCRAPING_STATS:{"urlsFound":487,"urlsTotal":487,"concurrency":5}',
  scrapingProgress: 'SCRAPING_PROGRESS:{"current":250,"total":487,"percentage":51}',
  scrapingComplete: 'SCRAPING_COMPLETE:{"successfulPages":487,"failedPages":0}'
};
```

### ✅ Session Management (In-Memory Storage)
- **CRUD operations**: Create, read, update, delete sessions
- **Progress tracking lifecycle**: starting → scraping → indexing → completed
- **Statistics calculation**: Scraping rates, time estimates, progress bounds
- **Concurrent sessions**: Multiple simultaneous sessions
- **Type safety**: ProgressStatus interface validation

## Що НЕ тестується (Mocked)

### ❌ Process Spawning
```typescript
// Повністю замокано
vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({ /* fake process */ }))
}));
```
**Ризики**: Не ловимо помилки реального spawn, argument passing, process lifecycle

### ❌ File System Operations  
```typescript
// Замокано
vi.mock('fs-extra', () => ({
  ensureDir: vi.fn(() => Promise.resolve()),
  writeFile: vi.fn(() => Promise.resolve())
}));
```
**Ризики**: Не тестуємо реальне створення файлів, permissions, disk space

### ❌ Path Resolution
```typescript
// Статичні моки
vi.mock('../../web-app/src/lib/paths', () => ({
  getProjectRoot: () => '/mock/project/root',
  getScraperPath: () => '/mock/dist/index.js'
}));
```
**Ризики**: Не перевіряємо чи існують реальні файли, правильність шляхів

### ❌ Environment Integration
- Не тестується реальна взаємодія з ChromaDB
- Не тестується RAG indexing pipeline
- Не тестується справжня мережева активність
- Не тестується production environment behavior

### ❌ Real Progress Updates
- Моки не генерують справжні progress patterns
- Не тестується real-time parsing CLI output
- Не тестується performance з великими файлами
- Не тестується memory usage patterns

## Test Categories Analysis

### 🟢 Unit Tests (46 тестів)
**Файли**: `api-parsing.test.ts`, `sessionStatus.test.ts`  
**Покриття**: CLI parsing logic, session management, utility functions  
**Якість**: ⭐⭐⭐⭐⭐ High - isolated, fast, reliable

```typescript
// Приклад якісного unit тесту
describe('estimateTimeRemaining', () => {
  it('should calculate correct time estimates', () => {
    // (500-100) / (100/50) = 400 / 2 = 200 seconds
    expect(estimateTimeRemaining(100, 500, 50)).toBe(200);
  });
});
```

### 🟡 Integration Tests (35 тестів)  
**Файли**: `scrape-api.test.ts`, `progress-api.test.ts`  
**Покриття**: API endpoints з мокованими externals  
**Якість**: ⭐⭐⭐⭐ Good - тестує API contract, але з обмеженнями

```typescript
// Приклад integration тесту з моками
it('should spawn scraper process with correct arguments', async () => {
  await POST(mockRequest);
  expect(mockSpawn).toHaveBeenCalledWith('node', expectedArgs);
  // ❌ Не тестує реальний spawn
});
```

### 🔴 E2E Tests (0 тестів)
**Статус**: Відсутні  
**Потрібно**: Browser automation, real process testing, full workflow

## Mock Data Quality

### ⭐⭐⭐⭐⭐ Realistic CLI Patterns
Mock data в `mock-cli-output.ts` **високої якості** і відображає реальні patterns:

```typescript
// Базується на реальних CLI outputs
export const mockScraperOutputs = {
  scrapingStats: 'SCRAPING_STATS:{"urlsFound":487,"urlsTotal":487}',
  scrapingProgress: 'SCRAPING_PROGRESS:{"current":250,"total":487}',
  scrapingErrors: ['SCRAPING_ERROR:Network timeout', 'SCRAPING_ERROR:404 Not Found']
};

// Генерація test scenarios
export const testScenarios = {
  successFlow: [...],  // Повний успішний workflow
  errorCases: [...],   // Різні типи помилок
  largeSites: [...],   // Великі сайти з багатьма сторінками
  edgeCases: [...]     // Нестандартні ситуації
};
```

### Benefits of Mock Approach
1. **Швидкість**: 935ms для 81 тесту
2. **Надійність**: Не залежать від зовнішніх сайтів
3. **Детермінізм**: Однакові результати кожного разу
4. **Coverage**: Тестуємо edge cases що важко відтворити з реальними сайтами

## Coverage Analysis

### High Coverage Areas (80-95%)
- ✅ API request validation
- ✅ Response formatting  
- ✅ Session management
- ✅ CLI output parsing
- ✅ Error handling patterns
- ✅ Collection name generation
- ✅ Progress calculations

### Medium Coverage Areas (50-80%)
- 🟡 Path resolution logic
- 🟡 Environment configuration
- 🟡 Process argument building
- 🟡 Statistics calculations

### Low Coverage Areas (0-50%)
- ❌ Real file system operations
- ❌ Process spawning and lifecycle
- ❌ Network requests
- ❌ Database interactions
- ❌ Memory/performance characteristics
- ❌ Production environment behavior

## Gap Analysis & Risks

### Critical Gaps
1. **Process Integration**: Не тестуємо реальний spawn → можуть бути проблеми з arguments, paths
2. **File System**: Не тестуємо створення файлів → можуть бути проблеми з permissions
3. **Path Resolution**: Не тестуємо реальні шляхи → можуть не існувати compiled files
4. **End-to-End Flow**: Не тестуємо повний workflow → можуть бути проблеми інтеграції

### Production Risks
- **Silent Failures**: Моки приховують реальні помилки
- **Path Issues**: Compiled files можуть не існувати в production
- **Process Arguments**: Неправильні аргументи можуть не бути помічені
- **Performance**: Не тестуємо memory/CPU usage

## Future Testing Strategy

### Phase 1: Contract Tests (Priority: High)
```typescript
// Тести без моків для критичних компонентів
describe('Real Process Spawning', () => {
  it('should actually spawn scraper on test URL', async () => {
    // Використовувати httpbin.org або інший test endpoint
    const result = await spawnRealScraper('https://httpbin.org/html');
    expect(result.exitCode).toBe(0);
    expect(result.outputFiles).toContain('index.md');
  });
});
```

### Phase 2: Integration Tests (Priority: Medium)
```typescript
// Тести з мінімальним мокуванням
describe('File System Integration', () => {
  it('should create real output files', async () => {
    const tempDir = await fs.mkdtemp('/tmp/test-');
    await runScraper('https://test-site.com', tempDir);
    expect(await fs.pathExists(`${tempDir}/index.md`)).toBe(true);
  });
});
```

### Phase 3: E2E Tests (Priority: Medium)
```typescript
// Playwright або Cypress тести
test('complete workflow from UI to chat', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('[data-testid="url-input"]', TEST_URL);
  await page.click('[data-testid="submit"]');
  
  // Wait for progress completion
  await expect(page.locator('[data-testid="chat-ready"]')).toBeVisible();
  
  // Test chat functionality
  await page.fill('[data-testid="chat-input"]', 'What is this documentation about?');
  await expect(page.locator('[data-testid="ai-response"]')).toContainText('documentation');
});
```

### Phase 4: Performance Tests (Priority: Low)
```typescript
// Memory і performance benchmarks
describe('Performance Benchmarks', () => {
  it('should handle large documentation sites', async () => {
    const startMemory = process.memoryUsage();
    await processSite('https://large-docs-site.com');
    const endMemory = process.memoryUsage();
    
    expect(endMemory.heapUsed - startMemory.heapUsed).toBeLessThan(500_000_000); // 500MB limit
  });
});
```

## Test Data Management

### Current Mock Strategy
```typescript
// Centralized в mock-cli-output.ts
export const mockApiResponses = {
  starting: { status: 'starting', progress: 10, message: '...' },
  scraping: { status: 'scraping', progress: 45, message: '...' },
  completed: { status: 'completed', progress: 100, chatUrl: '/demo/...' }
};

// Helper functions
export function generateTestSession(): string;
export function simulateScrapingProgress(sessionId: string): void;
```

### Future Test Data Strategy
1. **Real Test Sites**: Створити набір стабільних test URLs
2. **Snapshot Testing**: Зберігати known good outputs
3. **Test Fixtures**: Готові файли для testing file operations
4. **Database Seeds**: Тестові дані для ChromaDB integration

## Recommendations

### Immediate Actions (Next Sprint)
1. ✅ **Keep Current Tests**: Вони цінні для regression protection
2. 🔧 **Add Contract Tests**: 5-10 тестів з реальними компонентами
3. 📋 **Document Test URLs**: Створити список стабільних сайтів для testing
4. 🎯 **Path Validation Tests**: Перевірити що compiled files існують

### Medium Term (Next Month)
1. 🌐 **E2E Tests**: Playwright setup для критичних user flows
2. 🔗 **Integration Tests**: Real file system + real processes
3. 📊 **Performance Baselines**: Memory/speed benchmarks
4. 🚀 **CI/CD Integration**: Automated testing в GitHub Actions

### Long Term (Future)  
1. 🎭 **Chaos Testing**: Тестування failure scenarios
2. 📈 **Load Testing**: High concurrency scenarios
3. 🔒 **Security Testing**: Input validation, XSS prevention
4. 📱 **Cross-Platform**: Testing на різних OS/Node versions

## Test Execution Commands

```bash
# Всі тести
npm test

# Тільки unit тести
npm test -- tests/unit

# Тільки integration тести  
npm test -- tests/integration

# З coverage report
npm test -- --coverage

# Watch mode для development
npm test -- --watch

# Debug specific test
npm test -- --reporter=verbose api-parsing.test.ts
```

## Conclusion

**Поточна тестова інфраструктура** - це **solid foundation** з високою якістю mock data та comprehensive API coverage. Тести **цінні для regression protection** та швидкого feedback під час розробки.

**Основні переваги**:
- ✅ Швидкі та надійні
- ✅ Детальне покриття API logic
- ✅ Realistic mock data
- ✅ Хороша структура та maintainability

**Ключові обмеження**:
- ❌ Не тестують real integration
- ❌ Можуть пропустити production issues
- ❌ Обмежені в знаходженні performance problems

**Next Steps**: Поступово додавати contract та integration тести, зберігаючи поточні unit тести як база для швидкого feedback loop.

---

**Статус**: Production Ready з обмеженнями  
**Maintainer**: Development Team  
**Last Review**: 31.05.2025 