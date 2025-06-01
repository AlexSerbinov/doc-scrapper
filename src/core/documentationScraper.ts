import { Scraper, ScrapingConfig, ScrapingResult, ProcessedPage, ScrapingError, ScrapingSummary, HttpClientOptions } from '../types/index.js';
import { EnhancedUrlDiscoverer, EnhancedDiscoveryOptions } from './enhancedUrlDiscoverer.js';
import { EnhancedContentExtractor, EnhancedExtractionOptions } from '../extractors/enhancedContentExtractor.js';
import { MarkdownFormatter } from '../formatters/markdownFormatter.js';
import { FileStorageAdapter } from '../storage/fileStorage.js';
import { HttpClient } from '../utils/httpClient.js';
import { SiteAnalysis } from '../strategies/SiteTypeDetector.js';

// External dependencies
import * as cliProgress from 'cli-progress';

export interface DocumentationScraperOptions {
  httpOptions?: Partial<HttpClientOptions>;
  discoveryOptions?: EnhancedDiscoveryOptions;
  extractionOptions?: EnhancedExtractionOptions;
}

export class DocumentationScraper implements Scraper {
  private httpClient: HttpClient;
  private urlDiscoverer: EnhancedUrlDiscoverer;
  private contentExtractor: EnhancedContentExtractor;
  private formatter: MarkdownFormatter;
  private storageAdapter: FileStorageAdapter;
  private progressBar?: cliProgress.SingleBar;
  private siteAnalysis?: SiteAnalysis; // Store site analysis for content extraction

  constructor(options: DocumentationScraperOptions = {}) {
    const httpOptions: HttpClientOptions = {
      timeout: 45000,
      maxRetries: 3,
      retryDelay: 1000,
      userAgent: 'DocumentationScraper/1.0.0 (Educational Purpose)',
      ...options.httpOptions
    };

    this.httpClient = new HttpClient(httpOptions);
    this.urlDiscoverer = new EnhancedUrlDiscoverer(this.httpClient, options.discoveryOptions);
    this.contentExtractor = new EnhancedContentExtractor(this.httpClient, {
      useJinaReader: options.extractionOptions?.useJinaReader || false
    });
    this.formatter = new MarkdownFormatter();
    this.storageAdapter = new FileStorageAdapter();
  }

  async scrape(url: string, config: ScrapingConfig): Promise<ScrapingResult> {
    const startTime = new Date();
    const errors: ScrapingError[] = [];
    const processedPages: ProcessedPage[] = [];

    try {
      console.log(`🚀 Starting scrape of ${url}`);

      // 1. Check robots.txt
      const robotsAllowed = await this.httpClient.checkRobotsTxt(url);
      if (!robotsAllowed) {
        throw new Error('Scraping not allowed by robots.txt');
      }

      // 2. Get site analysis for better extraction strategy
      console.log('🔬 Analyzing site type for optimal extraction...');
      try {
        this.siteAnalysis = await this.urlDiscoverer.analyzeSite(url);
        console.log(`📊 Site analysis: ${this.siteAnalysis.type} (${this.siteAnalysis.confidence}% confidence)`);
      } catch (error) {
        console.warn(`⚠️  Site analysis failed, using default extraction: ${error}`);
      }

      // 3. Discover URLs using enhanced discovery
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
      
      // Enhanced output for frontend parsing ⭐
      console.log(`📄 Found ${urlsToScrape.length} URLs for scraping`);
      console.log(`📊 SCRAPING_STATS: {"urlsFound": ${urlsToScrape.length}, "urlsTotal": ${urlsToScrape.length}, "concurrency": ${config.maxConcurrency}, "rateLimitMs": ${config.rateLimitMs}}`);

      if (urlsToScrape.length === 0) {
        throw new Error('No URLs found to scrape');
      }

      // 4. Setup progress tracking
      this.setupProgressBar(urlsToScrape.length);

      // 5. Process URLs with concurrency limit
      await this.processUrlsWithConcurrency(
        urlsToScrape, 
        config, 
        processedPages, 
        errors
      );

      // 6. Save results
      if (processedPages.length > 0) {
        console.log('\n💾 Saving results...');
        await this.storageAdapter.save(processedPages, config);
        
        // Enhanced completion stats ⭐
        const totalBytes = processedPages.reduce((sum, page) => sum + (page.content?.length || 0), 0);
        console.log(`✅ SCRAPING_COMPLETE: {"successfulPages": ${processedPages.length}, "failedPages": ${errors.length}, "totalBytes": ${totalBytes}}`);
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
      
      // Cleanup resources
      await this.contentExtractor.cleanup();
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

  /**
   * Analyze site type without running full scraping
   */
  async analyzeSite(url: string) {
    return this.urlDiscoverer.analyzeSite(url);
  }

  /**
   * Compare static vs JavaScript discovery strategies
   */
  async compareDiscoveryStrategies(url: string, config: ScrapingConfig) {
    return this.urlDiscoverer.compareStrategies(url, config);
  }

  /**
   * Compare static vs JavaScript extraction strategies  
   */
  async compareExtractionStrategies(url: string, selectors?: any) {
    const siteAnalysis = await this.urlDiscoverer.analyzeSite(url);
    const response = await this.httpClient.get(url, 1000);
    return this.contentExtractor.compareExtractionMethods(response.data, url, selectors, siteAnalysis);
  }

  /**
   * Compare native extraction methods with Jina Reader API
   */
  async compareJinaExtraction(url: string, selectors?: any) {
    const siteAnalysis = await this.urlDiscoverer.analyzeSite(url);
    const response = await this.httpClient.get(url, 1000);
    const result = await this.contentExtractor.compareWithJina(response.data, url, selectors, siteAnalysis);
    
    // Return the result directly without conversion
    return {
      staticResult: result.staticResult,
      javascriptResult: result.javascriptResult,
      jinaResult: result.jinaResult,
      recommendation: result.recommendation === 'jina' ? 'Jina Reader' : 
                     result.recommendation === 'javascript' ? 'JavaScript' : 'Static',
      reason: result.reason
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
    let totalProcessed = 0;

    for (const chunk of chunks) {
      const promises = chunk.map(url => this.processUrl(url, config));
      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        const url = chunk[index];
        totalProcessed++;
        
        if (result.status === 'fulfilled' && result.value) {
          processedPages.push(result.value);
          
          // Enhanced progress output ⭐
          const percentage = Math.round((totalProcessed / urls.length) * 100);
          console.log(`🔄 SCRAPING_PROGRESS: {"current": ${totalProcessed}, "total": ${urls.length}, "percentage": ${percentage}, "currentUrl": "${url}", "status": "success"}`);
          
        } else {
          const error = result.status === 'rejected' ? result.reason : 'Unknown error';
          errors.push({
            url,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date()
          });
          
          // Enhanced error output ⭐
          const percentage = Math.round((totalProcessed / urls.length) * 100);
          console.log(`❌ SCRAPING_PROGRESS: {"current": ${totalProcessed}, "total": ${urls.length}, "percentage": ${percentage}, "currentUrl": "${url}", "status": "error", "error": "${error instanceof Error ? error.message : String(error)}"}`);
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
      
      // Extract content using enhanced extractor with site analysis
      const extractedContent = await this.contentExtractor.extract(
        response.data, 
        url, 
        config.selectors,
        this.siteAnalysis // Pass site analysis for better extraction strategy
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