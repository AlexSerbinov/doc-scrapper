import axios from 'axios';

export class JinaExtractor {
  constructor() {
    this.name = 'Jina Reader API';
    this.lastRequestTime = 0;
    this.minDelayMs = 3000; // 3 seconds between requests (20 requests/minute)
  }

  async extract(url) {
    console.log(`🎯 Jina extracting: ${url}`);
    
    // Rate limiting - ensure 3 seconds between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelayMs) {
      const waitTime = this.minDelayMs - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const startTime = Date.now();
    this.lastRequestTime = startTime;
    
    try {
      const response = await axios.get(`https://r.jina.ai/${url}`, {
        headers: {
          'Accept': 'text/plain',
          'User-Agent': 'Parser-Test-Service/1.0.0 (Documentation Analysis)'
        },
        timeout: 30000
      });

      if (!response.data || response.data.trim().length === 0) {
        throw new Error('Jina returned empty content');
      }

      const duration = Date.now() - startTime;
      const content = response.data.trim();
      const wordCount = this.countWords(content);

      // Extract title from markdown (first # heading)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : 'Untitled';

      return {
        success: true,
        title: title,
        content: content,
        textContent: content, // Jina already returns plain text/markdown
        wordCount: wordCount,
        contentLength: content.length,
        extractionTime: duration,
        extractor: 'jina'
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Jina failed in ${duration}ms: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        extractionTime: duration,
        extractor: 'jina'
      };
    }
  }

  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
} 