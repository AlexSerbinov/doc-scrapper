import express from 'express';
import cors from 'cors';
import { DocumentationRAGPipeline } from '../core/ragPipeline.js';

const app = express();
const PORT = process.env.RAG_SERVER_PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// RAG Pipeline instance
let ragPipeline: DocumentationRAGPipeline | null = null;
let isInitialized = false;

// Initialize RAG pipeline
async function initializeRAG() {
  if (isInitialized) return;
  
  try {
    console.log('🔄 Initializing RAG pipeline...');
    ragPipeline = new DocumentationRAGPipeline();
    await ragPipeline.initialize();
    isInitialized = true;
    console.log('✅ RAG pipeline initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize RAG pipeline:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    if (!isInitialized) {
      await initializeRAG();
    }
    
    const collectionInfo = await ragPipeline!.getCollectionInfo();
    res.json({
      status: 'healthy',
      collection: collectionInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Query endpoint
app.post('/query', async (req, res) => {
  try {
    if (!isInitialized) {
      await initializeRAG();
    }
    
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }
    
    console.log(`🔍 Query: "${message}"`);
    const response = await ragPipeline!.query(message);
    
    return res.json(response);
  } catch (error: any) {
    console.error('❌ Query error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Stats endpoint
app.get('/stats', async (_req, res) => {
  try {
    if (!isInitialized) {
      await initializeRAG();
    }
    
    const collectionInfo = await ragPipeline!.getCollectionInfo();
    
    // Mock some additional stats for web app
    const stats = {
      totalDocuments: collectionInfo.documentCount,
      totalChunks: collectionInfo.documentCount, // Approximate
      averageResponseTime: 2500, // Could track this
      popularQueries: [
        "How to use AI SDK?",
        "What is streaming in AI SDK?", 
        "Computer Use examples",
        "Setting up embeddings"
      ],
      collectionInfo
    };
    
    res.json(stats);
  } catch (error: any) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Start server
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 RAG Server started on http://localhost:${PORT}`);
      console.log(`📋 Endpoints:`);
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /query  - Chat queries`);
      console.log(`   GET  /stats  - Collection stats`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

export { startServer }; 