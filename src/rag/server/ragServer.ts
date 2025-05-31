import express from 'express';
import cors from 'cors';
import { DocumentationRAGPipeline } from '../core/ragPipeline.js';
import { spawn } from 'child_process';
import path from 'path';

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

// Scrape endpoint - triggers the CLI scraper
app.post('/scrape', async (req, res) => {
  try {
    const { url, collectionName, format = 'markdown' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL is required'
      });
    }

    if (!collectionName) {
      return res.status(400).json({
        error: 'Collection name is required'
      });
    }
    
    console.log(`🔄 Starting scrape for: ${url}`);
    console.log(`📁 Collection: ${collectionName}`);
    
    // Get project root (relative to compiled dist location)
    const projectRoot = process.cwd();
    const scraperPath = path.join(projectRoot, 'dist', 'index.js');
    const outputDir = path.join(projectRoot, 'scraped-docs', collectionName);
    
    // Run scraper as child process
    const scraperProcess = spawn('node', [
      scraperPath,
      url,
      '--output', outputDir,
      '--format', format,
      '--verbose'
    ], {
      cwd: projectRoot,
      stdio: 'inherit'
    });

    // Wait for scraper to complete
    await new Promise<void>((resolve, reject) => {
      scraperProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Scraping completed successfully');
          resolve();
        } else {
          console.error(`❌ Scraping failed with code ${code}`);
          reject(new Error(`Scraping failed with exit code ${code}`));
        }
      });

      scraperProcess.on('error', (error) => {
        console.error('❌ Scraper process error:', error);
        reject(error);
      });
    });

    return res.json({
      success: true,
      message: 'Scraping completed successfully',
      collectionName,
      outputDir
    });

  } catch (error: any) {
    console.error('❌ Scrape error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Index endpoint - indexes scraped documents
app.post('/index', async (req, res) => {
  try {
    if (!isInitialized) {
      await initializeRAG();
    }

    const { collectionName, reset = false } = req.body;
    
    if (!collectionName) {
      return res.status(400).json({
        error: 'Collection name is required'
      });
    }

    console.log(`🔄 Starting indexing for collection: ${collectionName}`);
    
    const projectRoot = process.cwd();
    const documentsPath = path.join(projectRoot, 'scraped-docs', collectionName);
    
    // Reset collection if requested
    if (reset) {
      console.log('🧹 Resetting collection...');
      await ragPipeline!.resetIndex();
    }

    // Index documents
    await ragPipeline!.indexDocuments(documentsPath, (status) => {
      console.log(`📊 Progress: ${status.progress}% - ${status.message}`);
    });

    const collectionInfo = await ragPipeline!.getCollectionInfo();
    
    return res.json({
      success: true,
      message: 'Indexing completed successfully',
      collectionName,
      documentsPath,
      collectionInfo
    });

  } catch (error: any) {
    console.error('❌ Index error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Query endpoint (existing - but with better error handling)
app.post('/query', async (req, res) => {
  try {
    if (!isInitialized) {
      await initializeRAG();
    }
    
    const { message, collectionName } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }
    
    // Switch to specific collection if provided
    if (collectionName && collectionName !== ragPipeline!.getCurrentCollectionName()) {
      console.log(`🔄 Switching to collection: ${collectionName}`);
      await ragPipeline!.switchCollection(collectionName);
    }
    
    console.log(`🔍 Query: "${message}" in collection: ${ragPipeline!.getCurrentCollectionName()}`);
    const response = await ragPipeline!.query(message);
    
    return res.json(response);
  } catch (error: any) {
    console.error('❌ Query error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Chat endpoint (for web app compatibility)
app.post('/chat', async (req, res) => {
  try {
    if (!isInitialized) {
      await initializeRAG();
    }
    
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }
    
    console.log(`💬 Chat (${sessionId || 'no-session'}): "${message}"`);
    const response = await ragPipeline!.chat(message, sessionId);
    
    return res.json(response);
  } catch (error: any) {
    console.error('❌ Chat error:', error);
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

// NEW: List all available collections
app.get('/collections', async (_req, res) => {
  try {
    if (!isInitialized) {
      await initializeRAG();
    }
    
    const collections = await ragPipeline!.listCollections();
    
    // Group collections by project (extract project name from collection name)
    const groupedCollections = collections.reduce((groups: any, collection) => {
      // Extract project name (everything before the first hyphen or the whole name)
      const projectName = collection.name.split('-')[0] || 'Other';
      
      if (!groups[projectName]) {
        groups[projectName] = [];
      }
      
      groups[projectName].push(collection);
      return groups;
    }, {});

    return res.json({
      collections: collections,
      groupedCollections: groupedCollections,
      currentCollection: ragPipeline!.getCurrentCollectionName()
    });
  } catch (error: any) {
    console.error('❌ Collections error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// NEW: Switch active collection
app.post('/switch-collection', async (req, res) => {
  try {
    if (!isInitialized) {
      await initializeRAG();
    }
    
    const { collectionName } = req.body;
    
    if (!collectionName) {
      return res.status(400).json({
        error: 'Collection name is required'
      });
    }
    
    console.log(`🔄 Switching to collection: ${collectionName}`);
    await ragPipeline!.switchCollection(collectionName);
    
    return res.json({
      success: true,
      message: `Switched to collection: ${collectionName}`,
      currentCollection: ragPipeline!.getCurrentCollectionName()
    });
  } catch (error: any) {
    console.error('❌ Switch collection error:', error);
    return res.status(500).json({
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
      console.log(`   GET  /health    - Health check`);
      console.log(`   POST /scrape    - Scrape documentation`);
      console.log(`   POST /index     - Index scraped documents`);
      console.log(`   POST /query     - RAG queries`);
      console.log(`   POST /chat      - Chat interface`);
      console.log(`   GET  /stats     - Collection stats`);
      console.log(`   GET  /collections - List collections`);
      console.log(`   POST /switch-collection - Switch collection`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

export { startServer }; 