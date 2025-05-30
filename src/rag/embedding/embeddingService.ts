import { openai } from '@ai-sdk/openai';
import { EmbeddingService, EmbeddingConfig } from '../types/ragTypes.js';
import { RAGConfigService } from '../config/ragConfig.js';
import { embedMany } from 'ai';

export class OpenAIEmbeddingService implements EmbeddingService {
  private config: EmbeddingConfig;
  private apiKey: string;

  constructor() {
    const ragConfig = RAGConfigService.getInstance();
    this.config = ragConfig.config.embedding;
    this.apiKey = ragConfig.getApiKey('openai');

    if (!this.apiKey) {
      throw new Error('OpenAI API key is required for embedding service');
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const model = openai.embedding(this.config.model);

      const { embeddings } = await embedMany({
        model,
        values: texts,
      });
      return embeddings;
    } catch (error: any) {
      console.error('Error generating embeddings:', error);
      throw new Error(`Failed to generate embeddings: ${error.message || 'Unknown error'}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0];
  }

  getDimensions(): number {
    // Text-embedding-3-small: 1536 dimensions
    // Text-embedding-3-large: 3072 dimensions  
    switch (this.config.model) {
      case 'text-embedding-3-small':
        return this.config.dimensions || 1536;
      case 'text-embedding-3-large':
        return this.config.dimensions || 3072;
      case 'text-embedding-ada-002':
        return 1536;
      default:
        return this.config.dimensions || 1536;
    }
  }

  getModel(): string {
    return this.config.model;
  }
}

export class EmbeddingServiceFactory {
  static create(): EmbeddingService {
    const ragConfig = RAGConfigService.getInstance();
    const provider = ragConfig.config.embedding.provider;

    switch (provider) {
      case 'openai':
        return new OpenAIEmbeddingService();
      case 'cohere':
        // TODO: Implement Cohere embedding service
        throw new Error('Cohere embedding service not implemented yet');
      default:
        throw new Error(`Unknown embedding provider: ${provider}`);
    }
  }
} 