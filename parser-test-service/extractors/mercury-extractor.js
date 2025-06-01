import mercury from '@postlight/parser';

export class MercuryExtractor {
  constructor() {
    this.name = 'Mercury Parser';
  }

  async extract(url) {
    console.log(`🚀 Mercury extracting: ${url}`);
    const startTime = Date.now();
    
    try {
      const result = await mercury.parse(url, {
        headers: {
          'User-Agent': 'Parser-Test-Service/1.0.0 (Documentation Analysis)'
        }
      });

      if (!result || !result.content) {
        throw new Error('Mercury returned empty content');
      }

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        title: result.title || 'Untitled',
        content: result.content,
        textContent: this.stripHTML(result.content),
        wordCount: this.countWords(result.content),
        author: result.author,
        publishedTime: result.date_published,
        url: result.url || url,
        siteName: result.domain,
        contentLength: result.content.length,
        extractionTime: duration,
        extractor: 'mercury'
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Mercury failed in ${duration}ms: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        extractionTime: duration,
        extractor: 'mercury'
      };
    }
  }

  stripHTML(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  countWords(text) {
    const cleanText = this.stripHTML(text);
    return cleanText.split(/\s+/).filter(word => word.length > 0).length;
  }
} 