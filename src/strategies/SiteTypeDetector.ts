import { HttpClient } from '../utils/httpClient.js';

export type SiteType = 'static' | 'spa' | 'hybrid' | 'unknown';

export interface SiteAnalysis {
  type: SiteType;
  confidence: number;
  characteristics: string[];
  recommendations: {
    useJavaScript: boolean;
    waitStrategy?: 'networkidle' | 'domcontent' | 'load';
    waitSelector?: string;
  };
}

export class SiteTypeDetector {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Analyze a website to determine its type and best scraping strategy
   */
  async analyzeSite(baseUrl: string): Promise<SiteAnalysis> {
    console.log(`🔬 Analyzing site type for: ${baseUrl}`);
    
    const analysis: SiteAnalysis = {
      type: 'unknown',
      confidence: 0,
      characteristics: [],
      recommendations: {
        useJavaScript: false,
      }
    };

    try {
      // 1. Check for sitemap.xml
      console.log(`📋 Checking sitemap.xml...`);
      const hasSitemap = await this.checkSitemap(baseUrl);
      if (hasSitemap) {
        analysis.characteristics.push('Has valid sitemap.xml');
        analysis.confidence += 30;
        console.log(`✓ Sitemap check: Valid XML found`);
      } else {
        analysis.characteristics.push('No sitemap.xml or returns HTML');
        analysis.confidence -= 10;
        console.log(`⚠️ Sitemap check: No valid XML found`);
      }

      // 2. Analyze main page content
      console.log(`🏠 Analyzing main page content...`);
      const pageAnalysis = await this.analyzeMainPage(baseUrl);
      analysis.characteristics.push(...pageAnalysis.characteristics);
      analysis.confidence += pageAnalysis.confidence;
      console.log(`✓ Main page analysis: ${pageAnalysis.characteristics.length} characteristics found`);

      // 3. Check robots.txt
      console.log(`🤖 Checking robots.txt...`);
      const robotsAnalysis = await this.checkRobotsTxt(baseUrl);
      if (robotsAnalysis.isValid) {
        analysis.characteristics.push('Has valid robots.txt');
        analysis.confidence += 10;
        console.log(`✓ Robots.txt check: Valid file found`);
      } else {
        analysis.characteristics.push('No robots.txt or returns HTML');
        analysis.confidence -= 5;
        console.log(`⚠️ Robots.txt check: No valid file found`);
      }

      // 4. Determine site type based on characteristics
      console.log(`🎯 Determining site type...`);
      analysis.type = this.determineSiteType(analysis.characteristics, analysis.confidence);
      
      // 5. Generate recommendations
      console.log(`💡 Generating recommendations...`);
      analysis.recommendations = this.generateRecommendations(analysis);

      console.log(`✓ Site analysis complete: ${analysis.type} (confidence: ${analysis.confidence}%)`);
      
    } catch (error) {
      console.warn(`⚠️ Site analysis failed: ${error}`);
      console.warn(`🔧 Error details:`, error instanceof Error ? error.message : String(error));
      analysis.characteristics.push('Analysis failed - network or server error');
    }

    return analysis;
  }

