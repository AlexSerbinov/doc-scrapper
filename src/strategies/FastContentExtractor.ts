import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { PageMetadata } from '../types/index.js';
import { HttpClient } from '../utils/httpClient.js';

export interface FastExtractedContent {
  title: string;
  content: string;
  textContent: string;
  excerpt: string;
  byline?: string;
  publishedTime?: string;
  url: string;
  siteName?: string;
  length: number;
  wordCount: number;
  metadata: PageMetadata;
}

export interface FastContentExtractorOptions {
  timeout?: number;
  userAgent?: string;
  fallbackToJina?: boolean;
}

/**
 * FastContentExtractor - Швидка альтернатива Jina Reader
 * Використовує Mercury Parser та Mozilla Readability для високошвидкісного парсингу
 */
export class FastContentExtractor {
  private httpClient: HttpClient;
  private options: FastContentExtractorOptions;

  constructor(httpClient: HttpClient, options: FastContentExtractorOptions = {}) {
    this.httpClient = httpClient;
    this.options = {
      timeout: 30000,
      userAgent: 'FastDocumentationScraper/2.0.0 (High-Speed Parser)',
      fallbackToJina: false,
      ...options
    };
  }

  /**
   * Головний метод екстракції з автоматичним вибором стратегії
   */
  async extract(url: string): Promise<FastExtractedContent> {
    console.log(`🚀 Fast extracting from: ${url}`);
    const startTime = Date.now();

    try {
      // Спробуємо Mercury Parser (найшвидший для статичного контенту)
      const mercuryResult = await this.extractWithMercury(url);
      if (mercuryResult && this.isGoodQuality(mercuryResult)) {
        const duration = Date.now() - startTime;
        console.log(`✅ Mercury extracted in ${duration}ms`);
        return mercuryResult;
      }

      // Fallback до Readability
      console.log(`🔄 Mercury failed, trying Readability...`);
      const readabilityResult = await this.extractWithReadability(url);
      if (readabilityResult && this.isGoodQuality(readabilityResult)) {
        const duration = Date.now() - startTime;
        console.log(`✅ Readability extracted in ${duration}ms`);
        return readabilityResult;
      }

      // Якщо все не вдалося
      throw new Error('Both Mercury and Readability extraction failed');

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Fast extraction failed in ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Екстракція за допомогою Mercury Parser
   */
  private async extractWithMercury(url: string): Promise<FastExtractedContent | null> {
    try {
      // Динамічний імпорт Mercury Parser
      const { default: mercury } = await import('@postlight/parser');
      
      const result = await mercury(url, {
        headers: {
          'User-Agent': this.options.userAgent!
        }
      });

      if (!result || !result.content) {
        return null;
      }

      return {
        title: result.title || 'Untitled',
        content: result.content,
        textContent: this.htmlToText(result.content),
        excerpt: result.excerpt || this.generateExcerpt(result.content),
        byline: result.author,
        publishedTime: result.date_published,
        url: result.url || url,
        siteName: result.domain,
        length: result.content.length,
        wordCount: this.countWords(result.content),
        metadata: {
          title: result.title || 'Untitled',
          description: result.excerpt || '',
          url: result.url || url,
          siteName: result.domain || '',
          publishedTime: result.date_published || new Date().toISOString(),
          author: result.author || '',
          wordCount: this.countWords(result.content),
          readingTime: Math.ceil(this.countWords(result.content) / 200),
          extractedAt: new Date().toISOString(),
          extractionMethod: 'mercury-parser'
        }
      };

    } catch (error) {
      console.error('Mercury Parser failed:', error);
      return null;
    }
  }

  /**
   * Екстракція за допомогою Mozilla Readability
   */
  private async extractWithReadability(url: string): Promise<FastExtractedContent | null> {
    try {
      // Отримуємо HTML
      const response = await this.httpClient.get(url, this.options.timeout!);

      if (!response.data) {
        return null;
      }

      // Створюємо DOM з отриманого HTML
      const dom = new JSDOM(response.data, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article || !article.content) {
        return null;
      }

      const textContent = this.htmlToText(article.content);
      const wordCount = this.countWords(textContent);

      return {
        title: article.title || 'Untitled',
        content: article.content,
        textContent: textContent,
        excerpt: article.excerpt || this.generateExcerpt(textContent),
        byline: article.byline || undefined,
        publishedTime: undefined,
        url: url,
        siteName: article.siteName || undefined,
        length: article.length || article.content.length,
        wordCount: wordCount,
        metadata: {
          title: article.title || 'Untitled',
          description: article.excerpt || '',
          url: url,
          siteName: article.siteName || '',
          publishedTime: new Date().toISOString(),
          author: article.byline || '',
          wordCount: wordCount,
          readingTime: Math.ceil(wordCount / 200),
          extractedAt: new Date().toISOString(),
          extractionMethod: 'mozilla-readability'
        }
      };

    } catch (error) {
      console.error('Readability extraction failed:', error);
      return null;
    }
  }

  /**
   * Перевіряє якість екстракції
   */
  private isGoodQuality(result: FastExtractedContent): boolean {
    const minWordCount = 50;
    const minContentLength = 500;

    return (
      result.wordCount >= minWordCount &&
      result.length >= minContentLength &&
      result.title.length > 0 &&
      result.content.length > 0
    );
  }

  /**
   * Конвертує HTML в чистий текст
   */
  private htmlToText(html: string): string {
    const dom = new JSDOM(html);
    return dom.window.document.textContent || '';
  }

  /**
   * Підраховує кількість слів
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Генерує короткий опис з тексту
   */
  private generateExcerpt(content: string, maxLength: number = 300): string {
    const text = this.htmlToText(content);
    const words = text.trim().split(/\s+/);
    
    if (words.length <= 50) {
      return text;
    }

    const excerpt = words.slice(0, 50).join(' ');
    return excerpt.length > maxLength 
      ? excerpt.substring(0, maxLength - 3) + '...'
      : excerpt + '...';
  }

  /**
   * Batch екстракція для множинних URL
   */
  async extractMultiple(urls: string[], concurrency: number = 5): Promise<FastExtractedContent[]> {
    console.log(`🚀 Fast batch extracting ${urls.length} URLs with concurrency ${concurrency}`);
    
    const results: FastExtractedContent[] = [];
    const chunks = this.chunkArray(urls, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(url => 
        this.extract(url).catch(error => {
          console.error(`Failed to extract ${url}:`, error);
          return null;
        })
      );

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults.filter(result => result !== null) as FastExtractedContent[]);
      
      // Невеличка затримка між chunks для уникнення перевантаження
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ Fast batch extraction completed: ${results.length}/${urls.length} successful`);
    return results;
  }

  /**
   * Допоміжний метод для розбиття масиву на частини
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
} 