// RAG System Types

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
  embedding?: number[];
}

export interface ChunkMetadata {
  sourceUrl: string;
  title: string;
  section?: string;
  filePath: string;
  chunkIndex: number;
  tokenCount: number;
  createdAt: Date;
}

export interface EmbeddingConfig {
  provider: 'openai' | 'cohere';
  model: string;
  dimensions?: number;
}

export interface ChunkingConfig {
  chunkSize: number;
  chunkOverlap: number;
  strategy: 'recursive' | 'markdown' | 'sentence' | 'universal';
}

export interface VectorStoreConfig {
  provider: 'chroma' | 'pinecone' | 'faiss';
  connectionString?: string;
  collectionName: string;
}

export interface RetrievalConfig {
  k: number; // number of chunks to retrieve
  threshold?: number; // similarity threshold
  method: 'semantic' | 'hybrid' | 'keyword';
}

export interface RAGConfig {
  embedding: EmbeddingConfig;
  chunking: ChunkingConfig;
  vectorStore: VectorStoreConfig;
  retrieval: RetrievalConfig;
  llm: LLMConfig;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  temperature: number;
  maxTokens?: number;
}

export interface RetrievalResult {
  chunks: DocumentChunk[];
  scores: number[];
  query: string;
  retrievalMethod: 'semantic' | 'hybrid' | 'keyword';
  totalTime: number;
}

export interface ChatResponse {
  content: string;
  sources: SourceReference[];
  model: string;
  tokensUsed: number;
  responseTime: number;
}

export interface SourceReference {
  title: string;
  url: string;
  excerpt: string;
  score: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: SourceReference[];
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
}

// Vector Store interfaces
export interface VectorStore {
  initialize(): Promise<void>;
  addDocuments(chunks: DocumentChunk[]): Promise<void>;
  similaritySearch(query: string, k: number): Promise<RetrievalResult>;
  deleteCollection(): Promise<void>;
  getCollectionInfo(): Promise<CollectionInfo>;
}

export interface CollectionInfo {
  name: string;
  documentCount: number;
  totalSize: number;
  createdAt: Date;
  lastUpdated: Date;
}

// Embedding Service interface
export interface EmbeddingService {
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  generateEmbedding(text: string): Promise<number[]>;
  getDimensions(): number;
  getModel(): string;
}

// Chunking Strategy interface
export interface ChunkingStrategy {
  chunkDocuments(documents: Document[]): Promise<DocumentChunk[]>;
}

export interface Document {
  content: string;
  metadata: {
    title: string;
    url: string;
    filePath: string;
  };
}

// RAG Pipeline interface
export interface RAGPipeline {
  indexDocuments(documentsPath: string): Promise<void>;
  query(question: string): Promise<ChatResponse>;
  chat(message: string, sessionId?: string): Promise<ChatResponse>;
}

// Processing status
export interface ProcessingStatus {
  stage: 'loading' | 'chunking' | 'embedding' | 'indexing' | 'complete';
  progress: number;
  message: string;
  documentsProcessed: number;
  totalDocuments: number;
}

export type ProgressCallback = (status: ProcessingStatus) => void; 