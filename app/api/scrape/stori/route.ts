import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import { scrapeStori } from '@/lib/scrapers/stori';

export async function GET() {
  try {
    // Primero verificamos si tenemos datos frescos en caché
    const isFresh = await isDataFresh('stori');
    
    if (isFresh) {
      const latestData = await getLatestScraping('stori');
      return NextResponse.json(latestData?.data || null);
    }

    // Si no hay datos frescos, hacemos el scraping
    const scrapedData = await scrapeStori();
    
    // Si el scraping fue exitoso, guardamos en la base de datos
    if (scrapedData.success) {
      await saveScraping('stori', scrapedData);
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