# Agent Guidelines for Doc Scrapper

## Build/Test Commands
- `npm run build` - TypeScript compilation
- `npm test` - Run all tests with Vitest
- `npx vitest tests/unit/sessionStatus.test.ts` - Run single test file
- `npm run lint` - ESLint validation
- `npm run format` - Prettier formatting

## Code Style (from .cursorrules)
- Use TypeScript strict mode with ES2022 target
- Prefer async/await over Promise.then()
- Descriptive variable names (extractedContent vs content)
- Implement proper error handling with try/catch blocks
- Use interfaces for complex object structures
- Prefer composition over inheritance

## Imports & Architecture
- ES modules (`import`/`export`) with `"type": "module"`
- Path aliases: `~/` for `./src/`, `@/` for web-app
- Modular design: discovery → extraction → formatting → storage
- Strategy pattern for different site types

## Key Libraries
- **Cheerio**: Server-side jQuery for HTML parsing
- **Axios**: HTTP client with timeout and retry
- **Turndown**: HTML to Markdown conversion
- **Commander.js**: CLI framework

## Testing
- Vitest with node environment
- Tests in `tests/**/*.test.ts` or `src/**/__tests__/**/*.test.ts`
- Coverage thresholds: 70% branches/functions, 75% lines/statements
