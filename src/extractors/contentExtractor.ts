import { load } from 'cheerio';
import { ContentExtractor, ExtractedContent, ContentSelectors, PageMetadata } from '../types/index.js';

export class DefaultContentExtractor implements ContentExtractor {
  async extract(html: string, url: string, selectors: ContentSelectors): Promise<ExtractedContent> {
    const $ = load(html);
    
    // Remove unwanted elements
    this.removeUnwantedElements($, selectors);
    
    const title = this.extractTitle($, selectors);
    const content = this.extractContent($, selectors);
    const metadata = this.extractMetadata($, url);
    const links = this.extractLinks($, url);

    return {
      title,
      content,
      metadata,
      links,
      rawHtml: html
    };
  }

  private removeUnwantedElements($: any, selectors: ContentSelectors): void {
    // Default elements to remove
    const defaultExclude = [
      'script',
      'style',
      'nav',
      'header',
      'footer',
      '.advertisement',
      '.ads',
      '.cookie-banner',
      '.social-share',
      '.sidebar',
      '.navigation',
      '[role="navigation"]',
      '.breadcrumb'
    ];

    // Combine with custom exclude selectors
    const excludeSelectors = [...defaultExclude, ...(selectors.exclude || [])];
    
    excludeSelectors.forEach(selector => {
      $(selector).remove();
    });
  }

  private extractTitle($: any, selectors: ContentSelectors): string {
    // Try custom title selector first
    if (selectors.title) {
      const customTitle = $(selectors.title).first().text().trim();
      if (customTitle) return customTitle;
    }

    // Try common title selectors
    const titleSelectors = [
      'h1',
      'title',
      '.page-title',
      '.document-title',
      '[data-title]'
    ];

    for (const selector of titleSelectors) {
      const title = $(selector).first().text().trim();
      if (title && title.length > 0 && title.length < 200) {
        return title;
      }
    }

    return 'Untitled Page';
  }

  private extractContent($: any, selectors: ContentSelectors): string {
    let content = '';

    // Try custom content selector first
    if (selectors.content) {
      content = $(selectors.content).html() || '';
      if (content.trim()) {
        return this.cleanContent(content);
      }
    }

    // Try main content selectors
    const contentSelectors = [
      selectors.main || 'main',
      '[role="main"]',
      'article',
      '.content',
      '.main-content',
      '.post-content',
      '.entry-content',
      '.page-content',
      '.documentation-content'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = element.html() || '';
        if (content.trim()) {
          return this.cleanContent(content);
        }
      }
    }

    // Fallback: try to extract all text content
    $('script, style, nav, header, footer').remove();
    content = $('body').html() || $.html();
    
    return this.cleanContent(content);
  }

  private cleanContent(content: string): string {
    // Create a new cheerio instance for content cleaning
    const $content = load(content);
    
    // Remove empty elements
    $content('*').each((_: number, element: any) => {
      const $el = $content(element);
      if ($el.text().trim() === '' && $el.find('img, video, iframe').length === 0) {
        $el.remove();
      }
    });

    // Convert relative URLs to absolute URLs
    // Note: This would need the base URL passed in to work properly
    
    return $content.html() || '';
  }

  private extractMetadata($: any, url: string): PageMetadata {
    const metadata: PageMetadata = {
      url
    };

    // Extract description
    const description = $('meta[name="description"]').attr('content') ||
                      $('meta[property="og:description"]').attr('content') ||
                      $('.description').first().text().trim();
    if (description) {
      metadata.description = description;
    }

    // Extract author
    const author = $('meta[name="author"]').attr('content') ||
                  $('.author').first().text().trim();
    if (author) {
      metadata.author = author;
    }

    // Extract last modified date
    const lastModified = $('meta[name="last-modified"]').attr('content') ||
                        $('meta[property="article:modified_time"]').attr('content') ||
                        $('.last-modified').first().text().trim();
    if (lastModified) {
      metadata.lastModified = lastModified;
    }

    // Extract breadcrumbs
    const breadcrumbs: string[] = [];
    $('.breadcrumb a, .breadcrumbs a, nav[aria-label="breadcrumb"] a').each((_: number, element: any) => {
      const text = $(element).text().trim();
      if (text) {
        breadcrumbs.push(text);
      }
    });
    if (breadcrumbs.length > 0) {
      metadata.breadcrumbs = breadcrumbs;
    }

    // Extract tags/keywords
    const keywordsContent = $('meta[name="keywords"]').attr('content');
    if (keywordsContent) {
      metadata.tags = keywordsContent.split(',').map((tag: string) => tag.trim());
    }

    return metadata;
  }

  private extractLinks($: any, baseUrl: string): string[] {
    const links: string[] = [];
    
    $('a[href]').each((_: number, element: any) => {
      try {
        const href = $(element).attr('href');
        if (href) {
          const absoluteUrl = new URL(href, baseUrl).toString();
          links.push(absoluteUrl);
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }
} 