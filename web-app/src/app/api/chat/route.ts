import { NextRequest, NextResponse } from 'next/server';

const RAG_SERVER_URL = process.env.RAG_SERVER_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, trialId } = body;

    // TODO: Use trialId for analytics and rate limiting
    console.log('Trial ID:', trialId);

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Forward request to RAG server
    const response = await fetch(`${RAG_SERVER_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`RAG server error: ${response.status}`);
    }

    const ragData = await response.json();

    // Transform RAG response to match our UI format
    const formattedResponse = {
      content: ragData.content || 'Sorry, I could not generate a response.',
      sources: ragData.sources?.map((source: { title?: string; url?: string; excerpt?: string; content?: string }) => ({
        title: source.title || 'Untitled',
        url: source.url || '#',
        excerpt: source.excerpt || source.content?.substring(0, 150) || ''
      })) || []
    };

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