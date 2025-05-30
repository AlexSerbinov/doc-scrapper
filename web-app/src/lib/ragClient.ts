import { ChatResponse, SourceLink } from './types';

export class RAGClient {
  private static instance: RAGClient;
  private baseUrl: string;

  private constructor() {
    // RAG Server API URL (за замовчуванням localhost:8001)
    this.baseUrl = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8001';
  }

  public static getInstance(): RAGClient {
    if (!RAGClient.instance) {
      RAGClient.instance = new RAGClient();
    }
    return RAGClient.instance;
  }

  async query(message: string): Promise<ChatResponse> {
    try {
      console.log(`🔍 Querying RAG API: "${message}"`);
      
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`RAG API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      console.log(`✅ RAG response received (${data.responseTime}ms)`);
      
      return {
        content: data.content,
        sources: data.sources || [],
        model: data.model || 'unknown',
        tokensUsed: data.tokensUsed || 0,
        responseTime: data.responseTime || 0,
      };
      
    } catch (error) {
      console.error('❌ RAG query error:', error);
      
      // Fallback to mock if RAG server is down
      if (error instanceof Error && error.message.includes('fetch')) {
        console.warn('⚠️ RAG server unreachable, using mock response');
        return this.getMockResponse(message);
      }
      
      throw new Error(`Failed to query RAG system: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStats() {
    try {
      console.log('📊 Fetching RAG stats...');
      
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new Error(`Stats API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        totalDocuments: data.totalDocuments || 0,
        totalChunks: data.totalChunks || 0,
        averageResponseTime: data.averageResponseTime || 0,
        popularQueries: data.popularQueries || [],
        collectionInfo: data.collectionInfo
      };
      
    } catch (error) {
      console.error('❌ Error getting RAG stats:', error);
      
      // Fallback to mock stats
      return {
        totalDocuments: 0,
        totalChunks: 0,
        averageResponseTime: 0,
        popularQueries: ['RAG server not available'],
        collectionInfo: null
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 RAG health check...');
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        // Add timeout for health check
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        console.warn(`⚠️ RAG health check failed: ${response.status}`);
        return false;
      }

      const data = await response.json();
      console.log('✅ RAG server healthy:', data.status);
      
      return data.status === 'healthy';
      
    } catch (error) {
      console.error('❌ RAG health check failed:', error);
      return false;
    }
  }

  // Fallback mock response if RAG server is down
  private async getMockResponse(message: string): Promise<ChatResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockSources: SourceLink[] = [
      {
        title: "⚠️ RAG Server Offline - Mock Response",
        url: "#",
        excerpt: "This is a fallback response because the RAG server is not available...",
        score: 0.0
      }
    ];

    return {
      content: `⚠️ **RAG Server не доступний**\n\nВаше запитання: "${message}"\n\nЦе тестова відповідь, оскільки RAG сервер не запущено.\n\nДля роботи з реальними даними:\n1. Запустіть ChromaDB: \`chroma run --host localhost --port 8000\`\n2. Запустіть RAG сервер: \`npm run rag:server\`\n3. Перезавантажте сторінку`,
      sources: mockSources,
      model: 'mock',
      tokensUsed: 0,
      responseTime: 1000,
    };
  }
} 