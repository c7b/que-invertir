import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import { scrapeKlar } from '@/lib/scrapers/klar';

export async function GET() {
  try {
    const isFresh = await isDataFresh('klar');
    
    if (isFresh) {
      const latestData = await getLatestScraping('klar');
      return NextResponse.json(latestData?.data || null);
    }

    const scrapedData = await scrapeKlar();
    
    if (scrapedData.success) {
      await saveScraping('klar', scrapedData);
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