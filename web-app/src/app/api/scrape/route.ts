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

export async function POST(request: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  try {
    const body: ScrapeRequest = await request.json();
    const { url, collectionName } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({
        success: false,
        sessionId: '',
        collectionName: '',
        message: 'URL is required',
        error: 'URL is required and must be a string'
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({
        success: false,
        sessionId: '',
        collectionName: '',
        message: 'Invalid URL format',
        error: 'Invalid URL format'
      }, { status: 400 });
    }

    // Check if system is ready
    const pathValidation = validatePaths();
    if (!pathValidation.valid) {
      return NextResponse.json({
        success: false,
        sessionId: '',
        collectionName: '',
        message: 'System not ready',
        error: 'System not ready. Please build the project first.'
      }, { status: 500 });
    }

    // Generate session ID and collection name
    const sessionId = generateSessionId(url);
    const finalCollectionName = collectionName || generateCollectionName(url);

    // Initialize session with enhanced statistics
    const startTime = new Date().toISOString();
    updateSessionStatus(sessionId, {
      sessionId,
      status: 'starting',
      currentStep: 'initializing',
      progress: 10,
      message: 'Ініціалізуємо процес скрапінгу...',
      url,
      collectionName: finalCollectionName,
      statistics: {
        startTime,
        elapsedTime: 0,
        urlsFound: 0,
        urlsProcessed: 0,
        urlsTotal: 0,
        successfulPages: 0,
        failedPages: 0,
        totalBytes: 0,
        scrapingRate: 0,
        estimatedTimeRemaining: 0
      }
    });

    // Start the scraping process asynchronously
    startScrapingProcess(url, finalCollectionName, sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      collectionName: finalCollectionName,
      message: 'Scraping process started. Use session ID to track progress.'
    });

  } catch (error: unknown) {
    console.error('POST /api/scrape error:', error);
    return NextResponse.json({
      success: false,
      sessionId: '',
      collectionName: '',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

    console.log(`[${sessionId}] Starting scraping process for ${url}`);
    console.log(`[${sessionId}] Collection: ${collectionName}`);
    console.log(`[${sessionId}] Output: ${outputPath}`);

    updateSessionStatus(sessionId, {
      status: 'starting',
      progress: 20,
      message: 'Запускаємо scraper процес...',
      statistics: {
        elapsedTime: 0
      }
    });

    // Enhanced scraper arguments with verbose output
    const scraperChild = spawn('node', [
      scraperPath,
      url,
      '--output', outputPath,
      '--format', 'markdown',
      '--verbose', // ⭐ Always enable verbose for detailed output
      '--concurrency', '5',
      '--delay', '1000'
    ], {
      cwd: projectRoot,
      stdio: 'pipe'
    });

    const processStartTime = Date.now();

    // Enhanced stdout parsing for detailed statistics ⭐ NEW
    scraperChild.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`[${sessionId}] Scraper stdout:`, output.trim());
      
      const elapsedTime = (Date.now() - processStartTime) / 1000;
      
      // Parse different types of scraper output
      parseScraperOutput(sessionId, output, elapsedTime);
    });

    scraperChild.stderr?.on('data', (data) => {
      const output = data.toString();
      console.log(`[${sessionId}] Scraper stderr:`, output.trim());
      
      // Parse errors for useful information
      parseScraperErrors(sessionId, output);
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

    scraperChild.on('close', (code) => {
      const elapsedTime = (Date.now() - processStartTime) / 1000;
      
      if (code === 0) {
        console.log(`[${sessionId}] ✅ Scraping completed successfully in ${elapsedTime.toFixed(1)}s`);
        
        // Start RAG indexing
        updateSessionStatus(sessionId, {
          status: 'indexing',
          currentStep: 'indexing',
          progress: 75,
          message: 'Створюємо AI індекс для швидкого пошуку...',
          statistics: {
            elapsedTime
          }
        });

        startRAGIndexing(sessionId, outputPath, collectionName, ragIndexPath, projectRoot);
      } else {
        console.error(`[${sessionId}] ❌ Scraping failed with code ${code}`);
        updateSessionStatus(sessionId, {
          status: 'error',
          progress: 25,
          message: 'Помилка під час скрапінгу документації',
          error: `Scraper failed with exit code ${code}`,
          statistics: {
            elapsedTime
          }
        });
      }
    });

  } catch (error) {
    console.error(`[${sessionId}] Error starting scraping process:`, error);
    updateSessionStatus(sessionId, {
      status: 'error',
      progress: 15,
      message: 'Помилка ініціалізації процесу',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Enhanced output parsing functions ⭐ NEW
function parseScraperOutput(sessionId: string, output: string, elapsedTime: number) {
  const lines = output.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Parse URL discovery
    if (line.includes('Found') && line.includes('URLs')) {
      const match = line.match(/Found\s+(\d+)\s+URLs/i);
      if (match) {
        const urlsFound = parseInt(match[1]);
        updateSessionStatus(sessionId, {
          status: 'scraping',
          progress: 30,
          message: `Знайшли ${urlsFound} сторінок для скрапінгу...`,
          statistics: {
            urlsFound,
            urlsTotal: urlsFound,
            elapsedTime
          }
        });
      }
    }
    
    // Parse progress bar updates - looking for patterns like "Progress |████| 45% | 23/50"
    if (line.includes('Progress |') && line.includes('%')) {
      const progressMatch = line.match(/Progress\s+\|[█▉▊▋▌▍▎▏▐░▒▓█]*\|\s+(\d+)%\s+\|\s+(\d+)\/(\d+)/);
      if (progressMatch) {
        const percentage = parseInt(progressMatch[1]);
        const current = parseInt(progressMatch[2]);
        const total = parseInt(progressMatch[3]);
        
        const scrapingRate = elapsedTime > 0 ? current / elapsedTime : 0;
        const estimatedTimeRemaining = scrapingRate > 0 ? (total - current) / scrapingRate : 0;
        
        updateSessionStatus(sessionId, {
          status: 'scraping',
          progress: 30 + (percentage * 0.4), // Scale to 30-70% range
          message: `Скрапимо контент: ${current}/${total} сторінок (${percentage}%)`,
          statistics: {
            urlsProcessed: current,
            urlsTotal: total,
            successfulPages: current, // Approximate
            scrapingRate: Number(scrapingRate.toFixed(2)),
            estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
            elapsedTime
          }
        });
      }
    }
    
    // Parse current URL being processed
    if (line.includes('Processing:') || line.includes('Scraping:')) {
      const urlMatch = line.match(/(?:Processing|Scraping):\s*(.+?)(?:\s|$)/);
      if (urlMatch) {
        const currentUrl = urlMatch[1];
        updateSessionStatus(sessionId, {
          statistics: {
            currentUrl,
            elapsedTime
          }
        });
      }
    }
    
    // Parse completion statistics
    if (line.includes('Successfully scraped') || line.includes('completed')) {
      const successMatch = line.match(/(\d+)\s+(?:pages?|files?|documents?)/i);
      if (successMatch) {
        const successfulPages = parseInt(successMatch[1]);
        updateSessionStatus(sessionId, {
          statistics: {
            successfulPages,
            elapsedTime
          }
        });
      }
    }
    
    // Parse file size information
    if (line.includes('bytes') || line.includes('KB') || line.includes('MB')) {
      const sizeMatch = line.match(/(\d+(?:\.\d+)?)\s*(bytes?|KB|MB|GB)/i);
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2].toUpperCase();
        
        let totalBytes = size;
        if (unit.includes('KB')) totalBytes *= 1024;
        else if (unit.includes('MB')) totalBytes *= 1024 * 1024;
        else if (unit.includes('GB')) totalBytes *= 1024 * 1024 * 1024;
        
        updateSessionStatus(sessionId, {
          statistics: {
            totalBytes: Math.round(totalBytes),
            elapsedTime
          }
        });
      }
    }
  }
}

function parseScraperErrors(sessionId: string, output: string) {
  // Count failed pages
  if (output.includes('Error') || output.includes('Failed')) {
    // This is a basic implementation - could be enhanced to count specific failures
    updateSessionStatus(sessionId, {
      statistics: {
        failedPages: (updateSessionStatus(sessionId, {}).statistics?.failedPages || 0) + 1
      }
    });
  }
}

function startRAGIndexing(sessionId: string, outputPath: string, collectionName: string, ragIndexPath: string, projectRoot: string): void {
  const ragChild = spawn('node', [ragIndexPath, outputPath, '--verbose'], {
    cwd: projectRoot,
    stdio: 'pipe',
    env: {
      ...process.env,
      COLLECTION_NAME: collectionName
    }
  });

  const indexingStartTime = Date.now();

  // Enhanced RAG output parsing ⭐ NEW
  ragChild.stdout?.on('data', (data) => {
    const output = data.toString();
    console.log(`[${sessionId}] RAG stdout:`, output.trim());
    
    const elapsedTime = (Date.now() - indexingStartTime) / 1000;
    parseRAGOutput(sessionId, output, elapsedTime);
  });

  ragChild.stderr?.on('data', (data) => {
    console.log(`[${sessionId}] RAG stderr:`, data.toString().trim());
  });

  ragChild.on('error', (error) => {
    console.error(`[${sessionId}] RAG indexing error:`, error);
    updateSessionStatus(sessionId, {
      status: 'error',
      progress: 80,
      message: 'Помилка під час створення AI індексу',
      error: error.message
    });
  });

  ragChild.on('close', (code) => {
    const totalElapsedTime = (Date.now() - indexingStartTime) / 1000;
    
    if (code === 0) {
      console.log(`[${sessionId}] ✅ RAG indexing completed successfully in ${totalElapsedTime.toFixed(1)}s`);
      
      const chatUrl = `/demo/${sessionId}`;
      updateSessionStatus(sessionId, {
        status: 'completed',
        currentStep: 'completed',
        progress: 100,
        message: 'AI-помічник готовий до роботи!',
        chatUrl,
        statistics: {
          elapsedTime: totalElapsedTime
        }
      });
    } else {
      console.error(`[${sessionId}] ❌ RAG indexing failed with code ${code}`);
      updateSessionStatus(sessionId, {
        status: 'error',
        progress: 85,
        message: 'Помилка під час індексації в AI базу даних',
        error: `RAG indexing failed with exit code ${code}`,
        statistics: {
          elapsedTime: totalElapsedTime
        }
      });
    }
  });
}

// Enhanced RAG output parsing ⭐ NEW  
function parseRAGOutput(sessionId: string, output: string, elapsedTime: number) {
  const lines = output.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Parse document loading
    if (line.includes('Loaded') && line.includes('documents')) {
      const match = line.match(/Loaded\s+(\d+)\s+documents/i);
      if (match) {
        const documentsTotal = parseInt(match[1]);
        updateSessionStatus(sessionId, {
          progress: 78,
          message: `Завантажили ${documentsTotal} документів для індексації...`,
          statistics: {
            documentsTotal,
            elapsedTime
          }
        });
      }
    }
    
    // Parse chunking progress
    if (line.includes('Created') && line.includes('chunks')) {
      const match = line.match(/Created\s+(\d+)\s+chunks/i);
      if (match) {
        const chunksCreated = parseInt(match[1]);
        updateSessionStatus(sessionId, {
          progress: 85,
          message: `Створили ${chunksCreated} семантичних блоків...`,
          statistics: {
            chunksCreated,
            elapsedTime
          }
        });
      }
    }
    
    // Parse average chunk size
    if (line.includes('Average chunk size')) {
      const match = line.match(/Average chunk size:\s+(\d+)\s+tokens/i);
      if (match) {
        const averageChunkSize = parseInt(match[1]);
        updateSessionStatus(sessionId, {
          statistics: {
            averageChunkSize,
            elapsedTime
          }
        });
      }
    }
    
    // Parse indexing completion
    if (line.includes('chunks indexed') || line.includes('Total in store')) {
      const match = line.match(/(\d+)\s+(?:chunks indexed|Total in store)/i);
      if (match) {
        const embeddingsGenerated = parseInt(match[1]);
        updateSessionStatus(sessionId, {
          progress: 95,
          message: `Проіндексували ${embeddingsGenerated} блоків у векторній базі...`,
          statistics: {
            embeddingsGenerated,
            elapsedTime
          }
        });
      }
    }
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Scrape API is running',
    timestamp: new Date().toISOString()
  });
} 