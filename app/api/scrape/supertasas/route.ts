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

    const scrapedData = await scrapeSuperTasas();
    
    if (scrapedData.success) {
      await saveScraping('supertasas', scrapedData);
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
