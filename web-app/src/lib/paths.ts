import path from 'path';
import { existsSync } from 'fs';

/**
 * Отримує абсолютний шлях до root проекту (на рівень вище web-app/)
 */
export function getProjectRoot(): string {
  // В Docker environment файли змонтовані безпосередньо в /app
  if (process.env.NODE_ENV === 'production') {
    return '/app';
  }
  // В development режимі використовуємо стандартну логіку
  return path.resolve(process.cwd(), '..');
}

/**
 * Отримує шлях до скомпільованого scraper
 */
export function getScraperPath(): string {
  // В Docker environment dist змонтований в /app/dist
  const scraperPath = process.env.NODE_ENV === 'production' 
    ? '/app/dist/cli/index.js'
    : path.join(getProjectRoot(), 'dist', 'cli', 'index.js');
  
  if (!existsSync(scraperPath)) {
    throw new Error(`Scraper not found at ${scraperPath}. Run 'npm run build' in project root.`);
  }
  
  return scraperPath;
}

/**
 * Отримує шлях до RAG indexer
 */
export function getRagIndexerPath(): string {
  // В Docker environment dist змонтований в /app/dist
  const ragPath = process.env.NODE_ENV === 'production'
    ? '/app/dist/rag/cli/indexDocuments.js'
    : path.join(getProjectRoot(), 'dist', 'rag', 'cli', 'indexDocuments.js');
  
  if (!existsSync(ragPath)) {
    throw new Error(`RAG indexer not found at ${ragPath}. Run 'npm run build' in project root.`);
  }
  
  return ragPath;
}

/**
 * Отримує шлях до директорії scraped-docs
 */
export function getScrapedDocsPath(collectionName: string): string {
  // В Docker environment scraped-docs змонтований в /app/scraped-docs
  if (process.env.NODE_ENV === 'production') {
    return path.join('/app/scraped-docs', collectionName);
  }
  const projectRoot = getProjectRoot();
  return path.join(projectRoot, 'scraped-docs', collectionName);
}

/**
 * Валідує що всі необхідні шляхи існують
 */
export function validatePaths(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    getScraperPath();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Scraper path error');
  }
  
  try {
    getRagIndexerPath();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'RAG indexer path error');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
} 