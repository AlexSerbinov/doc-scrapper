import { NextRequest, NextResponse } from 'next/server';
import { updateProgressSettings, getProgressSettings } from '../../../../lib/sessionStatus';

// GET /api/progress/settings?sessionId=xxx
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const settings = getProgressSettings(sessionId);
    
    return NextResponse.json({
      success: true,
      sessionId,
      settings
    });

  } catch (error) {
    console.error('GET /api/progress/settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/progress/settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, settings } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }

    // Validate settings structure
    const validKeys = [
      'showDetailedStats',
      'showTimingInfo', 
      'showRateInfo',
      'animateProgress',
      'showCurrentUrl',
      'compactView'
    ];

    const invalidKeys = Object.keys(settings).filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid setting keys: ${invalidKeys.join(', ')}` },
        { status: 400 }
      );
    }

    // Update settings
    const updatedSettings = updateProgressSettings(sessionId, settings);

    return NextResponse.json({
      success: true,
      sessionId,
      settings: updatedSettings,
      message: 'Progress bar settings updated successfully'
    });

  } catch (error) {
    console.error('POST /api/progress/settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 