import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Trigger scraping of all providers
    const scrapeResponse = await fetch(`${process.env.SITE_URL}/api/scrape/all`, {
      headers: { Authorization: authHeader }
    });
    
    if (!scrapeResponse.ok) {
      throw new Error('Scraping failed');
    }

    // 2. Trigger data consolidation
    const consolidateResponse = await fetch(`${process.env.SITE_URL}/api/consolidate`, {
      headers: { Authorization: authHeader }
    });

    if (!consolidateResponse.ok) {
      throw new Error('Consolidation failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Scraping and consolidation completed',
      date: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
