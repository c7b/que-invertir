import { NextResponse } from 'next/server';
import { consolidateInvestments } from '@/lib/consolidate';

export async function GET() {
  try {
    const consolidated = await consolidateInvestments();
    
    return NextResponse.json({
      success: true,
      data: consolidated,
      date: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 