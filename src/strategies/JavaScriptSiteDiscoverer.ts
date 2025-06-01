import puppeteer, { Browser } from 'puppeteer';
import { UrlDiscoverer, UrlDiscoveryResult, ScrapingConfig } from '../types/index.js';

interface JavaScriptDiscoveryOptions {
  jsTimeout?: number;
  waitStrategy?: 'networkidle' | 'domcontent' | 'load';
  waitSelector?: string;
  headless?: boolean;
  browserArgs?: string[];
}

export class JavaScriptSiteDiscoverer implements UrlDiscoverer {
  private browser?: Browser;
  private options: JavaScriptDiscoveryOptions;

  constructor(_httpClient?: any, options: JavaScriptDiscoveryOptions = {}) {
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
        // Use system Chrome if available
        executablePath: await this.findChromePath(),
      });

      return this.browser;
    } catch (error) {
      console.warn('Failed to launch system Chrome, trying bundled Chromium...');
      
      // Fallback to bundled Chromium (requires manual installation)
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
   * Discover URLs using JavaScript execution
   */
  async discoverNavigationUrls(baseUrl: string): Promise<string[]> {
    const browser = await this.initializeBrowser();
    const page = await browser.newPage();
    
    try {
      // Set user agent to avoid bot detection
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      );

      console.log(`🔍 Loading JavaScript site: ${baseUrl}`);
      
      // Navigate to page
      await page.goto(baseUrl, {
        waitUntil: this.getWaitStrategy(),
        timeout: this.options.jsTimeout,
      });

      // Wait for specific selector if provided
      if (this.options.waitSelector) {
        console.log(`⏳ Waiting for selector: ${this.options.waitSelector}`);
        await page.waitForSelector(this.options.waitSelector, {
          timeout: this.options.jsTimeout,
        });
      }

      // Additional wait for content to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(`✓ Page loaded, extracting navigation links...`);

      // Extract navigation links from loaded page
      const urls = await page.evaluate((): string[] => {
        const links: string[] = [];
        const selectors = [
          // Common navigation selectors
          'nav a[href]',
          '.navigation a[href]',
          '.sidebar a[href]',
          '.menu a[href]',
          '.docs-nav a[href]',
          '.doc-nav a[href]',
          // Angular Material and similar
          '.mat-nav-list a[href]',
          '.nav-link[href]',
          // Generic content links
          'main a[href]',
          '.content a[href]',
          'article a[href]',
          // Table of contents
          '.toc a[href]',
          '.table-of-contents a[href]',
        ];

        // Use eval with context to access DOM without TypeScript DOM lib
        const doc = (globalThis as any).document;
        const win = (globalThis as any).window;

        selectors.forEach(selector => {
          const elements = doc.querySelectorAll(selector);
          elements.forEach((element: any) => {
            const link = element;
            if (link.href && link.href.startsWith(win.location.origin)) {
              // Clean up Angular hash routes
              let url = link.href.split('#')[0];
              if (url && !url.endsWith('/')) url += '/';
              if (url && !links.includes(url)) {
                links.push(url);
              }
            }
          });
        });

        return links;
      });

      console.log(`🧭 Found ${urls.length} URLs from JavaScript navigation`);

      // Filter and validate URLs
      const validUrls = urls
        .filter(url => this.isValidDocumentationUrl(url, baseUrl))
        .slice(0, 200); // Limit for safety

      return validUrls;

    } catch (error) {
      console.error(`❌ JavaScript URL discovery failed:`, error);
      return [];
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
   * Check if URL is likely documentation content
   */
  private isValidDocumentationUrl(url: string, baseUrl: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Check domain only if baseUrl is provided
      if (baseUrl) {
        const baseUrlObj = new URL(baseUrl);
        if (urlObj.hostname !== baseUrlObj.hostname) {
          return false;
        }
      }
      
      const path = urlObj.pathname;

      // Skip non-content URLs
      const skipPatterns = [
        '/api/',
        '/assets/',
        '/images/',
        '/img/',
        '/css/',
        '/js/',
        '/fonts/',
        '/_next/',
        '/_nuxt/',
        '/static/',
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.ico',
        '.css',
        '.js',
        '.json',
        '.xml',
        '.pdf',
      ];

      if (skipPatterns.some(pattern => path.includes(pattern))) {
        return false;
      }

      // Prefer documentation paths
      const goodPatterns = [
        '/docs/',
        '/guide/',
        '/tutorial/',
        '/learn/',
        '/getting-started/',
        '/introduction/',
        '/overview/',
        '/concepts/',
        '/examples/',
        '/reference/',
      ];

      // If it's in a good section, definitely include
      if (goodPatterns.some(pattern => path.includes(pattern))) {
        return true;
      }

      // For root-level paths, be more selective
      if (path === '/' || path === '/index' || path === '/home') {
        return true;
      }

      // Allow pages that look like documentation
      if (path.split('/').length >= 2 && path.length > 3) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Enhanced sitemap discovery for SPA sites
   */
  async discoverSitemapUrls(baseUrl: string): Promise<string[]> {
    const browser = await this.initializeBrowser();
    const page = await browser.newPage();
    
    try {
      // Extract domain root from baseUrl
      const url = new URL(baseUrl);
      const domainRoot = `${url.protocol}//${url.host}`;
      
      // Try common sitemap locations
      const sitemapUrls = [
        `${domainRoot}/sitemap.xml`,
        `${domainRoot}/sitemap_index.xml`,
        `${domainRoot}/sitemaps/sitemap.xml`,
        `${domainRoot}/api/sitemap.xml`,
        `${domainRoot}/sitemap.txt`,
      ];

      for (const sitemapUrl of sitemapUrls) {
        try {
          console.log(`🗺️  Checking sitemap: ${sitemapUrl}`);
          
          const response = await page.goto(sitemapUrl, {
            waitUntil: 'networkidle2',
            timeout: 10000,
          });

          if (response?.ok()) {
            const content = await page.content();
            
            // Check if it's actually XML (not HTML)
            if (content.includes('<?xml') || content.includes('<urlset')) {
              const urls = this.extractUrlsFromSitemap(content);
              if (urls.length > 0) {
                console.log(`✓ Found ${urls.length} URLs in sitemap`);
                return urls.filter(url => url.includes('/docs/')); // Filter only docs URLs
              }
            }
          }
        } catch (error) {
          // Continue to next sitemap URL
          continue;
        }
      }

      return [];
    } finally {
      await page.close();
    }
  }

  /**
   * Extract URLs from sitemap XML content
   */
  private extractUrlsFromSitemap(xmlContent: string): string[] {
    const urls: string[] = [];
    const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g);
    
    if (urlMatches) {
      urlMatches.forEach(match => {
        const url = match.replace(/<\/?loc>/g, '');
        if (url && this.isValidDocumentationUrl(url, '')) {
          urls.push(url);
        }
      });
    }
    
    return urls;
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
   * Main discovery method that implements UrlDiscoverer interface
   */
  async discover(baseUrl: string, config: ScrapingConfig): Promise<UrlDiscoveryResult> {
    const result: UrlDiscoveryResult = {
      urls: [],
      sitemap: [],
      navigation: [],
      errors: []
    };

    try {
      console.log(`🚀 Starting JavaScript-based URL discovery for: ${baseUrl}`);

      // Try sitemap first (might work for some SPA sites)
      const sitemapUrls = await this.discoverSitemapUrls(baseUrl);
      result.sitemap = sitemapUrls;
      result.urls.push(...sitemapUrls);
      
      if (sitemapUrls.length === 0) {
        // Fallback to navigation-based discovery
        const navUrls = await this.discoverNavigationUrls(baseUrl);
        result.navigation = navUrls;
        result.urls.push(...navUrls);
      }

      // Final cleanup and filtering
      const uniqueUrls = [...new Set(result.urls)];
      const filteredUrls = this.filterUrls(uniqueUrls, config);

      result.urls = filteredUrls;

      console.log(`📋 JavaScript discovery completed: ${result.urls.length} URLs found`);
      
      return result;

    } catch (error) {
      const errorMsg = `JavaScript discovery failed: ${error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
      return result;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Filter URLs based on config patterns
   */
  private filterUrls(urls: string[], config: ScrapingConfig): string[] {
    return urls.filter(url => {
      // Apply include patterns
      if (config.includePatterns && config.includePatterns.length > 0) {
        const matches = config.includePatterns.some(pattern => 
          new RegExp(pattern).test(url)
        );
        if (!matches) return false;
      }

      // Apply exclude patterns
      for (const pattern of config.excludePatterns) {
        if (new RegExp(pattern).test(url)) {
          return false;
        }
      }

      return true;
    }).slice(0, 500); // Safety limit
  }
} 