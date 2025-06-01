import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

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

    // Generate unique session ID
    const sessionId = generateSessionId(url);

    // Generate collection name from URL if not provided
    const finalCollectionName = collectionName || generateCollectionName(url);

    console.log(`Starting scrape for ${url} with collection: ${finalCollectionName}`);

    // Start scraping process in background
    startScrapingProcess(url, finalCollectionName, sessionId);

    const response: ScrapeResponse = {
      success: true,
      sessionId,
      collectionName: finalCollectionName,
      message: 'Scraping started successfully'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Scrape API error:', error);
    return NextResponse.json(
      { 
        success: false,
        sessionId: '',
        collectionName: '',
        message: 'Failed to start scraping',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSessionId(url: string): string {
  const urlHash = Buffer.from(url).toString('base64').replace(/[/+=]/g, '');
  const timestamp = Date.now().toString(36);
  return `${urlHash.substring(0, 8)}-${timestamp}`;
}

function generateCollectionName(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Use domain + first path segment if exists
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
  const projectRoot = path.resolve(process.cwd(), '..');
  const scraperScript = path.join(projectRoot, 'dist', 'index.js');

  console.log(`Starting scraper: node ${scraperScript} ${url} -o ./scraped-docs/${collectionName} --jina-mode -v`);

  const child = spawn('node', [
    scraperScript,
    url,
    '-o', `./scraped-docs/${collectionName}`,
    '--jina-mode',
    '--max-pages', '500',
    '-v'
  ], {
    cwd: projectRoot,
    stdio: 'pipe',
    env: {
      ...process.env,
      COLLECTION_NAME: collectionName
    }
  });

  child.stdout.on('data', (data) => {
    console.log(`[${sessionId}] STDOUT:`, data.toString());
    // TODO: Send progress updates via SSE or WebSocket
  });

  child.stderr.on('data', (data) => {
    console.error(`[${sessionId}] STDERR:`, data.toString());
  });

  child.on('close', (code) => {
    console.log(`[${sessionId}] Scraping finished with code ${code}`);
    // TODO: Update session status and notify client
  });

  child.on('error', (error) => {
    console.error(`[${sessionId}] Scraping error:`, error);
  });
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Scrape API is running',
    timestamp: new Date().toISOString()
  });
} 