import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { updateSessionStatus } from '@/lib/sessionStatus';
import { getScraperPath, getRagIndexerPath, getScrapedDocsPath, getProjectRoot, validatePaths } from '@/lib/paths';

interface ScrapeRequest {
  url: string;
  collectionName?: string;
}

interface ScrapeResponse {
  success: boolean;
  sessionId: string;
  collectionName: string;
  message: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequest = await request.json();
    const { url, collectionName } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate that compiled files exist
    const pathValidation = validatePaths();
    if (!pathValidation.valid) {
      return NextResponse.json(
        { 
          error: 'System not ready. Please build the project first.',
          details: pathValidation.errors
        },
        { status: 500 }
      );
    }

    // Generate session ID and collection name
    const sessionId = generateSessionId(url);
    const finalCollectionName = collectionName || generateCollectionName(url);

    console.log(`[${sessionId}] New scraping request:`, { url, collectionName: finalCollectionName });

    // Initialize session status
    updateSessionStatus(sessionId, {
      sessionId,
      status: 'starting',
      currentStep: 'initializing',
      progress: 10,
      message: 'Ініціалізуємо процес скрапінгу...',
      url,
      collectionName: finalCollectionName
    });

    // Start the scraping process asynchronously
    startScrapingProcess(url, finalCollectionName, sessionId);

    // Return immediate response with session ID
    const response: ScrapeResponse = {
      success: true,
      sessionId,
      collectionName: finalCollectionName,
      message: 'Scraping process started. Use session ID to track progress.'
    };

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('POST /api/scrape error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSessionId(url: string): string {
  const timestamp = Date.now();
  const urlHash = url.replace(/[^\w]/g, '').slice(-8);
  return `${timestamp}-${urlHash}`;
}

function generateCollectionName(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace(/^www\./, '');
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    const name = pathParts.length > 0 
      ? `${domain}-${pathParts[0]}`
      : domain;
    
    // Clean name for ChromaDB (alphanumeric + hyphens only)
    return name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  } catch {
    return 'custom-docs';
  }
}

function startScrapingProcess(url: string, collectionName: string, sessionId: string): void {
  try {
    const projectRoot = getProjectRoot();
    const scraperPath = getScraperPath();
    const ragIndexPath = getRagIndexerPath();
    const outputPath = getScrapedDocsPath(collectionName);
    
    console.log(`[${sessionId}] Starting scraping process...`);
    console.log(`[${sessionId}] Project root: ${projectRoot}`);
    console.log(`[${sessionId}] Scraper path: ${scraperPath}`);
    console.log(`[${sessionId}] Output path: ${outputPath}`);
    console.log(`[${sessionId}] URL: ${url}`);
    console.log(`[${sessionId}] Collection: ${collectionName}`);

    // Update status: Starting scraping
    updateSessionStatus(sessionId, {
      status: 'scraping',
      currentStep: 'scraping',
      progress: 25,
      message: `Аналізуємо структуру ${new URL(url).hostname}...`
    });

    // Step 1: Run scraper
    const scraperChild = spawn('node', [
      scraperPath,
      url,
      '--output', outputPath,
      '--format', 'markdown',
      '--verbose'
    ], {
      cwd: projectRoot,
      stdio: 'pipe'
    });
    
    scraperChild.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`[${sessionId}] Scraper stdout:`, output.trim());
      
      // Update progress based on scraper output
      if (output.includes('Starting scrape')) {
        updateSessionStatus(sessionId, {
          status: 'scraping',
          progress: 30,
          message: 'Запускаємо scraper...'
        });
      } else if (output.includes('Found') && output.includes('URLs')) {
        updateSessionStatus(sessionId, {
          status: 'scraping',
          progress: 40,
          message: 'Знайшли сторінки для скрапінгу...'
        });
      } else if (output.includes('Processing')) {
        updateSessionStatus(sessionId, {
          status: 'scraping',
          progress: 60,
          message: 'Скрапимо контент сторінок...'
        });
      }
    });

    scraperChild.stderr?.on('data', (data) => {
      console.log(`[${sessionId}] Scraper stderr:`, data.toString().trim());
    });

    scraperChild.on('close', (code) => {
      console.log(`[${sessionId}] Scraper process closed with code: ${code}`);
      
      if (code === 0) {
        // Scraper успішно завершився, переходимо до RAG індексування
        updateSessionStatus(sessionId, {
          status: 'indexing',
          currentStep: 'indexing',
          progress: 75,
          message: 'Створюємо AI індекс для швидкого пошуку...'
        });

        // Step 2: Run RAG indexer
        const ragChild = spawn('node', [
          ragIndexPath,
          outputPath
        ], {
          cwd: projectRoot,
          stdio: 'pipe',
          env: {
            ...process.env,
            COLLECTION_NAME: collectionName
          }
        });

        ragChild.stdout?.on('data', (data) => {
          console.log(`[${sessionId}] RAG indexer stdout:`, data.toString().trim());
        });

        ragChild.stderr?.on('data', (data) => {
          console.log(`[${sessionId}] RAG indexer stderr:`, data.toString().trim());
        });

        ragChild.on('close', (ragCode) => {
          console.log(`[${sessionId}] RAG indexer closed with code: ${ragCode}`);
          
          if (ragCode === 0) {
            const chatUrl = `/demo/${sessionId}`;
            console.log(`[${sessionId}] ✅ Complete! Ready for chat at ${chatUrl}`);
            
            // Final success status
            updateSessionStatus(sessionId, {
              status: 'completed',
              currentStep: 'completed',
              progress: 100,
              message: 'AI-помічник готовий до роботи!',
              chatUrl
            });
          } else {
            console.error(`[${sessionId}] ❌ RAG indexing failed with code ${ragCode}`);
            updateSessionStatus(sessionId, {
              status: 'error',
              progress: 75,
              message: 'Помилка під час створення AI індексу',
              error: `RAG indexing failed with exit code ${ragCode}`
            });
          }
        });

        ragChild.on('error', (error) => {
          console.error(`[${sessionId}] RAG indexer error:`, error);
          updateSessionStatus(sessionId, {
            status: 'error',
            progress: 75,
            message: 'Помилка під час створення AI індексу',
            error: error.message
          });
        });

      } else {
        console.error(`[${sessionId}] ❌ Scraping failed with code ${code}`);
        updateSessionStatus(sessionId, {
          status: 'error',
          progress: 25,
          message: 'Помилка під час скрапінгу документації',
          error: `Scraper failed with exit code ${code}`
        });
      }
    });

    scraperChild.on('error', (error) => {
      console.error(`[${sessionId}] Scraper error:`, error);
      updateSessionStatus(sessionId, {
        status: 'error',
        progress: 25,
        message: 'Помилка під час запуску scraper',
        error: error.message
      });
    });
    
  } catch (error) {
    console.error(`[${sessionId}] Setup error:`, error);
    updateSessionStatus(sessionId, {
      status: 'error',
      progress: 0,
      message: 'Помилка налаштування системи',
      error: error instanceof Error ? error.message : 'Unknown setup error'
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Scrape API is running',
    timestamp: new Date().toISOString()
  });
} 