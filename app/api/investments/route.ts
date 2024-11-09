import { NextResponse } from 'next/server';
import { getConsolidatedView } from '@/lib/supabase';

export async function GET() {
  try {
    const consolidatedData = await getConsolidatedView();
    
    if (!consolidatedData) {
      return NextResponse.json({ 
        success: false, 
        error: 'No consolidated data available' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: consolidatedData,
      date: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 