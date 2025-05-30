#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { DocumentationScraper } from '../core/documentationScraper.js';
import { ScrapingConfig } from '../types/index.js';

const program = new Command();

program
  .name('doc-scrapper')
  .description('Universal documentation scraper built with TypeScript')
  .version('1.0.0');

program
  .argument('<url>', 'Base URL of the documentation to scrape')
  .option('-o, --output <dir>', 'Output directory', './scraped-docs')
  .option('-f, --format <format>', 'Output format (markdown|json|html)', 'markdown')
  .option('-c, --concurrency <number>', 'Number of concurrent requests', '3')
  .option('-d, --delay <ms>', 'Delay between requests in milliseconds', '1000')
  .option('-m, --max-pages <number>', 'Maximum number of pages to scrape', '0')
  .option('--include <patterns>', 'Include URL patterns (comma-separated)', '')
  .option('--exclude <patterns>', 'Exclude URL patterns (comma-separated)', '')
  .option('--main-selector <selector>', 'CSS selector for main content', '')
  .option('--title-selector <selector>', 'CSS selector for page title', '')
  .option('--nav-selector <selector>', 'CSS selector for navigation', '')
  .option('-v, --verbose', 'Verbose logging', false)
  .action(async (url: string, options) => {
    try {
      // Validate URL
      new URL(url);
    } catch (error) {
      console.error('❌ Invalid URL provided');
      process.exit(1);
    }

    // Parse options
    const config: ScrapingConfig = {
      baseUrl: url,
      outputFormat: options.format as 'markdown' | 'json' | 'html',
      outputDir: path.resolve(options.output),
      maxConcurrency: parseInt(options.concurrency),
      rateLimitMs: parseInt(options.delay),
      maxDepth: parseInt(options.maxPages),
      selectors: {
        main: options.mainSelector || undefined,
        title: options.titleSelector || undefined,
        navigation: options.navSelector || undefined,
      },
      excludePatterns: options.exclude 
        ? options.exclude.split(',').map((p: string) => p.trim())
        : [],
      includePatterns: options.include
        ? options.include.split(',').map((p: string) => p.trim())
        : undefined,
    };

    // Validate format
    if (!['markdown', 'json', 'html'].includes(config.outputFormat)) {
      console.error('❌ Invalid format. Use: markdown, json, or html');
      process.exit(1);
    }

    if (options.verbose) {
      console.log('🔧 Configuration:');
      console.log(JSON.stringify(config, null, 2));
    }

    // Start scraping
    const scraper = new DocumentationScraper();
    
    try {
      const result = await scraper.scrape(url, config);
      
      if (result.success) {
        console.log('✅ Scraping completed successfully!');
        process.exit(0);
      } else {
        console.log('⚠️  Scraping completed with errors');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Scraping failed:', error);
      process.exit(1);
    }
  });

// Add examples help
program.addHelpText('after', `

Examples:
  $ doc-scrapper https://ai-sdk.dev/docs/introduction
  $ doc-scrapper https://docs.example.com -o ./docs -f markdown -c 5
  $ doc-scrapper https://api.example.com --include "/docs,/guide" --exclude "/legacy"
  $ doc-scrapper https://site.com --main-selector ".content" --delay 2000

Common selectors:
  --main-selector "main, .content, article, .docs-content"
  --title-selector "h1, .page-title, .document-title"
  --nav-selector "nav, .sidebar, .navigation, .toc"
`);

// Handle unknown commands
program.on('command:*', function (operands) {
  console.error(`❌ Unknown command '${operands[0]}'`);
  console.log('Use --help to see available commands');
  process.exit(1);
});

// Parse CLI arguments
program.parse(); 