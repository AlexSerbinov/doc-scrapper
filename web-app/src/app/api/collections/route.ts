import { NextResponse } from 'next/server';

const RAG_SERVER_URL = process.env.RAG_SERVER_URL || 'http://localhost:8001';

export async function GET() {
  try {
    // Forward request to RAG server
    const response = await fetch(`${RAG_SERVER_URL}/collections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RAG server error: ${response.status}`);
    }

    const collectionsData = await response.json();

    return NextResponse.json(collectionsData);

  } catch (error) {
    console.error('Collections API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch collections',
        collections: [],
        groupedCollections: {},
        currentCollection: 'doc-scrapper-docs'
      },
      { status: 500 }
    );
  }
} 