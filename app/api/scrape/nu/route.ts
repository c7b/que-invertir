import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import { scrapeNu } from '@/lib/scrapers/nu';

export async function GET() {
  try {
    const isFresh = await isDataFresh('nu');
    
    if (isFresh) {
      const latestData = await getLatestScraping('nu');
      return NextResponse.json(latestData?.data || null);
    }

    const scrapedData = await scrapeNu();
    
    if (scrapedData.success) {
      await saveScraping('nu', scrapedData);
    }

    return NextResponse.json(scrapedData);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}