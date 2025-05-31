import path from 'path';
import { existsSync } from 'fs';

/**
 * Отримує абсолютний шлях до root проекту (на рівень вище web-app/)
 */
export function getProjectRoot(): string {
  // В Next.js process.cwd() повертає шлях до web-app директорії
  return path.resolve(process.cwd(), '..');
}

/**
 * Отримує шлях до скомпільованого scraper
 */
export function getScraperPath(): string {
  const projectRoot = getProjectRoot();
  const scraperPath = path.join(projectRoot, 'dist', 'index.js');
  
  if (!existsSync(scraperPath)) {
    throw new Error(`Scraper not found at ${scraperPath}. Run 'npm run build' in project root.`);
  }
  
  return scraperPath;
}

/**
 * Отримує шлях до RAG indexer
 */
export function getRagIndexerPath(): string {
  const projectRoot = getProjectRoot();
  const ragPath = path.join(projectRoot, 'dist', 'rag', 'cli', 'indexDocuments.js');
  
  if (!existsSync(ragPath)) {
    throw new Error(`RAG indexer not found at ${ragPath}. Run 'npm run build' in project root.`);
  }
  
  return ragPath;
}

/**
 * Отримує шлях до директорії scraped-docs
 */
export function getScrapedDocsPath(collectionName: string): string {
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