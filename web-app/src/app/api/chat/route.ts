import { NextRequest, NextResponse } from 'next/server';

const RAG_SERVER_URL = process.env.RAG_SERVER_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, trialId, collectionName } = body;

    // TODO: Use trialId for analytics and rate limiting
    console.log('🎯 Chat API request:', { trialId, collectionName, message: message.substring(0, 100) + '...' });

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare request body for RAG server
    const ragRequestBody: { message: string; collectionName?: string } = { message };
    
    // Add collectionName if provided
    if (collectionName) {
      ragRequestBody.collectionName = collectionName;
    }

    // Forward request to RAG server
    const response = await fetch(`${RAG_SERVER_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ragRequestBody),
    });

    if (!response.ok) {
      throw new Error(`RAG server error: ${response.status}`);
    }

    const ragData = await response.json();

    // Transform RAG response to match our UI format
    const rawSources = ragData.sources?.map((source: { title?: string; url?: string; excerpt?: string; content?: string }) => {
      // Extract URL from frontmatter if it's a local file path
      let displayUrl = source.url || '#';
      
      // If URL is a local file path, try to extract URL from excerpt frontmatter
      if (displayUrl.includes('/scraped-docs/') || displayUrl.startsWith('/Users/')) {
        const frontmatterMatch = source.excerpt?.match(/url:\s*([^\n]+)/);
        if (frontmatterMatch) {
          displayUrl = frontmatterMatch[1].trim();
        }
      }
      
      return {
        title: source.title || 'Unknown source',
        url: displayUrl,
        excerpt: source.excerpt || source.content?.substring(0, 150) || ''
      };
    }) || [];

    // Deduplicate sources by URL (keep first occurrence)
    const uniqueSources: { title: string; url: string; excerpt: string }[] = [];
    const seenUrls = new Set<string>();
    
    rawSources.forEach((source: { title: string; url: string; excerpt: string }) => {
      if (!seenUrls.has(source.url)) {
        seenUrls.add(source.url);
        uniqueSources.push(source);
      }
    });

    const formattedResponse = {
      content: ragData.content || 'Sorry, I could not generate a response.',
      sources: uniqueSources
    };
    
    console.log(`📊 Sources deduplication: ${rawSources.length} → ${uniqueSources.length} unique sources`);
    console.log('🔗 Unique sources:', formattedResponse.sources.map((s: { title: string; url: string }) => ({ title: s.title, url: s.url })));

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        sources: []
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Chat API is running',
    timestamp: new Date().toISOString()
  });
} 