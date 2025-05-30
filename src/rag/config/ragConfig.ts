import { config } from 'dotenv';
import { RAGConfig } from '../types/ragTypes.js';

// Load environment variables
config();

export class RAGConfigService {
  private static instance: RAGConfigService;
  private _config: RAGConfig;

  private constructor() {
    this._config = this.loadConfig();
  }

  public static getInstance(): RAGConfigService {
    if (!RAGConfigService.instance) {
      RAGConfigService.instance = new RAGConfigService();
    }
    return RAGConfigService.instance;
  }

  public get config(): RAGConfig {
    return this._config;
  }

  private loadConfig(): RAGConfig {
    // Validate required environment variables
    this.validateRequiredEnvVars();

    return {
      embedding: {
        provider: (process.env.EMBEDDING_PROVIDER as 'openai' | 'cohere') || 'openai',
        model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
        dimensions: process.env.EMBEDDING_DIMENSIONS ? parseInt(process.env.EMBEDDING_DIMENSIONS) : undefined,
      },
      chunking: {
        chunkSize: parseInt(process.env.CHUNK_SIZE || '800'),
        chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '100'),
        strategy: (process.env.CHUNKING_STRATEGY as 'recursive' | 'markdown' | 'sentence') || 'markdown',
      },
      vectorStore: {
        provider: (process.env.VECTOR_DB as 'chroma' | 'pinecone' | 'faiss') || 'chroma',
        connectionString: this.getVectorStoreConnectionString(),
        collectionName: process.env.COLLECTION_NAME || 'doc-scrapper-docs',
      },
      retrieval: {
        k: parseInt(process.env.RETRIEVAL_K || '5'),
        threshold: process.env.RETRIEVAL_THRESHOLD ? parseFloat(process.env.RETRIEVAL_THRESHOLD) : undefined,
        method: (process.env.RETRIEVAL_METHOD as 'semantic' | 'hybrid' | 'keyword') || 'semantic',
      },
      llm: {
        provider: (process.env.LLM_PROVIDER as 'openai' | 'anthropic' | 'local') || 'openai',
        model: process.env.LLM_MODEL || 'gpt-4o-mini',
        temperature: parseFloat(process.env.TEMPERATURE || '0.1'),
        maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : undefined,
      },
    };
  }

  private validateRequiredEnvVars(): void {
    const required = ['OPENAI_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please create a .env file based on env-template.txt and add your API keys.'
      );
    }
  }

  private getVectorStoreConnectionString(): string {
    const provider = process.env.VECTOR_DB || 'chroma';
    
    switch (provider) {
      case 'chroma':
        const host = process.env.CHROMA_HOST || 'localhost';
        const port = process.env.CHROMA_PORT || '8000';
        return `http://${host}:${port}`;
      
      case 'pinecone':
        return process.env.PINECONE_INDEX || 'doc-scrapper';
      
      case 'faiss':
        return process.env.FAISS_INDEX_PATH || './data/faiss_index';
      
      default:
        return '';
    }
  }

  public getApiKey(provider: string): string {
    switch (provider) {
      case 'openai':
        return process.env.OPENAI_API_KEY || '';
      case 'cohere':
        return process.env.COHERE_API_KEY || '';
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY || '';
      case 'pinecone':
        return process.env.PINECONE_API_KEY || '';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  public isProductionMode(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public getLogLevel(): string {
    return process.env.LOG_LEVEL || 'info';
  }

  public printConfig(): void {
    console.log('🔧 RAG Configuration:');
    console.log('  Embedding:', this._config.embedding.provider, this._config.embedding.model);
    console.log('  Vector Store:', this._config.vectorStore.provider);
    console.log('  LLM:', this._config.llm.provider, this._config.llm.model);
    console.log('  Chunk Size:', this._config.chunking.chunkSize);
    console.log('  Retrieval K:', this._config.retrieval.k);
  }
} 