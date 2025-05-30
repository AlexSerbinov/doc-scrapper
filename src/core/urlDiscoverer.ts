import { load } from 'cheerio';
import { UrlDiscoverer, UrlDiscoveryResult, ScrapingConfig } from '../types/index.js';
import { HttpClient } from '../utils/httpClient.js';

export class DefaultUrlDiscoverer implements UrlDiscoverer {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async discover(baseUrl: string, config: ScrapingConfig): Promise<UrlDiscoveryResult> {
    const result: UrlDiscoveryResult = {
      urls: [],
      sitemap: [],
      navigation: [],
      errors: []
    };

    try {
      // 1. Try to discover URLs from sitemap.xml
      const sitemapUrls = await this.discoverFromSitemap(baseUrl, config);
      result.sitemap = sitemapUrls;
      result.urls.push(...sitemapUrls);

      // 2. If sitemap is empty or limited, try navigation discovery
      if (sitemapUrls.length === 0) {
        const navUrls = await this.discoverFromNavigation(baseUrl, config);
        result.navigation = navUrls;
        result.urls.push(...navUrls);
      }

      // 3. Remove duplicates and filter by patterns
      result.urls = this.filterUrls([...new Set(result.urls)], config);

      console.log(`📋 Discovered ${result.urls.length} URLs to scrape`);
      
    } catch (error) {
      const errorMsg = `Failed to discover URLs: ${error}`;
      result.errors.push(errorMsg);
      console.error('❌', errorMsg);
    }

    return result;
  }

  private async discoverFromSitemap(baseUrl: string, config: ScrapingConfig): Promise<string[]> {
    try {
      const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString();
      const response = await this.httpClient.get(sitemapUrl, config.rateLimitMs);
      
      const $ = load(response.data, { xmlMode: true });
      const urls: string[] = [];

      // Parse sitemap XML
      $('url loc, urlset url loc').each((_, element) => {
        const url = $(element).text().trim();
        if (url && this.isValidDocumentationUrl(url, baseUrl)) {
          urls.push(url);
        }
      });

      // Handle sitemap index (sitemaps that point to other sitemaps)
      const sitemapRefs = $('sitemap loc, sitemapindex sitemap loc').toArray();
      for (const ref of sitemapRefs) {
        const nestedSitemapUrl = $(ref).text().trim();
        if (nestedSitemapUrl) {
          try {
            const nestedUrls = await this.discoverFromSitemap(nestedSitemapUrl, config);
            urls.push(...nestedUrls);
          } catch (error) {
            console.warn(`⚠️  Failed to parse nested sitemap: ${nestedSitemapUrl}`);
          }
        }
      }

      console.log(`🗺️  Found ${urls.length} URLs in sitemap`);
      return urls;
      
    } catch (error) {
      console.log('ℹ️  No sitemap.xml found, will try navigation discovery');
      return [];
    }
  }

  private async discoverFromNavigation(baseUrl: string, config: ScrapingConfig): Promise<string[]> {
    try {
      const response = await this.httpClient.get(baseUrl, config.rateLimitMs);
      const $ = load(response.data);
      const urls: string[] = [];

      // Common navigation selectors for documentation sites
      const navSelectors = [
        config.selectors.navigation || 'nav',
        '[role="navigation"]',
        '.navigation',
        '.nav',
        '.sidebar',
        '.menu',
        '.toc',
        '.table-of-contents'
      ];

      for (const selector of navSelectors) {
        $(selector).find('a[href]').each((_, element) => {
          const href = $(element).attr('href');
          if (href) {
            const absoluteUrl = new URL(href, baseUrl).toString();
            if (this.isValidDocumentationUrl(absoluteUrl, baseUrl)) {
              urls.push(absoluteUrl);
            }
          }
        });
      }

      // Also look for links in main content area
      const contentSelectors = [
        config.selectors.main || 'main',
        '[role="main"]',
        '.content',
        '.main-content',
        'article'
      ];

      for (const selector of contentSelectors) {
        $(selector).find('a[href]').each((_, element) => {
          const href = $(element).attr('href');
          if (href) {
            const absoluteUrl = new URL(href, baseUrl).toString();
            if (this.isValidDocumentationUrl(absoluteUrl, baseUrl)) {
              urls.push(absoluteUrl);
            }
          }
        });
      }

      const uniqueUrls = [...new Set(urls)];
      console.log(`🧭 Found ${uniqueUrls.length} URLs from navigation`);
      return uniqueUrls;
      
    } catch (error) {
      console.error(`❌ Failed to discover URLs from navigation: ${error}`);
      return [];
    }
  }

  private isValidDocumentationUrl(url: string, baseUrl: string): boolean {
    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(baseUrl);

      // Must be same domain
      if (urlObj.hostname !== baseUrlObj.hostname) {
        return false;
      }

      // Skip non-documentation URLs
      const skipPatterns = [
        /\.(jpg|jpeg|png|gif|svg|css|js|pdf|zip)$/i,
        /\/(api|rss|feed|sitemap)/i,
        /#/,  // Skip anchor links
        /\?/,  // Skip query parameters for now
      ];

      for (const pattern of skipPatterns) {
        if (pattern.test(url)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

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
    });
  }
} 