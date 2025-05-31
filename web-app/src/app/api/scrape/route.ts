import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { updateSessionStatus, getSessionStatus } from '@/lib/sessionStatus';
import { getScraperPath, getRagIndexerPath, getScrapedDocsPath, getProjectRoot, validatePaths } from '@/lib/paths';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root (parent directory of web-app) ⭐ NEW
const rootDir = path.resolve(process.cwd(), '..');
const envPath = path.join(rootDir, '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

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

    // ⭐ GLOBAL SESSION START TIME - будемо рахувати від початку сесії
    const sessionStartTime = Date.now();

    updateSessionStatus(sessionId, {
      status: 'starting',
      progress: 20,
      message: 'Запускаємо scraper процес...',
      statistics: {
        sessionStartTime, // ⭐ NEW: зберігаємо час початку сесії
        elapsedTime: 0
      }
    });

    // Enhanced scraper arguments with verbose output
    const concurrency = process.env.SCRAPER_CONCURRENCY || '25';
    const delay = process.env.SCRAPER_DELAY || '10';
    
    console.log(`[${sessionId}] 🔧 Scraper config - Concurrency: ${concurrency}, Delay: ${delay}ms`);
    
    const scraperArgs = [
      scraperPath,
      url,
      '--output', outputPath,
      '--format', 'markdown',
      '--verbose', // ⭐ Always enable verbose for detailed output
      '--concurrency', concurrency, // ⭐ Use env var with fallback
      '--delay', delay // ⭐ Use env var with fallback
    ];

    // Add max-pages limit if specified in environment ⭐ NEW
    if (process.env.SCRAPER_MAX_PAGES && process.env.SCRAPER_MAX_PAGES !== '0') {
      scraperArgs.push('--max-pages', process.env.SCRAPER_MAX_PAGES);
    }

    const scraperChild = spawn('node', scraperArgs, {
      cwd: projectRoot,
      stdio: 'pipe'
    });

    // Enhanced stdout parsing for detailed statistics ⭐ NEW
    scraperChild.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`[${sessionId}] Scraper stdout:`, output.trim());
      
      // ⭐ FIXED: Use global session time instead of process time
      const globalElapsedTime = (Date.now() - sessionStartTime) / 1000;
      
      // Parse different types of scraper output
      parseScraperOutput(sessionId, output, globalElapsedTime);
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
      // ⭐ FIXED: Use global session time
      const globalElapsedTime = (Date.now() - sessionStartTime) / 1000;
      
      if (code === 0) {
        console.log(`[${sessionId}] ✅ Scraping completed successfully in ${globalElapsedTime.toFixed(1)}s`);
        
        // ⭐ IMPROVED: Ensure final scraping stats are consistent
        const currentStatus = getSessionStatus(sessionId);
        const stats = currentStatus?.statistics || {};
        
        // Force final update to ensure consistency
        updateSessionStatus(sessionId, {
          status: 'scraping',
          progress: 74, // Final scraping progress before indexing
          message: 'Скрапінг завершено успішно! Переходимо до індексації...',
          statistics: {
            ...stats,
            // ⭐ FIXED: Ensure consistent final counts
            urlsProcessed: stats.urlsTotal || stats.successfulPages || stats.urlsProcessed,
            elapsedTime: globalElapsedTime // ⭐ Global time
          }
        });
        
        // Start RAG indexing with session time context
        setTimeout(() => {
          updateSessionStatus(sessionId, {
            status: 'indexing',
            currentStep: 'indexing',
            progress: 75,
            message: 'Створюємо AI індекс для швидкого пошуку...',
            statistics: {
              elapsedTime: globalElapsedTime // ⭐ Continue global time
            }
          });

          startRAGIndexing(sessionId, outputPath, collectionName, ragIndexPath, projectRoot, sessionStartTime);
        }, 500); // Small delay to ensure UI updates
        
      } else {
        console.error(`[${sessionId}] ❌ Scraping failed with code ${code}`);
        updateSessionStatus(sessionId, {
          status: 'error',
          progress: 25,
          message: 'Помилка під час скрапінгу документації',
          error: `Scraper failed with exit code ${code}`,
          statistics: {
            elapsedTime: globalElapsedTime // ⭐ Global time
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
    // Parse JSON structured output ⭐ NEW
    if (line.includes('SCRAPING_STATS:')) {
      try {
        const jsonMatch = line.match(/SCRAPING_STATS:\s*(.+)$/);
        if (jsonMatch) {
          const stats = JSON.parse(jsonMatch[1]);
          updateSessionStatus(sessionId, {
            status: 'scraping',
            progress: 25,
            message: `Знайшли ${stats.urlsFound} сторінок для скрапінгу...`,
            statistics: {
              urlsFound: stats.urlsFound,
              urlsTotal: stats.urlsTotal || stats.urlsFound, // ⭐ FIXED: Ensure consistent totals
              concurrency: stats.concurrency,
              rateLimitMs: stats.rateLimitMs,
              elapsedTime
            }
          });
        }
      } catch (error) {
        console.error(`[${sessionId}] Error parsing SCRAPING_STATS:`, error);
      }
    }
    
    // Parse progress updates ⭐ NEW
    if (line.includes('SCRAPING_PROGRESS:')) {
      try {
        const jsonMatch = line.match(/SCRAPING_PROGRESS:\s*(.+)$/);
        if (jsonMatch) {
          const progress = JSON.parse(jsonMatch[1]);
          
          const scrapingRate = elapsedTime > 0 ? progress.current / elapsedTime : 0;
          const estimatedTimeRemaining = scrapingRate > 0 ? (progress.total - progress.current) / scrapingRate : 0;
          
          // ⭐ IMPROVED: Ensure progress smoothly scales and doesn't get stuck
          const finalProgress = Math.min(25 + (progress.percentage * 0.48), 73); // Scale to 25-73% range, cap at 73
          
          updateSessionStatus(sessionId, {
            status: 'scraping',
            progress: finalProgress,
            message: `Скрапимо контент: ${progress.current}/${progress.total} сторінок (${progress.percentage}%)`,
            statistics: {
              urlsProcessed: progress.current,
              urlsTotal: progress.total, // ⭐ FIXED: Always use the same total from progress
              currentUrl: progress.currentUrl,
              scrapingRate: Number(scrapingRate.toFixed(2)),
              estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
              successfulPages: progress.status === 'success' ? progress.current : undefined,
              failedPages: progress.status === 'error' ? 1 : undefined,
              elapsedTime
            }
          });
        }
      } catch (error) {
        console.error(`[${sessionId}] Error parsing SCRAPING_PROGRESS:`, error);
      }
    }
    
    // Parse completion stats ⭐ NEW
    if (line.includes('SCRAPING_COMPLETE:')) {
      try {
        const jsonMatch = line.match(/SCRAPING_COMPLETE:\s*(.+)$/);
        if (jsonMatch) {
          const completion = JSON.parse(jsonMatch[1]);
          updateSessionStatus(sessionId, {
            status: 'scraping',
            progress: 74, // ⭐ Final scraping progress before indexing
            message: `Скрапінг завершено: ${completion.successfulPages} сторінок успішно`,
            statistics: {
              successfulPages: completion.successfulPages,
              failedPages: completion.failedPages,
              totalBytes: completion.totalBytes,
              urlsProcessed: completion.successfulPages,
              urlsTotal: completion.successfulPages, // ⭐ FIXED: Set total to actual successful pages
              elapsedTime
            }
          });
        }
      } catch (error) {
        console.error(`[${sessionId}] Error parsing SCRAPING_COMPLETE:`, error);
      }
    }
    
    // Legacy parsing for backwards compatibility
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
  }
}

function parseScraperErrors(sessionId: string, output: string) {
  // Count failed pages
  if (output.includes('Error') || output.includes('Failed')) {
    // This is a basic implementation - could be enhanced to count specific failures
    updateSessionStatus(sessionId, {
      statistics: {
        failedPages: (getSessionStatus(sessionId)?.statistics?.failedPages || 0) + 1
      }
    });
  }
}

function startRAGIndexing(sessionId: string, outputPath: string, collectionName: string, ragIndexPath: string, projectRoot: string, sessionStartTime: number): void {
  const ragChild = spawn('node', [ragIndexPath, outputPath, '--verbose'], {
    cwd: projectRoot,
    stdio: 'pipe',
    env: {
      ...process.env,
      COLLECTION_NAME: collectionName
    }
  });

  // Enhanced RAG output parsing ⭐ NEW
  ragChild.stdout?.on('data', (data) => {
    const output = data.toString();
    console.log(`[${sessionId}] RAG stdout:`, output.trim());
    
    // ⭐ FIXED: Use global session time instead of indexing start time
    const globalElapsedTime = (Date.now() - sessionStartTime) / 1000;
    parseRAGOutput(sessionId, output, globalElapsedTime);
  });

  ragChild.stderr?.on('data', (data) => {
    console.log(`[${sessionId}] RAG stderr:`, data.toString().trim());
  });

  ragChild.on('error', (error) => {
    console.error(`[${sessionId}] RAG indexing error:`, error);
    const globalElapsedTime = (Date.now() - sessionStartTime) / 1000;
    updateSessionStatus(sessionId, {
      status: 'error',
      progress: 80,
      message: 'Помилка під час створення AI індексу',
      error: error.message,
      statistics: {
        elapsedTime: globalElapsedTime // ⭐ Global time
      }
    });
  });

  ragChild.on('close', (code) => {
    const globalElapsedTime = (Date.now() - sessionStartTime) / 1000;
    
    if (code === 0) {
      console.log(`[${sessionId}] ✅ RAG indexing completed successfully in ${globalElapsedTime.toFixed(1)}s`);
      
      const chatUrl = `/demo/${sessionId}`;
      updateSessionStatus(sessionId, {
        status: 'completed',
        currentStep: 'completed',
        progress: 100,
        message: 'AI-помічник готовий до роботи!',
        chatUrl,
        statistics: {
          elapsedTime: globalElapsedTime // ⭐ Final global time
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
          elapsedTime: globalElapsedTime // ⭐ Global time
        }
      });
    }
  });
}

// Enhanced RAG output parsing ⭐ NEW  
function parseRAGOutput(sessionId: string, output: string, elapsedTime: number) {
  const lines = output.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Parse JSON progress from RAG CLI ⭐ NEW
    if (line.includes('RAG_PROGRESS:')) {
      try {
        const jsonMatch = line.match(/RAG_PROGRESS:\s*(.+)$/);
        if (jsonMatch) {
          const progressData = JSON.parse(jsonMatch[1]);
          
          // Extract chunk progress from message ⭐ NEW
          let chunksProcessed = 0;
          let chunksTotal = 0;
          const chunkMatch = progressData.message.match(/(\d+)\/(\d+)/);
          if (chunkMatch) {
            chunksProcessed = parseInt(chunkMatch[1]);
            chunksTotal = parseInt(chunkMatch[2]);
          }
          
          // Map RAG stages to progress percentages and messages
          let progress = progressData.progress; // Use actual progress from CLI
          let message = progressData.message;
          
          switch (progressData.stage) {
            case 'loading':
              progress = 76;
              message = `Завантажили ${progressData.totalDocuments} документів для індексації...`;
              break;
            case 'chunking':
              message = `Створюємо семантичні блоки: ${progressData.progress}%`;
              break;
            case 'embedding':
              message = `Генеруємо векторні представлення: ${progressData.progress}%`;
              break;
            case 'indexing':
              // Keep the detailed message from CLI ⭐ NEW
              if (chunksProcessed > 0 && chunksTotal > 0) {
                const chunkPercent = Math.round((chunksProcessed / chunksTotal) * 100);
                message = `Індексуємо chunks: ${chunksProcessed}/${chunksTotal} (${chunkPercent}%)`;
                
                // ⭐ IMPROVED: Ensure progress goes to 99% when chunks are nearly complete
                if (chunkPercent >= 95) {
                  progress = 99;
                }
              }
              break;
            case 'complete':
              progress = 99;
              message = 'Завершуємо індексацію...';
              break;
          }
          
          updateSessionStatus(sessionId, {
            progress: Math.round(progress),
            message,
            statistics: {
              documentsProcessed: progressData.documentsProcessed,
              documentsTotal: progressData.totalDocuments,
              // ⭐ NEW: Add chunks statistics
              embeddingsProcessed: chunksProcessed || undefined,
              embeddingsTotal: chunksTotal || undefined,
              elapsedTime // ⭐ Global session time
            }
          });
        }
      } catch (error) {
        console.error(`[${sessionId}] Error parsing RAG_PROGRESS:`, error);
      }
    }
    
    // Parse completion data ⭐ NEW
    if (line.includes('RAG_COMPLETE:')) {
      try {
        const jsonMatch = line.match(/RAG_COMPLETE:\s*(.+)$/);
        if (jsonMatch) {
          const completionData = JSON.parse(jsonMatch[1]);
          updateSessionStatus(sessionId, {
            progress: 100,
            message: `Проіндексували ${completionData.chunksIndexed} блоків у векторній базі`,
            statistics: {
              embeddingsGenerated: completionData.chunksIndexed,
              elapsedTime // ⭐ Global session time
            }
          });
        }
      } catch (error) {
        console.error(`[${sessionId}] Error parsing RAG_COMPLETE:`, error);
      }
    }
    
    // Legacy parsing for backwards compatibility (keep for fallback)
    if (line.includes('Loaded') && line.includes('documents')) {
      const match = line.match(/Loaded\s+(\d+)\s+documents/i);
      if (match) {
        const documentsTotal = parseInt(match[1]);
        updateSessionStatus(sessionId, {
          progress: 76,
          message: `Завантажили ${documentsTotal} документів для індексації...`,
          statistics: {
            documentsTotal,
            documentsProcessed: 0,
            elapsedTime // ⭐ Global session time
          }
        });
      }
    }
    
    // Parse created chunks info ⭐ NEW
    if (line.includes('Created') && line.includes('chunks')) {
      const match = line.match(/Created\s+(\d+)\s+chunks/i);
      if (match) {
        const chunksCreated = parseInt(match[1]);
        updateSessionStatus(sessionId, {
          statistics: {
            chunksCreated,
            elapsedTime // ⭐ Global session time
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
            elapsedTime // ⭐ Global session time
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