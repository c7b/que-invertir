import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import { scrapeCovalto } from '@/lib/scrapers/covalto';

export async function GET() {
  try {
    const isFresh = await isDataFresh('covalto');
    
    if (isFresh) {
      const latestData = await getLatestScraping('covalto');
      return NextResponse.json(latestData?.data || null);
    }

    const scrapedData = await scrapeCovalto();
    
    if (scrapedData.success) {
      await saveScraping('covalto', scrapedData);
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