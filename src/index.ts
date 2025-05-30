// Main entry point for the doc-scrapper library

// Export main classes for programmatic usage
export { DocumentationScraper } from './core/documentationScraper.js';
export { DefaultUrlDiscoverer } from './core/urlDiscoverer.js';
export { DefaultContentExtractor } from './extractors/contentExtractor.js';
export { MarkdownFormatter } from './formatters/markdownFormatter.js';
export { FileStorageAdapter } from './storage/fileStorage.js';
export { HttpClient } from './utils/httpClient.js';

// Export types
export * from './types/index.js';

// CLI entry point - only run if this file is executed directly
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// Check if this file is being run directly (not imported)
if (process.argv[1] === __filename || process.argv[1].endsWith('index.js')) {
  // Import and run CLI
  import('./cli/index.js').catch(error => {
    console.error('Failed to start CLI:', error);
    process.exit(1);
  });
} 