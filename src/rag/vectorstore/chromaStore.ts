import { ChromaClient, OpenAIEmbeddingFunction, Collection } from 'chromadb';
import { VectorStore, DocumentChunk, RetrievalResult, CollectionInfo, VectorStoreConfig } from '../types/ragTypes.js';
import { RAGConfigService } from '../config/ragConfig.js';

export class ChromaVectorStore implements VectorStore {
  private client: ChromaClient | null = null;
  private collection: Collection | null = null;
  private config: VectorStoreConfig;
  private embeddingFunction: OpenAIEmbeddingFunction | null = null;

  constructor() {
    this.config = RAGConfigService.getInstance().config.vectorStore;
  }

  async initialize(): Promise<void> {
    try {
      // Dynamic import for ChromaDB
      const { ChromaClient, OpenAIEmbeddingFunction } = await import('chromadb');
      
      // Initialize ChromaDB client
      this.client = new ChromaClient({
        path: this.config.connectionString || 'http://localhost:8000'
      });

      // Initialize embedding function for ChromaDB
      const ragConfig = RAGConfigService.getInstance();
      this.embeddingFunction = new OpenAIEmbeddingFunction({
        openai_api_key: ragConfig.getApiKey('openai'),
        openai_model: ragConfig.config.embedding.model,
      });

      // Try to get existing collection
      try {
        this.collection = await this.client.getCollection({
          name: this.config.collectionName,
          embeddingFunction: this.embeddingFunction,
        });
        
        console.log(`✅ Connected to existing collection: ${this.config.collectionName}`);
      } catch (error: any) {
        // Collection doesn't exist, create it
        this.collection = await this.client.createCollection({
          name: this.config.collectionName,
          embeddingFunction: this.embeddingFunction,
          metadata: { 
            description: 'Documentation chunks for RAG system',
            created_at: new Date().toISOString(),
          },
        });
        
        console.log(`✅ Created new collection: ${this.config.collectionName}`);
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize ChromaDB:', error);
      throw new Error(`ChromaDB initialization failed: ${error.message || 'Unknown error'}`);
    }
  }

  async addDocuments(chunks: DocumentChunk[]): Promise<void> {
    if (!this.collection) {
      throw new Error('Vector store not initialized. Call initialize() first.');
    }

    if (chunks.length === 0) {
      console.log('No chunks to add to vector store');
      return;
    }

    try {
      // Prepare data for ChromaDB
      const ids = chunks.map(chunk => chunk.id);
      const documents = chunks.map(chunk => chunk.content);
      const metadatas = chunks.map(chunk => ({
        sourceUrl: chunk.metadata.sourceUrl,
        title: chunk.metadata.title,
        section: chunk.metadata.section || '',
        filePath: chunk.metadata.filePath,
        chunkIndex: chunk.metadata.chunkIndex,
        tokenCount: chunk.metadata.tokenCount,
        createdAt: chunk.metadata.createdAt.toISOString(),
      }));

      // Add documents in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, chunks.length);
        const batchIds = ids.slice(i, batchEnd);
        const batchDocuments = documents.slice(i, batchEnd);
        const batchMetadatas = metadatas.slice(i, batchEnd);

        await this.collection.add({
          ids: batchIds,
          documents: batchDocuments,
          metadatas: batchMetadatas,
        });

        console.log(`📄 Added batch ${Math.floor(i/batchSize) + 1}: ${batchEnd - i} chunks`);
      }

      console.log(`✅ Successfully added ${chunks.length} chunks to vector store`);
    } catch (error: any) {
      console.error('Error adding documents to vector store:', error);
      throw new Error(`Failed to add documents: ${error.message || 'Unknown error'}`);
    }
  }

  async similaritySearch(query: string, k: number): Promise<RetrievalResult> {
    if (!this.collection) {
      throw new Error('Vector store not initialized. Call initialize() first.');
    }

    const startTime = Date.now();

    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: k,
        include: ['documents', 'metadatas', 'distances'] as any,
      });

      const chunks: DocumentChunk[] = [];
      const scores: number[] = [];

      if (results.documents && results.documents[0] && results.metadatas && results.metadatas[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          const document = results.documents[0][i];
          const metadata = results.metadatas[0][i] as any;
          const distance = results.distances?.[0]?.[i] || 0;
          
          // Convert distance to similarity score (lower distance = higher similarity)
          const score = 1 - distance;
          
          const chunk: DocumentChunk = {
            id: results.ids?.[0]?.[i] || `chunk-${i}`,
            content: document || '',
            metadata: {
              sourceUrl: metadata.sourceUrl || '',
              title: metadata.title || '',
              section: metadata.section || '',
              filePath: metadata.filePath || '',
              chunkIndex: metadata.chunkIndex || 0,
              tokenCount: metadata.tokenCount || 0,
              createdAt: new Date(metadata.createdAt || Date.now()),
            },
          };

          chunks.push(chunk);
          scores.push(score);
        }
      }

      const totalTime = Date.now() - startTime;

      return {
        chunks,
        scores,
        query,
        retrievalMethod: 'semantic',
        totalTime,
      };
    } catch (error: any) {
      console.error('Error during similarity search:', error);
      throw new Error(`Similarity search failed: ${error.message || 'Unknown error'}`);
    }
  }

  async deleteCollection(): Promise<void> {
    if (!this.client) {
      throw new Error('ChromaDB client not initialized');
    }

    try {
      await this.client.deleteCollection({
        name: this.config.collectionName,
      });
      
      this.collection = null;
      console.log(`🗑️ Deleted collection: ${this.config.collectionName}`);
    } catch (error: any) {
      console.error('Error deleting collection:', error);
      throw new Error(`Failed to delete collection: ${error.message || 'Unknown error'}`);
    }
  }

  async getCollectionInfo(): Promise<CollectionInfo> {
    if (!this.collection) {
      throw new Error('Vector store not initialized. Call initialize() first.');
    }

    try {
      const count = await this.collection.count();
      
      return {
        name: this.config.collectionName,
        documentCount: count,
        totalSize: 0, // ChromaDB doesn't provide size info easily
        createdAt: new Date(), // Placeholder
        lastUpdated: new Date(),
      };
    } catch (error: any) {
      console.error('Error getting collection info:', error);
      throw new Error(`Failed to get collection info: ${error.message || 'Unknown error'}`);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.deleteCollection();
      await this.initialize();
      console.log(`🔄 Reset collection: ${this.config.collectionName}`);
    } catch (error: any) {
      console.error('Error resetting collection:', error);
      throw new Error(`Failed to reset collection: ${error.message || 'Unknown error'}`);
    }
  }
} 