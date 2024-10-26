import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import { scrapeCetes } from '@/lib/scrapers/cetes';

export async function GET() {
  try {
    const isFresh = await isDataFresh('cetes');
    
    if (isFresh) {
      const latestData = await getLatestScraping('cetes');
      return NextResponse.json(latestData?.data || null);
    }

    const scrapedData = await scrapeCetes();
    
    if (scrapedData.success) {
      await saveScraping('cetes', scrapedData);
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