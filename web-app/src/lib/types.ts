export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: SourceLink[];
  isStreaming?: boolean;
}

export interface SourceLink {
  title: string;
  url: string;
  excerpt: string;
  score: number;
}

export interface ChatResponse {
  content: string;
  sources: SourceLink[];
  model: string;
  tokensUsed: number;
  responseTime: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface RAGStats {
  totalDocuments: number;
  totalChunks: number;
  averageResponseTime: number;
  popularQueries: string[];
} 