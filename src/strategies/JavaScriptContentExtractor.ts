import puppeteer, { Browser, Page } from 'puppeteer';
import { ContentExtractor, ExtractedContent, ContentSelectors } from '../types/index.js';

interface JavaScriptExtractionOptions {
  jsTimeout?: number;
  waitStrategy?: 'networkidle' | 'domcontent' | 'load';
  waitSelector?: string;
  headless?: boolean;
  browserArgs?: string[];
}

export class JavaScriptContentExtractor implements ContentExtractor {
  private browser?: Browser;
  private options: JavaScriptExtractionOptions;

  constructor(options: JavaScriptExtractionOptions = {}) {
    this.options = {
      jsTimeout: 30000,
      waitStrategy: 'networkidle',
      headless: true,
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...options
    };
  }

  /**
   * Initialize browser instance
   */
  private async initializeBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    try {
      // Try to use system Chrome/Chromium first
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: this.options.browserArgs,
        timeout: this.options.jsTimeout,
        executablePath: await this.findChromePath(),
      });

      return this.browser;
    } catch (error) {
      console.warn('Failed to launch system Chrome, trying bundled Chromium...');
      
      // Fallback to bundled Chromium
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: this.options.browserArgs,
        timeout: this.options.jsTimeout,
      });

      return this.browser;
    }
  }

  /**
   * Find system Chrome installation
   */
  private async findChromePath(): Promise<string | undefined> {
    const { execSync } = await import('child_process');
    
    try {
      // macOS Chrome path
      if (process.platform === 'darwin') {
        const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        return chromePath;
      }
      
      // Linux Chrome path
      if (process.platform === 'linux') {
        try {
          const result = execSync('which google-chrome || which chromium-browser', { encoding: 'utf8' });
          return result.trim();
        } catch {
          return undefined;
        }
      }
      
      // Windows Chrome path  
      if (process.platform === 'win32') {
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      }
      
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Extract content from JavaScript-rendered page
   */
  async extract(_html: string, url: string, selectors: ContentSelectors = {}): Promise<ExtractedContent> {
    const browser = await this.initializeBrowser();
    const page = await browser.newPage();
    
    try {
      // Set user agent to avoid bot detection
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      );

      console.log(`🔍 Loading JavaScript content from: ${url}`);
      
      // Navigate to page
      await page.goto(url, {
        waitUntil: this.getWaitStrategy(),
        timeout: this.options.jsTimeout,
      });

      // Wait for specific selector if provided
      if (this.options.waitSelector) {
        try {
          await page.waitForSelector(this.options.waitSelector, {
            timeout: 10000, // Shorter timeout for selector wait
          });
        } catch (error) {
          console.warn(`⚠️  Wait selector "${this.options.waitSelector}" not found, continuing...`);
        }
      }

      // Additional wait for content to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(`✓ Page loaded, extracting content...`);

      // Extract content using provided selectors or defaults
      const extractedContent = await page.evaluate((sels: ContentSelectors) => {
        // Default selectors for common documentation patterns
        const defaultSelectors = {
          title: sels.title || 'h1, .page-title, .document-title, title',
          main: sels.main || 'main, .content, .main-content, article, .docs-content, .documentation-content, [role="main"]',
          navigation: sels.navigation || 'nav, .navigation, .sidebar, .toc, .table-of-contents'
        };

        const doc = (globalThis as any).document;
        
        // Extract title
        let title = '';
        const titleElements = doc.querySelectorAll(defaultSelectors.title);
        if (titleElements.length > 0) {
          title = titleElements[0].textContent?.trim() || '';
        }

        // Extract main content
        let content = '';
        const mainElements = doc.querySelectorAll(defaultSelectors.main);
        if (mainElements.length > 0) {
          // Try to get the largest content block
          let largestContent = '';
          mainElements.forEach((element: any) => {
            const elementContent = element.innerText?.trim() || '';
            if (elementContent.length > largestContent.length) {
              largestContent = elementContent;
            }
          });
          content = largestContent;
        } else {
          // Fallback: try body content but filter out navigation
          const bodyContent = doc.body?.innerText?.trim() || '';
          content = bodyContent;
        }

        // Extract links
        const links: string[] = [];
        const linkElements = doc.querySelectorAll('a[href]');
        linkElements.forEach((element: any) => {
          const href = element.href;
          if (href && href.startsWith((globalThis as any).window.location.origin)) {
            links.push(href);
          }
        });

        // Extract metadata
        const metadata = {
          url: (globalThis as any).window.location.href,
          description: '',
          keywords: [] as string[],
          lastModified: '',
          contentLength: content.length,
          extractedAt: new Date().toISOString(),
          canonicalUrl: undefined as string | undefined,
          framework: undefined as string | undefined
        };

        // Get meta description
        const metaDesc = doc.querySelector('meta[name="description"]');
        if (metaDesc) {
          metadata.description = metaDesc.getAttribute('content') || '';
        }

        // Get meta keywords
        const metaKeywords = doc.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
          metadata.keywords = (metaKeywords.getAttribute('content') || '').split(',').map((k: string) => k.trim());
        }

        // Get canonical URL
        const canonical = doc.querySelector('link[rel="canonical"]');
        if (canonical) {
          metadata.canonicalUrl = canonical.getAttribute('href');
        }

        // Framework detection
        if (doc.querySelector('[ng-version]') || doc.querySelector('app-root')) {
          metadata.framework = 'Angular';
        } else if (doc.querySelector('[data-reactroot]') || doc.querySelector('#root')) {
          metadata.framework = 'React';
        } else if (doc.querySelector('[data-v-]') || doc.querySelector('.vue-app')) {
          metadata.framework = 'Vue';
        }

        return {
          title,
          content,
          links,
          metadata
        };
      }, selectors);

      console.log(`✓ Content extracted: ${extractedContent.content.length} characters`);

      return extractedContent;

    } catch (error) {
      console.error(`❌ JavaScript content extraction failed for ${url}:`, error);
      
      // Fallback to basic extraction if JavaScript fails
      return {
        title: 'Content Extraction Failed',
        content: `Failed to extract content from ${url}: ${error}`,
        links: [],
        metadata: {
          url,
          error: error instanceof Error ? error.message : String(error),
          extractedAt: new Date().toISOString(),
          fallback: true
        }
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Get Puppeteer wait strategy
   */
  private getWaitStrategy(): 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2' {
    switch (this.options.waitStrategy) {
      case 'networkidle':
        return 'networkidle2';
      case 'domcontent':
        return 'domcontentloaded';
      case 'load':
        return 'load';
      default:
        return 'networkidle2';
    }
  }

  /**
   * Cleanup browser resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }

  /**
   * Extract content from multiple URLs efficiently
   */
  async extractMultiple(
    urls: { html: string; url: string }[], 
    selectors: ContentSelectors = {}
  ): Promise<ExtractedContent[]> {
    const browser = await this.initializeBrowser();
    const results: ExtractedContent[] = [];

    try {
      // Process URLs in batches to avoid too many open pages
      const batchSize = 3;
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchPromises = batch.map(async ({ url }) => {
          const page = await browser.newPage();
          try {
            return await this.extractFromPage(page, url, selectors);
          } finally {
            await page.close();
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error(`Failed to extract content from ${batch[index].url}:`, result.reason);
            results.push({
              title: 'Extraction Failed',
              content: `Failed to extract content: ${result.reason}`,
              links: [],
              metadata: { 
                url: batch[index].url, 
                error: String(result.reason),
                extractedAt: new Date().toISOString()
              }
            });
          }
        });

        // Small delay between batches
        if (i + batchSize < urls.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return results;
    } finally {
      await browser.close();
    }
  }

  /**
   * Extract content from a single page instance
   */
  private async extractFromPage(page: Page, url: string, selectors: ContentSelectors): Promise<ExtractedContent> {
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    );

    await page.goto(url, {
      waitUntil: this.getWaitStrategy(),
      timeout: this.options.jsTimeout,
    });

    if (this.options.waitSelector) {
      try {
        await page.waitForSelector(this.options.waitSelector, { timeout: 10000 });
      } catch {
        // Continue if selector not found
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    return page.evaluate((sels: ContentSelectors) => {
      const defaultSelectors = {
        title: sels.title || 'h1, .page-title, .document-title, title',
        main: sels.main || 'main, .content, .main-content, article, .docs-content, .documentation-content, [role="main"]',
      };

      const doc = (globalThis as any).document;
      
      let title = '';
      const titleElements = doc.querySelectorAll(defaultSelectors.title);
      if (titleElements.length > 0) {
        title = titleElements[0].textContent?.trim() || '';
      }

      let content = '';
      const mainElements = doc.querySelectorAll(defaultSelectors.main);
      if (mainElements.length > 0) {
        let largestContent = '';
        mainElements.forEach((element: any) => {
          const elementContent = element.innerText?.trim() || '';
          if (elementContent.length > largestContent.length) {
            largestContent = elementContent;
          }
        });
        content = largestContent;
      } else {
        content = doc.body?.innerText?.trim() || '';
      }

      // Extract links
      const links: string[] = [];
      const linkElements = doc.querySelectorAll('a[href]');
      linkElements.forEach((element: any) => {
        const href = element.href;
        if (href && href.startsWith((globalThis as any).window.location.origin)) {
          links.push(href);
        }
      });

      return {
        title,
        content,
        links,
        metadata: {
          url: (globalThis as any).window.location.href,
          contentLength: content.length,
          extractedAt: new Date().toISOString()
        }
      };
    }, selectors);
  }
} 