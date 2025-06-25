import { NextResponse } from 'next/server';
import { selectDailyContent } from '~/lib/dailyContent';

export async function GET() {
  try {
    const today = new Date();
    const content = await selectDailyContent(today);

    return NextResponse.json({ 
      content,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching daily content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // Since selectDailyContent now has fallback handling, this should rarely happen
    // But if it does, we'll return a minimal fallback
    const fallbackContent = {
      date: new Date().toISOString().split('T')[0],
      primary: {
        type: 'affirmation',
        text: 'Each day brings new opportunities for growth and cosmic alignment.',
        author: 'Solara Wisdom',
        id: 'emergency-fallback'
      },
      secondary: [
        {
          type: 'daily_prompt',
          text: 'What wisdom have you gained from your recent solar rotations?',
          author: 'Solara Reflection',
          id: 'emergency-prompt-1'
        }
      ]
    };

    return NextResponse.json({ 
      content: fallbackContent,
      success: false,
      error: 'Using emergency fallback content',
      details: errorMessage 
    }, { status: 200 }); // Return 200 status so the frontend gets the fallback content
  }
} 