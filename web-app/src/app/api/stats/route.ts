import { NextResponse } from 'next/server';
import { RAGClient } from '@/lib/ragClient';

export async function GET() {
  try {
    const ragClient = RAGClient.getInstance();
    const stats = await ragClient.getStats();

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Stats API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 