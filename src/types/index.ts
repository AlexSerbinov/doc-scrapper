// Core interfaces and types for the documentation scraper

export interface ScrapingConfig {
  baseUrl: string;
  outputFormat: 'markdown' | 'json' | 'html';
  outputDir: string;
  maxConcurrency: number;
  rateLimitMs: number;
  maxDepth: number;
  selectors: ContentSelectors;
  excludePatterns: string[];
  includePatterns?: string[];
  userAgent?: string;
}

export interface ContentSelectors {
  main?: string;
  title?: string;
  content?: string;
  navigation?: string;
  breadcrumbs?: string;
  exclude?: string[];
}

export interface ExtractedContent {
  title: string;
  content: string;
  metadata: PageMetadata;
  links: string[];
  rawHtml?: string;
}

export interface PageMetadata {
  url: string;
  lastModified?: string;
  description?: string;
  author?: string;
  tags?: string[];
  breadcrumbs?: string[];
  section?: string;
}

export interface ScrapingResult {
  success: boolean;
  pages: ProcessedPage[];
  errors: ScrapingError[];
  summary: ScrapingSummary;
}

export interface ProcessedPage {
  url: string;
  title: string;
  content: string;
  metadata: PageMetadata;
  outputPath: string;
}

export interface ScrapingError {
  url: string;
  error: string;
  timestamp: Date;
  retryCount?: number;
}

export interface ScrapingSummary {
  totalPages: number;
  successfulPages: number;
  failedPages: number;
  startTime: Date;
  endTime: Date;
  outputFormat: string;
  outputDirectory: string;
}

export interface UrlDiscoveryResult {
  urls: string[];
  sitemap?: string[];
  navigation?: string[];
  errors: string[];
}

export interface HttpClientOptions {
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  userAgent: string;
  headers?: Record<string, string>;
}

// Strategy pattern interfaces
export interface Scraper {
  scrape(url: string, config: ScrapingConfig): Promise<ScrapingResult>;
}

export interface ContentExtractor {
  extract(html: string, url: string, selectors: ContentSelectors): Promise<ExtractedContent>;
}

export interface UrlDiscoverer {
  discover(baseUrl: string, config: ScrapingConfig): Promise<UrlDiscoveryResult>;
}

export interface StorageAdapter {
  save(pages: ProcessedPage[], config: ScrapingConfig): Promise<void>;
}

export interface Formatter {
  format(content: ExtractedContent): string;
}

// Progress tracking
export interface ProgressCallback {
  (current: number, total: number, currentUrl?: string): void;
}

export interface ScrapingProgress {
  current: number;
  total: number;
  currentUrl?: string;
  errors: number;
  startTime: Date;
} 