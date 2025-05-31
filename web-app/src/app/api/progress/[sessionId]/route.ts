import { NextRequest, NextResponse } from 'next/server';
import { getSessionStatus } from '@/lib/sessionStatus';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Отримуємо статус з пам'яті
    const status = getSessionStatus(sessionId);

    if (!status) {
      // Якщо статусу немає, можливо процес ще не почався або завершився
      // Спробуємо перевірити чи існує демо чат для цієї сесії
      const chatUrl = `/demo/${sessionId}`;
      
      return NextResponse.json({
        sessionId,
        status: 'completed' as const,
        currentStep: 'finished',
        progress: 100,
        message: 'Обробка завершена',
        chatUrl
      });
    }

    return NextResponse.json(status);

  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get progress status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 