import { NextResponse } from 'next/server';

const RAG_SERVER_URL = process.env.RAG_SERVER_URL || 'http://localhost:8001';

export async function GET() {
  try {
    // Get stats from RAG server
    const response = await fetch(`${RAG_SERVER_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RAG server error: ${response.status}`);
    }

    const stats = await response.json();

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stats',
        count: 0,
        status: 'error'
      },
      { status: 500 }
    );
  }
} 