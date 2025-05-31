import cliProgress from 'cli-progress';
import { 
  Scraper, 
  ScrapingConfig, 
  ScrapingResult, 
  ScrapingError,
  ProcessedPage,
  ScrapingSummary,
  HttpClientOptions
} from '../types/index.js';
import { HttpClient } from '../utils/httpClient.js';
import { DefaultUrlDiscoverer } from './urlDiscoverer.js';
import { DefaultContentExtractor } from '../extractors/contentExtractor.js';
import { MarkdownFormatter } from '../formatters/markdownFormatter.js';
import { FileStorageAdapter } from '../storage/fileStorage.js';

export class DocumentationScraper implements Scraper {
  private httpClient: HttpClient;
  private urlDiscoverer: DefaultUrlDiscoverer;
  private contentExtractor: DefaultContentExtractor;
  private formatter: MarkdownFormatter;
  private storageAdapter: FileStorageAdapter;
  private progressBar?: cliProgress.SingleBar;

  constructor() {
    const httpOptions: HttpClientOptions = {
      timeout: 30000,
      maxRetries: 25,
      retryDelay: 50,
      userAgent: 'DocumentationScraper/1.0.0 (Educational Purpose)'
    };

    this.httpClient = new HttpClient(httpOptions);
    this.urlDiscoverer = new DefaultUrlDiscoverer(this.httpClient);
    this.contentExtractor = new DefaultContentExtractor();
    this.formatter = new MarkdownFormatter();
    this.storageAdapter = new FileStorageAdapter();
  }

  async scrape(url: string, config: ScrapingConfig): Promise<ScrapingResult> {
    const startTime = new Date();
    const errors: ScrapingError[] = [];
    const processedPages: ProcessedPage[] = [];

    try {
      console.log(`🚀 Starting scraping of ${url}`);

      // 1. Check robots.txt
      const robotsAllowed = await this.httpClient.checkRobotsTxt(url);
      if (!robotsAllowed) {
        throw new Error('Scraping not allowed by robots.txt');
      }

      // 2. Discover URLs
      console.log('🔍 Discovering URLs...');
      const discovery = await this.urlDiscoverer.discover(url, config);
      
      if (discovery.errors.length > 0) {
        discovery.errors.forEach(error => {
          errors.push({
            url: 'discovery',
            error,
            timestamp: new Date()
          });
        });
      }

      const urlsToScrape = discovery.urls.slice(0, config.maxDepth > 0 ? config.maxDepth : discovery.urls.length);
      console.log(`📄 Found ${urlsToScrape.length} URLs to scrape`);

      if (urlsToScrape.length === 0) {
        throw new Error('No URLs found to scrape');
      }

      // 3. Setup progress tracking
      this.setupProgressBar(urlsToScrape.length);

      // 4. Process URLs with concurrency limit
      await this.processUrlsWithConcurrency(
        urlsToScrape, 
        config, 
        processedPages, 
        errors
      );

      // 5. Save results
      if (processedPages.length > 0) {
        console.log('\n💾 Saving results...');
        await this.storageAdapter.save(processedPages, config);
      }

    } catch (error) {
      console.error('❌ Scraping failed:', error);
      errors.push({
        url: 'scraper',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
    } finally {
      this.progressBar?.stop();
    }

    const endTime = new Date();
    const summary: ScrapingSummary = {
      totalPages: processedPages.length + errors.length,
      successfulPages: processedPages.length,
      failedPages: errors.length,
      startTime,
      endTime,
      outputFormat: config.outputFormat,
      outputDirectory: config.outputDir
    };

    this.printSummary(summary, errors);

    return {
      success: errors.length === 0 || processedPages.length > 0,
      pages: processedPages,
      errors,
      summary
    };
  }

  private async processUrlsWithConcurrency(
    urls: string[],
    config: ScrapingConfig,
    processedPages: ProcessedPage[],
    errors: ScrapingError[]
  ): Promise<void> {
    const concurrency = Math.min(config.maxConcurrency, urls.length);
    const chunks = this.chunkArray(urls, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(url => this.processUrl(url, config));
      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        const url = chunk[index];
        
        if (result.status === 'fulfilled' && result.value) {
          processedPages.push(result.value);
        } else {
          const error = result.status === 'rejected' ? result.reason : 'Unknown error';
          errors.push({
            url,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date()
          });
        }

        this.progressBar?.increment();
      });

      // Rate limiting between chunks
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(config.rateLimitMs);
      }
    }
  }

  private async processUrl(url: string, config: ScrapingConfig): Promise<ProcessedPage | null> {
    try {
      // Fetch the page
      const response = await this.httpClient.get(url, config.rateLimitMs);
      
      // Extract content
      const extractedContent = await this.contentExtractor.extract(
        response.data, 
        url, 
        config.selectors
      );

      // Format content
      const formattedContent = this.formatter.format(extractedContent);

      return {
        url,
        title: extractedContent.title,
        content: formattedContent,
        metadata: extractedContent.metadata,
        outputPath: '' // Will be set by storage adapter
      };

    } catch (error) {
      throw error;
    }
  }

  private setupProgressBar(total: number): void {
    this.progressBar = new cliProgress.SingleBar({
      format: 'Progress |{bar}| {percentage}% | {value}/{total} | {url}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    this.progressBar.start(total, 0, { url: 'Starting...' });
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private printSummary(summary: ScrapingSummary, errors: ScrapingError[]): void {
    const duration = summary.endTime.getTime() - summary.startTime.getTime();
    const durationSeconds = Math.round(duration / 1000);

    console.log('\n📊 Scraping Summary:');
    console.log(`   ✅ Successful pages: ${summary.successfulPages}`);
    console.log(`   ❌ Failed pages: ${summary.failedPages}`);
    console.log(`   ⏱️  Duration: ${durationSeconds}s`);
    console.log(`   📁 Output: ${summary.outputDirectory}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error.url}: ${error.error}`);
      });
      if (errors.length > 5) {
        console.log(`   ... and ${errors.length - 5} more errors`);
      }
    }
  }
} 