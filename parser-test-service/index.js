#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

import { MercuryExtractor } from './extractors/mercury-extractor.js';
import { ReadabilityExtractor } from './extractors/readability-extractor.js';
import { JinaExtractor } from './extractors/jina-extractor.js';
import { UrlDiscovery } from './url-discovery.js';
import { FileStorage } from './file-storage.js';

const program = new Command();

program
  .name('parser-test-service')
  .description('Standalone documentation parser testing service')
  .version('1.0.0');

program
  .command('test')
  .description('Test different parsers on a single URL')
  .argument('<url>', 'URL to test')
  .option('-a, --all', 'Test all parsers', false)
  .option('-m, --mercury', 'Test Mercury Parser', false)
  .option('-r, --readability', 'Test Readability', false)
  .option('-j, --jina', 'Test Jina Reader', false)
  .action(async (url, options) => {
    console.log(chalk.blue.bold('🧪 Parser Testing Service\n'));
    console.log(chalk.gray(`Testing URL: ${url}\n`));

    const extractors = [];
    
    if (options.all || options.mercury) {
      extractors.push(new MercuryExtractor());
    }
    if (options.all || options.readability) {
      extractors.push(new ReadabilityExtractor());
    }
    if (options.all || options.jina) {
      extractors.push(new JinaExtractor());
    }

    if (extractors.length === 0) {
      extractors.push(new MercuryExtractor(), new ReadabilityExtractor(), new JinaExtractor());
    }

    for (const extractor of extractors) {
      const spinner = ora(`Testing ${extractor.name}`).start();
      
      try {
        const result = await extractor.extract(url);
        
        if (result.success) {
          spinner.succeed(`${extractor.name}: ${result.extractionTime}ms, ${result.wordCount} words`);
          console.log(chalk.gray(`  Title: ${result.title}`));
          console.log(chalk.gray(`  Content: ${result.contentLength} chars\n`));
        } else {
          spinner.fail(`${extractor.name}: ${result.error}`);
        }
      } catch (error) {
        spinner.fail(`${extractor.name}: ${error.message}`);
      }

      // Add delay between tests
      if (extractor.name.includes('Jina')) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  });

program
  .command('scrape')
  .description('Discover and scrape entire documentation site')
  .argument('<startUrl>', 'Starting URL for documentation')
  .option('-o, --output <dir>', 'Output directory', './scraped-docs')
  .option('-p, --pages <number>', 'Maximum pages to scrape', '50')
  .option('-d, --depth <number>', 'Maximum crawl depth', '3')
  .option('-e, --extractor <type>', 'Extractor to use (mercury|readability|jina|auto)', 'auto')
  .option('--no-discovery', 'Skip URL discovery, scrape only start URL')
  .action(async (startUrl, options) => {
    console.log(chalk.blue.bold('🚀 Documentation Scraper\n'));
    
    const maxPages = parseInt(options.pages);
    const maxDepth = parseInt(options.depth);
    const outputDir = options.output;
    
    console.log(chalk.gray(`Start URL: ${startUrl}`));
    console.log(chalk.gray(`Max pages: ${maxPages}`));
    console.log(chalk.gray(`Max depth: ${maxDepth}`));
    console.log(chalk.gray(`Output: ${outputDir}`));
    console.log(chalk.gray(`Extractor: ${options.extractor}\n`));

    let urls = [startUrl];

    // URL Discovery phase
    if (options.discovery !== false) {
      const discovery = new UrlDiscovery();
      const discoverySpinner = ora('Discovering URLs...').start();

      try {
        urls = await discovery.discoverUrls(startUrl, {
          maxPages: maxPages,
          maxDepth: maxDepth
        });
        discoverySpinner.succeed(`Found ${urls.length} URLs to scrape`);
      } catch (error) {
        discoverySpinner.fail(`URL discovery failed: ${error.message}`);
        console.log(chalk.yellow('Continuing with start URL only...\n'));
      }
    }

    // Choose extractor
    let extractor;
    switch (options.extractor) {
      case 'mercury':
        extractor = new MercuryExtractor();
        break;
      case 'readability':
        extractor = new ReadabilityExtractor();
        break;
      case 'jina':
        extractor = new JinaExtractor();
        break;
      case 'auto':
      default:
        // Auto-select based on site analysis
        extractor = await selectBestExtractor(startUrl);
        break;
    }

    console.log(chalk.green(`Selected extractor: ${extractor.name}\n`));

    // Scraping phase
    const storage = new FileStorage(outputDir);
    const results = [];
    const extractorStats = {};

    const scrapingSpinner = ora(`Scraping 0/${urls.length} pages...`).start();

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      scrapingSpinner.text = `Scraping ${i + 1}/${urls.length}: ${url.substring(0, 60)}...`;

      try {
        const result = await extractor.extract(url);
        result.url = url; // Ensure URL is set
        results.push(result);

        // Update stats
        const extractorName = result.extractor || extractor.name.toLowerCase();
        if (!extractorStats[extractorName]) {
          extractorStats[extractorName] = { total: 0, successful: 0, totalTime: 0 };
        }
        extractorStats[extractorName].total++;
        if (result.success) {
          extractorStats[extractorName].successful++;
          extractorStats[extractorName].totalTime += result.extractionTime;
        }

        // Save result
        if (result.success) {
          await storage.saveResult(result, i, urls.length);
        }

      } catch (error) {
        console.log(chalk.red(`Failed to scrape ${url}: ${error.message}`));
        results.push({
          success: false,
          url: url,
          error: error.message,
          extractionTime: 0,
          extractor: extractor.name.toLowerCase()
        });
      }

      // Rate limiting
      if (extractor.name.includes('Jina') && i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Calculate average times
    Object.keys(extractorStats).forEach(extractorName => {
      const stats = extractorStats[extractorName];
      stats.avgTime = stats.successful > 0 
        ? Math.round(stats.totalTime / stats.successful)
        : 0;
    });

    scrapingSpinner.succeed(`Completed scraping ${results.length} pages`);

    // Generate summary
    const summarySpinner = ora('Generating summary...').start();
    try {
      const summary = await storage.createSummary(results, extractorStats);
      summarySpinner.succeed(`Summary generated: ${summary.successRate} success rate`);
      
      console.log(chalk.green.bold('\n✅ Scraping completed successfully!'));
      console.log(chalk.gray(`Output directory: ${outputDir}`));
      console.log(chalk.gray(`Total words extracted: ${summary.totalWords.toLocaleString()}`));
      
    } catch (error) {
      summarySpinner.fail(`Failed to generate summary: ${error.message}`);
    }
  });

async function selectBestExtractor(url) {
  console.log(chalk.blue('🔍 Auto-selecting best extractor...'));
  
  // Simple heuristics for extractor selection
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    // Site-specific preferences
    if (domain.includes('github') || domain.includes('gitlab')) {
      console.log(chalk.gray('Detected Git platform - using Readability'));
      return new ReadabilityExtractor();
    }
    
    if (domain.includes('docs.') || domain.includes('api.')) {
      console.log(chalk.gray('Detected docs subdomain - using Mercury'));
      return new MercuryExtractor();
    }
    
    // Default to Mercury for speed
    console.log(chalk.gray('Using Mercury Parser (default)'));
    return new MercuryExtractor();
    
  } catch {
    return new MercuryExtractor();
  }
}

program.parse(); 