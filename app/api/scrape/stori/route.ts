import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import { scrapeStori } from '@/lib/scrapers/stori';

export async function GET() {
  try {
    const isFresh = await isDataFresh('stori');
    
    if (isFresh) {
      const latestData = await getLatestScraping('stori');
      return NextResponse.json(latestData?.data || null);
    }

    console.log('Starting Stori scraping...'); // Debug log
    const scrapedData = await scrapeStori();
    console.log('Stori scraping completed:', scrapedData.success); // Debug log
    
    if (scrapedData.success) {
      await saveScraping('stori', scrapedData);
    }

    return NextResponse.json(scrapedData);
  } catch (error) {
    console.error('Stori scraping error:', error); // Error log
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