  /**
   * Check if sitemap.xml returns valid XML
   */
  private async checkSitemap(baseUrl: string): Promise<boolean> {
    try {
      const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString();
      console.log(`🌐 Fetching sitemap: ${sitemapUrl}`);
      
      const response = await this.httpClient.get(sitemapUrl, 2000); // Increased delay
      
      // Check if response is XML (not HTML)
      const content = response.data;
      const isXml = content.includes('<?xml') || content.includes('<urlset') || content.includes('<sitemapindex');
      const isHtml = content.includes('<!DOCTYPE html') || content.includes('<html');
      
      console.log(`📊 Sitemap response size: ${content.length} chars, isXml: ${isXml}, isHtml: ${isHtml}`);
      
      return isXml && !isHtml;
    } catch (error) {
      console.log(`❌ Sitemap check failed:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Check robots.txt validity
   */
  private async checkRobotsTxt(baseUrl: string): Promise<{ isValid: boolean; hasSitemap: boolean }> {
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString();
      console.log(`🤖 Fetching robots.txt: ${robotsUrl}`);
      
      const response = await this.httpClient.get(robotsUrl, 2000); // Increased delay
      
      const content = response.data;
      const isValid = !content.includes('<!DOCTYPE html') && !content.includes('<html');
      const hasSitemap = content.toLowerCase().includes('sitemap:');
      
      console.log(`📊 Robots.txt response size: ${content.length} chars, isValid: ${isValid}, hasSitemap: ${hasSitemap}`);
      
      return { isValid, hasSitemap };
    } catch (error) {
      console.log(`❌ Robots.txt check failed:`, error instanceof Error ? error.message : String(error));
      return { isValid: false, hasSitemap: false };
    }
  }

  /**
   * Analyze main page for SPA characteristics
   */
  private async analyzeMainPage(baseUrl: string): Promise<{ characteristics: string[]; confidence: number }> {
    const characteristics: string[] = [];
    let confidence = 0;

    try {
      console.log(`🏠 Fetching main page: ${baseUrl}`);
      const response = await this.httpClient.get(baseUrl, 2000); // Increased delay
      const content = response.data.toLowerCase();

      console.log(`📊 Main page response size: ${content.length} chars`);

      // Check for SPA frameworks
      const frameworks = [
        { name: 'Angular', patterns: ['ng-version', 'angular', 'app-root'] },
        { name: 'React', patterns: ['react', 'reactdom', '__react'] },
        { name: 'Vue', patterns: ['vue.js', 'vue.min.js', '__vue__'] },
        { name: 'Next.js', patterns: ['__next', '_next/', 'next.js'] },
        { name: 'Nuxt', patterns: ['__nuxt', '_nuxt/', 'nuxt.js'] },
        { name: 'Svelte', patterns: ['svelte', '__svelte'] },
      ];

      for (const framework of frameworks) {
        if (framework.patterns.some(pattern => content.includes(pattern))) {
          characteristics.push(`Uses ${framework.name} framework`);
          confidence -= 20; // SPA frameworks need JavaScript
          console.log(`✓ Framework detected: ${framework.name}`);
          break;
        }
      }

      // Check for static site generators
      const staticGenerators = [
        { name: 'Gatsby', patterns: ['gatsby', '__gatsby'] },
        { name: 'Hugo', patterns: ['generated by hugo'] },
        { name: 'Jekyll', patterns: ['generated by jekyll'] },
        { name: 'Docusaurus', patterns: ['docusaurus', '__docusaurus'] },
        { name: 'VuePress', patterns: ['vuepress'] },
        { name: 'GitBook', patterns: ['gitbook'] },
      ];

      for (const generator of staticGenerators) {
        if (generator.patterns.some(pattern => content.includes(pattern))) {
          characteristics.push(`Built with ${generator.name}`);
          confidence += 25; // Static generators are usually good for scraping
          console.log(`✓ Static generator detected: ${generator.name}`);
          break;
        }
      }

      // Check content indicators
      if (content.includes('<nav') && content.includes('href=')) {
        characteristics.push('Has navigation with links in HTML');
        confidence += 20;
        console.log(`✓ Navigation links found in HTML`);
      } else {
        characteristics.push('Limited navigation in static HTML');
        confidence -= 15;
        console.log(`⚠️ Limited navigation in HTML`);
      }

      // Check for documentation-specific patterns
      const docPatterns = ['docs/', 'documentation', 'api reference', 'getting started'];
      const hasDocPatterns = docPatterns.some(pattern => content.includes(pattern));
      if (hasDocPatterns) {
        characteristics.push('Contains documentation keywords');
        confidence += 15;
        console.log(`✓ Documentation keywords found`);
      }

      // Check for heavy JavaScript dependency
      const scriptTags = (content.match(/<script/g) || []).length;
      if (scriptTags > 10) {
        characteristics.push(`Heavy JavaScript usage (${scriptTags} script tags)`);
        confidence -= 15;
        console.log(`⚠️ Heavy JavaScript usage: ${scriptTags} script tags`);
      } else if (scriptTags < 3) {
        characteristics.push('Minimal JavaScript usage');
        confidence += 10;
        console.log(`✓ Minimal JavaScript usage: ${scriptTags} script tags`);
      }

      // Check if main content is present
      const hasMainContent = content.includes('<main') || 
                           content.includes('<article') ||
                           content.length > 5000; // Substantial content
      if (hasMainContent) {
        characteristics.push('Has substantial content in HTML');
        confidence += 15;
        console.log(`✓ Substantial content detected (${content.length} chars)`);
      } else {
        characteristics.push('Limited content in initial HTML');
        confidence -= 20;
        console.log(`⚠️ Limited content in HTML (${content.length} chars)`);
      }

    } catch (error) {
      characteristics.push('Failed to analyze main page');
      confidence -= 10;
      console.log(`❌ Main page analysis failed:`, error instanceof Error ? error.message : String(error));
    }

    console.log(`📊 Main page analysis complete: ${characteristics.length} characteristics, confidence: ${confidence}`);
    return { characteristics, confidence };
  }

  /**
   * Determine site type based on analysis
   */
  private determineSiteType(characteristics: string[], confidence: number): SiteType {
    const charString = characteristics.join(' ').toLowerCase();

    // Strong indicators for SPA
    if (charString.includes('angular') || 
        charString.includes('react') || 
        charString.includes('vue') ||
        (charString.includes('no sitemap') && charString.includes('limited navigation'))) {
      return 'spa';
    }

    // Strong indicators for static sites
    if (charString.includes('valid sitemap') && 
        charString.includes('navigation with links') &&
        confidence > 50) {
      return 'static';
    }

    // Hybrid characteristics
    if ((charString.includes('next.js') || charString.includes('nuxt')) &&
        charString.includes('valid sitemap')) {
      return 'hybrid';
    }

    // Based on confidence level
    if (confidence > 40) {
      return 'static';
    } else if (confidence < 0) {
      return 'spa';
    } else {
      return 'hybrid';
    }
  }

  /**
   * Generate scraping recommendations based on analysis
   */
  private generateRecommendations(analysis: SiteAnalysis): SiteAnalysis['recommendations'] {
    const recommendations: SiteAnalysis['recommendations'] = {
      useJavaScript: false,
    };

    switch (analysis.type) {
      case 'spa':
        recommendations.useJavaScript = true;
        recommendations.waitStrategy = 'networkidle';
        
        // Framework-specific recommendations
        const charString = analysis.characteristics.join(' ').toLowerCase();
        if (charString.includes('angular')) {
          recommendations.waitSelector = 'router-outlet, [ng-version]';
        } else if (charString.includes('react')) {
          recommendations.waitSelector = '[data-reactroot], #root';
        } else if (charString.includes('vue')) {
          recommendations.waitSelector = '[data-v-], .vue-app';
        }
        break;

      case 'hybrid':
        recommendations.useJavaScript = true;
        recommendations.waitStrategy = 'domcontent';
        break;

      case 'static':
        recommendations.useJavaScript = false;
        break;

      default:
        // For unknown sites, try static first, then JavaScript if needed
        recommendations.useJavaScript = false;
        break;
    }

    return recommendations;
  }
} 