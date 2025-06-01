import { PageMetadata } from '../types/index.js';
import { HttpClient } from '../utils/httpClient.js';

export interface JinaContentExtractorOptions {
  timeout?: number;
  userAgent?: string;
}

export class JinaContentExtractor {
  private httpClient: HttpClient;
  private lastRequestTime: number = 0;
  private readonly RATE_LIMIT_MS = 3000; // 3 seconds between requests
  private options: JinaContentExtractorOptions;

  constructor(httpClient: HttpClient, options: JinaContentExtractorOptions = {}) {
    this.httpClient = httpClient;
    this.options = {
      timeout: 30000,
      userAgent: 'DocumentationScraper/1.0.0 (Educational Purpose)',
      ...options
    };
  }

  /**
   * Rate limiting to avoid 429 errors
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
      const waitTime = this.RATE_LIMIT_MS - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before next Jina request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Extract clean markdown content using Jina Reader API
   */
  async extractContent(url: string): Promise<PageMetadata> {
    try {
      // Enforce rate limiting
      await this.enforceRateLimit();
      
      console.log(`🎯 Using Jina Reader for: ${url}`);
      
      const jinaUrl = `https://r.jina.ai/${url}`;
      const response = await this.httpClient.get(jinaUrl, this.options.timeout);
      
      const content = response.data;
      const lines = content.split('\n');
      
      // Extract title from first line or use URL
      let title = 'Untitled';
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        if (lines[i].trim() !== '') {
          title = lines[i].replace(/^#+\s*/, '').trim();
          break;
        }
      }
      
      console.log(`✓ Jina Reader extraction completed: ${content.length} characters`);
      
      return {
        url,
        title,
        content,
        extractedAt: new Date().toISOString(),
        contentLength: content.length,
        extractionMethod: 'jina-reader-api',
        wordCount: content.split(/\s+/).filter((word: string) => word.length > 0).length,
        headers: this.extractHeaders(content)
      };
      
    } catch (error: any) {
      console.error(`❌ Jina Reader extraction failed for ${url}:`, error.message);
      
      return {
        url,
        title: 'Extraction Failed',
        content: '',
        extractedAt: new Date().toISOString(),
        contentLength: 0,
        extractionMethod: 'jina-reader-api',
        error: error.message,
        wordCount: 0,
        headers: []
      };
    }
  }

  /**
   * Extract headers from markdown content
   */
  private extractHeaders(content: string): string[] {
    const headerRegex = /^#+\s+(.+)$/gm;
    const headers: string[] = [];
    let match;
    
    while ((match = headerRegex.exec(content)) !== null) {
      headers.push(match[1].trim());
    }
    
    return headers;
  }

  /**
   * Get a preview of the content
   */
  getContentPreview(content: string, maxLength: number = 200): string {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content;
  }
} 