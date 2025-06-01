import axios from 'axios';
import * as cheerio from 'cheerio';

export class UrlDiscovery {
  constructor() {
    this.foundUrls = new Set();
    this.processedUrls = new Set();
  }

  async discoverUrls(startUrl, options = {}) {
    const {
      maxPages = 50,
      maxDepth = 3,
      includePatterns = [],
      excludePatterns = ['#', 'mailto:', 'tel:', 'javascript:'],
      baseUrl = null
    } = options;

    console.log(`🔍 Starting URL discovery from: ${startUrl}`);
    console.log(`📊 Limits: ${maxPages} pages, depth ${maxDepth}`);

    const baseUrlObj = new URL(baseUrl || startUrl);
    this.baseUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}`;
    
    // Try sitemap first
    const sitemapUrls = await this.tryFindSitemap(this.baseUrl);
    if (sitemapUrls.length > 0) {
      console.log(`🗺️ Found ${sitemapUrls.length} URLs from sitemap`);
      sitemapUrls.forEach(url => this.foundUrls.add(url));
    }

    // Start crawling from the initial URL
    await this.crawlRecursive(startUrl, 0, maxDepth, maxPages);

    // Filter and clean URLs
    const allUrls = Array.from(this.foundUrls)
      .filter(url => this.isValidUrl(url, includePatterns, excludePatterns))
      .slice(0, maxPages);

    console.log(`✅ Discovery completed: found ${allUrls.length} URLs`);
    return allUrls;
  }

  async tryFindSitemap(baseUrl) {
    const sitemapUrls = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemaps.xml`,
      `${baseUrl}/robots.txt`
    ];

    for (const sitemapUrl of sitemapUrls) {
      try {
        console.log(`🔍 Checking: ${sitemapUrl}`);
        const response = await axios.get(sitemapUrl, { timeout: 10000 });
        
        if (sitemapUrl.endsWith('robots.txt')) {
          return this.extractSitemapFromRobots(response.data, baseUrl);
        } else {
          return this.extractUrlsFromSitemap(response.data);
        }
      } catch (error) {
        console.log(`❌ ${sitemapUrl} not found`);
      }
    }

    return [];
  }

  extractSitemapFromRobots(robotsContent, baseUrl) {
    const sitemapMatches = robotsContent.match(/Sitemap:\s*(.+)/gi);
    if (!sitemapMatches) return [];

    const sitemapUrls = sitemapMatches.map(match => 
      match.replace(/Sitemap:\s*/i, '').trim()
    );

    // Try to fetch each sitemap
    const promises = sitemapUrls.map(async (url) => {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        return this.extractUrlsFromSitemap(response.data);
      } catch {
        return [];
      }
    });

    return Promise.all(promises).then(results => 
      results.flat()
    );
  }

  extractUrlsFromSitemap(sitemapContent) {
    const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
    if (!urlMatches) return [];

    return urlMatches
      .map(match => match.replace(/<\/?loc>/g, ''))
      .filter(url => url.includes('/doc') || url.includes('/guide') || url.includes('/api'));
  }

  async crawlRecursive(url, currentDepth, maxDepth, maxPages) {
    if (this.foundUrls.size >= maxPages || currentDepth > maxDepth) {
      return;
    }

    if (this.processedUrls.has(url)) {
      return;
    }

    this.processedUrls.add(url);
    console.log(`🕷️ Crawling (depth ${currentDepth}): ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Parser-Test-Service/1.0.0 (URL Discovery)'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      
      // Find all links
      const links = [];
      $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const fullUrl = this.resolveUrl(href, url);
          if (fullUrl && this.isDocumentationUrl(fullUrl)) {
            links.push(fullUrl);
            this.foundUrls.add(fullUrl);
          }
        }
      });

      console.log(`📄 Found ${links.length} links on ${url}`);

      // Recursively crawl found links
      for (const link of links.slice(0, 10)) { // Limit links per page
        if (this.foundUrls.size < maxPages) {
          await this.crawlRecursive(link, currentDepth + 1, maxDepth, maxPages);
        }
      }

    } catch (error) {
      console.log(`❌ Failed to crawl ${url}: ${error.message}`);
    }
  }

  resolveUrl(href, baseUrl) {
    try {
      if (href.startsWith('http')) {
        return href;
      }
      
      const base = new URL(baseUrl);
      const resolved = new URL(href, base);
      return resolved.toString();
    } catch {
      return null;
    }
  }

  isDocumentationUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Must be same domain
      if (!url.startsWith(this.baseUrl)) {
        return false;
      }

      // Documentation patterns
      const docPatterns = [
        '/doc', '/docs', '/guide', '/guides', '/tutorial', '/tutorials',
        '/api', '/reference', '/manual', '/help', '/learn', '/getting-started'
      ];

      return docPatterns.some(pattern => 
        urlObj.pathname.toLowerCase().includes(pattern)
      );
    } catch {
      return false;
    }
  }

  isValidUrl(url, includePatterns, excludePatterns) {
    // Exclude patterns
    for (const pattern of excludePatterns) {
      if (url.includes(pattern)) {
        return false;
      }
    }

    // Include patterns (if specified)
    if (includePatterns.length > 0) {
      return includePatterns.some(pattern => url.includes(pattern));
    }

    return true;
  }
} 