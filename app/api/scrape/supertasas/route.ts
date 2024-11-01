import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import { scrapeSuperTasas } from '@/lib/scrapers/supertasas';

export async function GET() {
  try {
    const isFresh = await isDataFresh('supertasas');
    
    if (isFresh) {
      const latestData = await getLatestScraping('supertasas');
      return NextResponse.json(latestData?.data || null);
    }

    console.log('Starting SuperTasas scraping...');
    const scrapedData = await scrapeSuperTasas();
    console.log('SuperTasas scraping completed:', scrapedData.success);
    
    if (scrapedData.success) {
      await saveScraping('supertasas', scrapedData);
    }

    return NextResponse.json(scrapedData);
  } catch (error) {
    console.error('SuperTasas scraping error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      }, 
      { status: 500 }
    );
  }
}
