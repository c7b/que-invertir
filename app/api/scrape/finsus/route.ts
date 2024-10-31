import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import { scrapeFinsus } from '@/lib/scrapers/finsus';

export async function GET() {
  try {
    // Primero verificamos si tenemos datos frescos en caché
    const isFresh = await isDataFresh('finsus');
    
    if (isFresh) {
      const latestData = await getLatestScraping('finsus');
      return NextResponse.json(latestData?.data || null);
    }

    // Si no hay datos frescos, hacemos el scraping
    const scrapedData = await scrapeFinsus();
    
    // Si el scraping fue exitoso, guardamos en la base de datos
    if (scrapedData.success) {
      await saveScraping('finsus', scrapedData);
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