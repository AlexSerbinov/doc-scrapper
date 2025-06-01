import { ExtractedContent } from '../types/index.js';
import { DefaultContentExtractor } from './contentExtractor.js';
import { JavaScriptContentExtractor } from '../strategies/JavaScriptContentExtractor.js';
import { JinaContentExtractor } from '../strategies/JinaContentExtractor.js';
import { SiteAnalysis } from '../strategies/SiteTypeDetector.js';
import { HttpClient } from '../utils/httpClient.js';

export interface EnhancedExtractionOptions {
  useJinaReader?: boolean;
  jsTimeout?: number;
  waitStrategy?: 'networkidle' | 'domcontentloaded' | 'load';
  waitSelector?: string;
}

export class EnhancedContentExtractor {
  private staticExtractor: DefaultContentExtractor;
  private jsExtractor?: JavaScriptContentExtractor;
  private jinaExtractor?: JinaContentExtractor;
  private options: EnhancedExtractionOptions;
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient, options: EnhancedExtractionOptions = {}) {
    this.httpClient = httpClient;
    this.options = {
      useJinaReader: false,
      ...options
    };
    
    this.staticExtractor = new DefaultContentExtractor();
    // Don't initialize heavy extractors until needed
    this.jsExtractor = undefined;
    this.jinaExtractor = undefined;
  }

  /**
   * Main extraction method with intelligent strategy selection
   */
  async extract(
    html: string, 
    url: string, 
    selectors: any = {},
    siteAnalysis?: SiteAnalysis
  ): Promise<ExtractedContent> {
    
    // If Jina Reader is enabled, use it with highest priority
    if (this.options.useJinaReader) {
      try {
        console.log(`🎯 Using Jina Reader for: ${url}`);
        return await this.extractWithJina(url);
      } catch (error) {
        console.error(`❌ Jina Reader failed, falling back to native methods:`, error);
        // Continue to native methods below
      }
    }

    // Use JavaScript extraction for SPAs
    if (siteAnalysis?.recommendations.useJavaScript) {
      try {
        console.log(`🚀 Using JavaScript extraction for: ${url}`);
        return await this.extractWithJavaScript(html, url, selectors, siteAnalysis);
      } catch (error) {
        console.error(`❌ JavaScript extraction failed, falling back to static:`, error);
        // Fall back to static extraction
      }
    }

    // Default to static extraction
    console.log(`📄 Using static extraction for: ${url}`);
    return this.staticExtractor.extract(html, url, selectors);
  }

  /**
   * Extract content using JavaScript/Puppeteer
   */
  private async extractWithJavaScript(
    html: string,
    url: string,
    selectors: any,
    siteAnalysis?: SiteAnalysis
  ): Promise<ExtractedContent> {
    
    // Initialize JS extractor with proper options
    if (!this.jsExtractor) {
      const waitStrategy = this.options.waitStrategy || siteAnalysis?.recommendations?.waitStrategy || 'networkidle';
      const jsWaitStrategy = waitStrategy === 'domcontentloaded' ? 'domcontent' : waitStrategy;
      
      this.jsExtractor = new JavaScriptContentExtractor({
        jsTimeout: this.options.jsTimeout || 30000,
        waitStrategy: jsWaitStrategy as 'networkidle' | 'domcontent' | 'load',
        waitSelector: this.options.waitSelector || siteAnalysis?.recommendations?.waitSelector,
        headless: true,
      });
    }

    try {
      const result = await this.jsExtractor.extract(html, url, selectors);
      console.log(`✓ JavaScript extraction completed: ${result.content.length} characters`);
      return result;
    } catch (error) {
      console.error(`❌ JavaScript extraction failed for ${url}:`, error);
      
      // Fallback to static extraction
      console.log(`🔄 Falling back to static extraction for: ${url}`);
      return this.staticExtractor.extract(html, url, selectors);
    }
  }

  /**
   * Extract content using Jina Reader API
   */
  private async extractWithJina(url: string): Promise<ExtractedContent> {
    // Initialize Jina extractor if not already done
    if (!this.jinaExtractor) {
      this.jinaExtractor = new JinaContentExtractor(this.httpClient);
    }

    try {
      const result = await this.jinaExtractor.extractContent(url);
      console.log(`✓ Jina Reader extraction completed: ${result.contentLength} characters`);
      
      // Convert PageMetadata to ExtractedContent format
      return {
        title: result.title || 'Extraction with Jina Reader',
        content: result.content || '',
        links: [], // Jina doesn't extract links separately, they're in content
        metadata: result,
        rawHtml: undefined
      };
    } catch (error) {
      console.error(`❌ Jina Reader extraction failed for ${url}:`, error);
      throw error; // Re-throw for higher-level fallback handling
    }
  }

  /**
   * Compare static vs JavaScript extraction for testing
   */
  async compareExtractionMethods(
    html: string,
    url: string,
    selectors: any,
    siteAnalysis?: SiteAnalysis
  ): Promise<{
    staticResult: ExtractedContent;
    javascriptResult: ExtractedContent;
    recommendation: 'static' | 'javascript';
  }> {
    console.log(`🔬 Comparing extraction methods for: ${url}`);

    // Static extraction
    console.log(`📄 Testing static extraction...`);
    const staticResult = await this.staticExtractor.extract(html, url, selectors);

    // JavaScript extraction
    console.log(`🚀 Testing JavaScript extraction...`);
    const javascriptResult = await this.extractWithJavaScript(html, url, selectors, siteAnalysis);

    // Determine recommendation based on content length and quality
    let recommendation: 'static' | 'javascript' = 'static';
    
    if (javascriptResult.content.length > staticResult.content.length * 1.5) {
      recommendation = 'javascript';
    } else if (siteAnalysis?.recommendations.useJavaScript && javascriptResult.content.length > 100) {
      recommendation = 'javascript';
    }

    console.log(`📊 Extraction Comparison Results:`);
    console.log(`   Static: ${staticResult.content.length} characters`);
    console.log(`   JavaScript: ${javascriptResult.content.length} characters`);
    console.log(`   Recommendation: ${recommendation}`);

    return {
      staticResult,
      javascriptResult,
      recommendation
    };
  }

  /**
   * Compare native methods with Jina Reader
   */
  async compareWithJina(
    html: string,
    url: string,
    selectors: any,
    siteAnalysis?: SiteAnalysis
  ): Promise<{
    staticResult: ExtractedContent;
    javascriptResult: ExtractedContent;
    jinaResult: ExtractedContent;
    recommendation: 'static' | 'javascript' | 'jina';
    reason: string;
  }> {
    console.log(`🔬 Comparing native extraction vs Jina Reader for: ${url}`);

    // Native extractions
    const nativeComparison = await this.compareExtractionMethods(html, url, selectors, siteAnalysis);

    // Jina Reader extraction
    console.log(`🎯 Testing Jina Reader extraction...`);
    const jinaResult = await this.extractWithJina(url);

    // Determine best method based on content quality and length
    let recommendation: 'static' | 'javascript' | 'jina' = 'jina';
    let reason = 'Jina Reader provides better content structure and formatting';

    const staticLength = nativeComparison.staticResult.content.length;
    const jsLength = nativeComparison.javascriptResult.content.length;
    const jinaLength = jinaResult.content.length;

    if (jinaLength < 100) {
      // Jina failed, use native recommendation
      recommendation = nativeComparison.recommendation;
      reason = 'Jina Reader failed, falling back to native methods';
    } else if (jinaLength < Math.max(staticLength, jsLength) * 0.5) {
      // Jina significantly shorter than best native method
      recommendation = nativeComparison.recommendation;
      reason = 'Native extraction provides more content than Jina Reader';
    } else {
      // Jina provides good results
      recommendation = 'jina';
      reason = 'Jina Reader provides better formatted content with clean markdown structure';
    }

    console.log(`📊 Complete Extraction Comparison:`);
    console.log(`   Static: ${staticLength} characters`);
    console.log(`   JavaScript: ${jsLength} characters`);
    console.log(`   Jina Reader: ${jinaLength} characters`);
    console.log(`   Winner: ${recommendation}`);
    console.log(`   Reason: ${reason}`);

    return {
      staticResult: nativeComparison.staticResult,
      javascriptResult: nativeComparison.javascriptResult,
      jinaResult,
      recommendation,
      reason
    };
  }

  /**
   * Extract content from multiple URLs efficiently
   */
  async extractMultiple(
    urlData: { html: string; url: string; siteAnalysis?: SiteAnalysis }[],
    selectors: any = {}
  ): Promise<ExtractedContent[]> {
    const results: ExtractedContent[] = [];

    // Group URLs by extraction strategy
    const staticUrls: typeof urlData = [];
    const jsUrls: typeof urlData = [];

    urlData.forEach(data => {
      if (data.siteAnalysis?.recommendations.useJavaScript) {
        jsUrls.push(data);
      } else {
        staticUrls.push(data);
      }
    });

    // Process static URLs quickly
    for (const { html, url } of staticUrls) {
      try {
        const result = await this.staticExtractor.extract(html, url, selectors);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to extract from ${url}:`, error);
        results.push({
          title: 'Extraction Failed',
          content: '',
          links: [],
          metadata: { url, error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }

    // Process JavaScript URLs with proper initialization
    if (jsUrls.length > 0) {
      if (!this.jsExtractor) {
        const waitStrategy = this.options.waitStrategy || 'networkidle';
        const jsWaitStrategy = waitStrategy === 'domcontentloaded' ? 'domcontent' : waitStrategy;
        
        this.jsExtractor = new JavaScriptContentExtractor({
          jsTimeout: this.options.jsTimeout || 30000,
          waitStrategy: jsWaitStrategy as 'networkidle' | 'domcontent' | 'load',
          waitSelector: this.options.waitSelector,
          headless: true,
        });
      }

      for (const { html, url, siteAnalysis } of jsUrls) {
        try {
          const result = await this.extractWithJavaScript(html, url, selectors, siteAnalysis);
          results.push(result);
        } catch (error) {
          console.error(`❌ Failed to extract from ${url}:`, error);
          // Fallback to static
          try {
            const fallbackResult = await this.staticExtractor.extract(html, url, selectors);
            results.push(fallbackResult);
          } catch (fallbackError) {
            results.push({
              title: 'Extraction Failed',
              content: '',
              links: [],
              metadata: { url, error: error instanceof Error ? error.message : 'Unknown error' }
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.jsExtractor) {
      await this.jsExtractor.cleanup();
      this.jsExtractor = undefined;
    }
  }
} 