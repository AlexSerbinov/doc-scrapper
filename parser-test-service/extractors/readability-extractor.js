import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import axios from 'axios';

export class ReadabilityExtractor {
  constructor() {
    this.name = 'Mozilla Readability';
  }

  async extract(url) {
    console.log(`📖 Readability extracting: ${url}`);
    const startTime = Date.now();
    
    try {
      // Отримуємо HTML
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Parser-Test-Service/1.0.0 (Documentation Analysis)'
        },
        timeout: 30000
      });

      if (!response.data) {
        throw new Error('No HTML content received');
      }

      // Створюємо DOM та парсимо з Readability
      const dom = new JSDOM(response.data, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article || !article.content) {
        throw new Error('Readability could not extract content');
      }

      const duration = Date.now() - startTime;
      const textContent = this.stripHTML(article.content);
      const wordCount = this.countWords(textContent);

      return {
        success: true,
        title: article.title || 'Untitled',
        content: article.content,
        textContent: textContent,
        wordCount: wordCount,
        author: article.byline,
        siteName: article.siteName,
        excerpt: article.excerpt || this.generateExcerpt(textContent),
        contentLength: article.length || article.content.length,
        extractionTime: duration,
        extractor: 'readability'
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Readability failed in ${duration}ms: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        extractionTime: duration,
        extractor: 'readability'
      };
    }
  }

  stripHTML(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  generateExcerpt(text, maxLength = 300) {
    const words = text.trim().split(/\s+/);
    
    if (words.length <= 50) {
      return text;
    }

    const excerpt = words.slice(0, 50).join(' ');
    return excerpt.length > maxLength 
      ? excerpt.substring(0, maxLength - 3) + '...'
      : excerpt + '...';
  }
} 