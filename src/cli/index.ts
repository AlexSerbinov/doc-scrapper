#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { DocumentationScraper, DocumentationScraperOptions } from '../core/documentationScraper.js';
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
  .option('-c, --concurrency <number>', 'Number of concurrent requests', '25')
  .option('-d, --delay <ms>', 'Delay between requests in milliseconds', '50')
  .option('-m, --max-pages <number>', 'Maximum number of pages to scrape', '0')
  .option('--include <patterns>', 'Include URL patterns (comma-separated)', '')
  .option('--exclude <patterns>', 'Exclude URL patterns (comma-separated)', '')
  .option('--main-selector <selector>', 'CSS selector for main content', '')
  .option('--title-selector <selector>', 'CSS selector for page title', '')
  .option('--nav-selector <selector>', 'CSS selector for navigation', '')
  // Content extraction methods
  .option('--jina-mode', 'Use Jina Reader API for content extraction (recommended for better quality)', false)
  // JavaScript/SPA support options
  .option('--js-mode', 'Force JavaScript mode for SPA sites', false)
  .option('--static-mode', 'Force static mode (disable JavaScript)', false)
  .option('--js-timeout <ms>', 'JavaScript execution timeout in milliseconds', '30000')
  .option('--wait-strategy <strategy>', 'Wait strategy for JavaScript sites (networkidle|domcontent|load)', 'networkidle')
  .option('--wait-selector <selector>', 'Wait for specific CSS selector before extracting content', '')
  .option('--analyze-only', 'Only analyze site type without scraping', false)
  .option('--compare-strategies', 'Compare static vs JavaScript discovery methods', false)
  .option('--compare-extraction', 'Compare static vs JavaScript extraction methods', false)
  .option('--compare-jina', 'Compare Jina Reader vs native extraction methods', false)
  .option('-v, --verbose', 'Verbose logging', false)
  .action(async (url: string, options) => {
    try {
      // Validate URL
      new URL(url);
    } catch (error) {
      console.error('❌ Invalid URL provided');
      process.exit(1);
    }

    // Validate conflicting options
    if (options.jsMode && options.staticMode) {
      console.error('❌ Cannot use both --js-mode and --static-mode simultaneously');
      process.exit(1);
    }

    if (options.jinaMode && (options.jsMode || options.staticMode)) {
      console.error('❌ --jina-mode cannot be combined with --js-mode or --static-mode (Jina handles all content types automatically)');
      process.exit(1);
    }

    // Validate wait strategy
    const validWaitStrategies = ['networkidle', 'domcontent', 'load'];
    if (!validWaitStrategies.includes(options.waitStrategy)) {
      console.error(`❌ Invalid wait strategy. Use: ${validWaitStrategies.join(', ')}`);
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

    // Enhanced discovery options
    const discoveryOptions = {
      forceJavaScript: options.jsMode,
      forceStatic: options.staticMode,
      jsTimeout: parseInt(options.jsTimeout),
      waitStrategy: options.waitStrategy as 'networkidle' | 'domcontent' | 'load',
      waitSelector: options.waitSelector || undefined,
    };

    // Enhanced extraction options
    const extractionOptions = {
      forceJavaScript: options.jsMode,
      forceStatic: options.staticMode,
      useJinaReader: options.jinaMode,
      jsTimeout: 30000,
      waitStrategy: 'networkidle' as const,
      waitSelector: undefined
    };

    const scraperOptions: DocumentationScraperOptions = {
      discoveryOptions,
      extractionOptions
    };

    // Validate format
    if (!['markdown', 'json', 'html'].includes(config.outputFormat)) {
      console.error('❌ Invalid format. Use: markdown, json, or html');
      process.exit(1);
    }

    if (options.verbose) {
      console.log('🔧 Configuration:');
      console.log(JSON.stringify({ config, discoveryOptions, extractionOptions }, null, 2));
    }

    // Create scraper instance
    const scraper = new DocumentationScraper(scraperOptions);

    // Handle special modes
    if (options.analyzeOnly) {
      console.log('🔬 Analyzing site type...');
      try {
        const analysis = await scraper.analyzeSite(url);
        console.log('\n📊 Site Analysis Results:');
        console.log(`   Type: ${analysis.type}`);
        console.log(`   Confidence: ${analysis.confidence}%`);
        console.log(`   Characteristics:`);
        analysis.characteristics.forEach(char => console.log(`     - ${char}`));
        console.log(`   Recommendations:`);
        console.log(`     - Use JavaScript: ${analysis.recommendations.useJavaScript}`);
        if (analysis.recommendations.waitStrategy) {
          console.log(`     - Wait Strategy: ${analysis.recommendations.waitStrategy}`);
        }
        if (analysis.recommendations.waitSelector) {
          console.log(`     - Wait Selector: ${analysis.recommendations.waitSelector}`);
        }
        process.exit(0);
      } catch (error) {
        console.error('❌ Site analysis failed:', error);
        process.exit(1);
      }
    }

    if (options.compareStrategies) {
      console.log('🔬 Comparing discovery strategies...');
      try {
        const comparison = await scraper.compareDiscoveryStrategies(url, config);
        
        console.log('\n📊 Strategy Comparison Results:');
        console.log(`\n🔍 Site Analysis:`);
        console.log(`   Type: ${comparison.siteAnalysis.type} (${comparison.siteAnalysis.confidence}% confidence)`);
        console.log(`   Characteristics: ${comparison.siteAnalysis.characteristics.join(', ')}`);
        
        console.log(`\n📄 Static Strategy:`);
        console.log(`   URLs Found: ${comparison.staticResult.urls.length}`);
        console.log(`   Sitemap URLs: ${comparison.staticResult.sitemap?.length || 0}`);
        console.log(`   Navigation URLs: ${comparison.staticResult.navigation?.length || 0}`);
        console.log(`   Errors: ${comparison.staticResult.errors.length}`);
        
        console.log(`\n🚀 JavaScript Strategy:`);
        console.log(`   URLs Found: ${comparison.javascriptResult.urls.length}`);
        console.log(`   Sitemap URLs: ${comparison.javascriptResult.sitemap?.length || 0}`);
        console.log(`   Navigation URLs: ${comparison.javascriptResult.navigation?.length || 0}`);
        console.log(`   Errors: ${comparison.javascriptResult.errors.length}`);
        
        console.log(`\n💡 Recommendation: Use ${comparison.siteAnalysis.recommendations.useJavaScript ? 'JavaScript' : 'Static'} strategy`);
        
        process.exit(0);
      } catch (error) {
        console.error('❌ Strategy comparison failed:', error);
        process.exit(1);
      }
    }

    if (options.compareExtraction) {
      console.log('🔬 Comparing extraction methods...');
      try {
        const comparison = await scraper.compareExtractionStrategies(url, config.selectors);
        
        console.log('\n📊 Extraction Comparison Results:');
        console.log(`\n📄 Static Extraction:`);
        console.log(`   Title: "${comparison.staticResult.title}"`);
        console.log(`   Content Length: ${comparison.staticResult.content.length} characters`);
        console.log(`   Content Preview: ${comparison.staticResult.content.substring(0, 150)}...`);
        
        console.log(`\n🚀 JavaScript Extraction:`);
        console.log(`   Title: "${comparison.javascriptResult.title}"`);
        console.log(`   Content Length: ${comparison.javascriptResult.content.length} characters`);
        console.log(`   Content Preview: ${comparison.javascriptResult.content.substring(0, 150)}...`);
        
        console.log(`\n💡 Recommendation: Use ${comparison.recommendation} extraction`);
        
        process.exit(0);
      } catch (error) {
        console.error('❌ Extraction comparison failed:', error);
        process.exit(1);
      }
    }

    if (options.compareJina) {
      console.log('🔬 Comparing Jina Reader vs native extraction...');
      try {
        const comparison = await scraper.compareJinaExtraction(url, config.selectors);
        
        console.log('\n📊 Jina vs Native Extraction Comparison:');
        console.log(`\n📄 Native Static Extraction:`);
        console.log(`   Title: "${comparison.staticResult.title}"`);
        console.log(`   Content Length: ${comparison.staticResult.content.length} characters`);
        console.log(`   Word Count: ${comparison.staticResult.metadata.wordCount || 0} words`);
        console.log(`   Content Preview: ${comparison.staticResult.content.substring(0, 150)}...`);
        
        console.log(`\n🚀 Native JavaScript Extraction:`);
        console.log(`   Title: "${comparison.javascriptResult.title}"`);
        console.log(`   Content Length: ${comparison.javascriptResult.content.length} characters`);
        console.log(`   Word Count: ${comparison.javascriptResult.metadata.wordCount || 0} words`);
        console.log(`   Content Preview: ${comparison.javascriptResult.content.substring(0, 150)}...`);
        
        console.log(`\n🎯 Jina Reader Extraction:`);
        console.log(`   Title: "${comparison.jinaResult.title}"`);
        console.log(`   Content Length: ${comparison.jinaResult.content.length} characters`);
        console.log(`   Word Count: ${comparison.jinaResult.metadata.wordCount || 0} words`);
        console.log(`   Headers Found: ${comparison.jinaResult.metadata.headers?.length || 0}`);
        console.log(`   Content Preview: ${comparison.jinaResult.content.substring(0, 150)}...`);
        
        console.log(`\n💡 Winner: ${comparison.recommendation}`);
        console.log(`\n💡 Reason: ${comparison.reason}`);
        
        process.exit(0);
      } catch (error) {
        console.error('❌ Jina comparison failed:', error);
        process.exit(1);
      }
    }

    // Start scraping
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

program.parse();