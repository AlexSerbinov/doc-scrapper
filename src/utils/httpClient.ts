import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { HttpClientOptions } from '../types/index.js';

export class HttpClient {
  private client: AxiosInstance;
  private lastRequestTime = 0;
  private options: HttpClientOptions;

  constructor(options: HttpClientOptions) {
    this.options = options;
    this.client = axios.create({
      timeout: options.timeout,
      headers: {
        'User-Agent': options.userAgent,
        ...options.headers,
      },
    });

    // Add response interceptor for retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || config.__retryCount >= this.options.maxRetries) {
          return Promise.reject(error);
        }

        config.__retryCount = config.__retryCount || 0;
        config.__retryCount += 1;

        // Wait before retry with exponential backoff
        const delay = this.options.retryDelay * Math.pow(2, config.__retryCount - 1);
        await this.delay(delay);

        return this.client(config);
      }
    );
  }

  async get(url: string, rateLimitMs = 1000): Promise<AxiosResponse<string>> {
    // Apply rate limiting
    await this.rateLimit(rateLimitMs);
    
    try {
      const response = await this.client.get<string>(url);
      console.log(`✓ Successfully fetched: ${url}`);
      return response;
    } catch (error) {
      console.error(`✗ Failed to fetch: ${url}`, error);
      throw error;
    }
  }

  private async rateLimit(delayMs: number): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < delayMs) {
      const waitTime = delayMs - timeSinceLastRequest;
      await this.delay(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkRobotsTxt(baseUrl: string): Promise<boolean> {
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString();
      const response = await this.get(robotsUrl, 0); // No rate limit for robots.txt
      
      // Simple robots.txt parsing - check for User-agent: * and Disallow rules
      const robotsText = response.data;
      const lines = robotsText.split('\n');
      
      let isUserAgentAll = false;
      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        if (trimmed.startsWith('user-agent:') && trimmed.includes('*')) {
          isUserAgentAll = true;
        }
        if (isUserAgentAll && trimmed.startsWith('disallow:')) {
          const disallowPath = trimmed.substring('disallow:'.length).trim();
          if (disallowPath === '/') {
            console.warn('⚠️  robots.txt disallows all crawling');
            return false;
          }
        }
      }
      
      console.log('✓ robots.txt check passed');
      return true;
    } catch (error) {
      console.log('ℹ️  No robots.txt found, proceeding...');
      return true; // If robots.txt doesn't exist, allow scraping
    }
  }
} 