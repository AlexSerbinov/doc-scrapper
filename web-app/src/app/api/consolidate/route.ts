import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { collectionName, projectName } = await request.json();

    if (!collectionName) {
      return NextResponse.json(
        { error: 'Collection name is required' }, 
        { status: 400 }
      );
    }

    // Get RAG server URL from environment
    const ragServerUrl = process.env.RAG_SERVER_URL || 'http://localhost:8001';

    console.log(`🔄 Requesting consolidation for collection: ${collectionName}`);

    // Call RAG server consolidate endpoint
    const response = await fetch(`${ragServerUrl}/consolidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionName,
        projectName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `RAG server error: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      markdown: result.markdown,
      stats: result.stats,
      message: result.message
    });

  } catch (error: unknown) {
    console.error('❌ Consolidation API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to consolidate documentation';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      }, 
      { status: 500 }
    );
  }
} 