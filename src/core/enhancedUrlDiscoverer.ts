import { UrlDiscoverer, UrlDiscoveryResult, ScrapingConfig } from '../types/index.js';
import { HttpClient } from '../utils/httpClient.js';
import { DefaultUrlDiscoverer } from './urlDiscoverer.js';
import { JavaScriptSiteDiscoverer } from '../strategies/JavaScriptSiteDiscoverer.js';
import { SiteTypeDetector, SiteAnalysis } from '../strategies/SiteTypeDetector.js';

export interface EnhancedDiscoveryOptions {
  forceJavaScript?: boolean;
  forceStatic?: boolean;
  jsTimeout?: number;
  waitStrategy?: 'networkidle' | 'domcontent' | 'load';
  waitSelector?: string;
}

export class EnhancedUrlDiscoverer implements UrlDiscoverer {
  private httpClient: HttpClient;
  private staticDiscoverer: DefaultUrlDiscoverer;
  private siteTypeDetector: SiteTypeDetector;
  private options: EnhancedDiscoveryOptions;

  constructor(httpClient: HttpClient, options: EnhancedDiscoveryOptions = {}) {
    this.httpClient = httpClient;
    this.staticDiscoverer = new DefaultUrlDiscoverer(httpClient);
    this.siteTypeDetector = new SiteTypeDetector(httpClient);
    this.options = options;
  }

  async discover(baseUrl: string, config: ScrapingConfig): Promise<UrlDiscoveryResult> {
    console.log(`🔍 Starting enhanced URL discovery for: ${baseUrl}`);

    // 1. Force modes for testing/debugging
    if (this.options.forceJavaScript) {
      console.log(`🚀 Forced JavaScript mode - using browser-based discovery`);
      return this.discoverWithJavaScript(baseUrl, config);
    }

    if (this.options.forceStatic) {
      console.log(`📄 Forced static mode - using traditional discovery`);
      return this.staticDiscoverer.discover(baseUrl, config);
    }

    // 2. Automatic site type detection
    let siteAnalysis: SiteAnalysis;
    try {
      siteAnalysis = await this.siteTypeDetector.analyzeSite(baseUrl);
    } catch (error) {
      console.warn(`⚠️  Site analysis failed, defaulting to static method: ${error}`);
      return this.staticDiscoverer.discover(baseUrl, config);
    }

    console.log(`📊 Site analysis: ${siteAnalysis.type} (${siteAnalysis.confidence}% confidence)`);
    console.log(`📋 Characteristics: ${siteAnalysis.characteristics.join(', ')}`);

    // 3. Choose strategy based on analysis
    if (siteAnalysis.recommendations.useJavaScript) {
      console.log(`🚀 Using JavaScript discovery strategy`);
      const jsResult = await this.discoverWithJavaScript(baseUrl, config, siteAnalysis);
      
      // Fallback to static if JavaScript fails completely
      if (jsResult.urls.length === 0 && jsResult.errors.length > 0) {
        console.log(`⚠️  JavaScript discovery failed, falling back to static method`);
        return this.staticDiscoverer.discover(baseUrl, config);
      }
      
      return jsResult;
    } else {
      console.log(`📄 Using static discovery strategy`);
      const staticResult = await this.staticDiscoverer.discover(baseUrl, config);
      
      // If static fails and site might support JavaScript, try as fallback
      if (staticResult.urls.length === 0 && siteAnalysis.type !== 'static') {
        console.log(`⚠️  Static discovery found no URLs, trying JavaScript as fallback`);
        return this.discoverWithJavaScript(baseUrl, config, siteAnalysis);
      }
      
      return staticResult;
    }
  }

  private async discoverWithJavaScript(
    baseUrl: string, 
    config: ScrapingConfig, 
    siteAnalysis?: SiteAnalysis
  ): Promise<UrlDiscoveryResult> {
    const jsOptions = {
      jsTimeout: this.options.jsTimeout || 30000,
      waitStrategy: this.options.waitStrategy || siteAnalysis?.recommendations.waitStrategy || 'networkidle',
      waitSelector: this.options.waitSelector || siteAnalysis?.recommendations.waitSelector,
      headless: true,
    };

    const jsDiscoverer = new JavaScriptSiteDiscoverer(this.httpClient, jsOptions);
    
    try {
      const result = await jsDiscoverer.discover(baseUrl, config);
      
      console.log(`✓ JavaScript discovery completed: ${result.urls.length} URLs found`);
      return result;
    } catch (error) {
      console.error(`❌ JavaScript discovery failed: ${error}`);
      return {
        urls: [],
        sitemap: [],
        navigation: [],
        errors: [`JavaScript discovery failed: ${error}`]
      };
    } finally {
      // Cleanup browser resources
      await jsDiscoverer.cleanup();
    }
  }

  /**
   * Get site analysis without running discovery
   */
  async analyzeSite(baseUrl: string): Promise<SiteAnalysis> {
    return this.siteTypeDetector.analyzeSite(baseUrl);
  }

  /**
   * Test both static and JavaScript methods for comparison
   */
  async compareStrategies(baseUrl: string, config: ScrapingConfig): Promise<{
    siteAnalysis: SiteAnalysis;
    staticResult: UrlDiscoveryResult;
    javascriptResult: UrlDiscoveryResult;
  }> {
    console.log(`🔬 Comparing discovery strategies for: ${baseUrl}`);

    const siteAnalysis = await this.siteTypeDetector.analyzeSite(baseUrl);
    
    console.log(`📄 Testing static strategy...`);
    const staticResult = await this.staticDiscoverer.discover(baseUrl, config);
    
    console.log(`🚀 Testing JavaScript strategy...`);
    const javascriptResult = await this.discoverWithJavaScript(baseUrl, config, siteAnalysis);

    console.log(`📊 Comparison Results:`);
    console.log(`   Static: ${staticResult.urls.length} URLs, ${staticResult.errors.length} errors`);
    console.log(`   JavaScript: ${javascriptResult.urls.length} URLs, ${javascriptResult.errors.length} errors`);

    return {
      siteAnalysis,
      staticResult,
      javascriptResult
    };
  }
} 