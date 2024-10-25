import { NextResponse } from 'next/server';
import { scrapePage, scrapeNu, scrapeCetes, scrapeSuperTasas } from '../common';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import type { Provider } from '../common';

export async function GET(
  request: Request,
  { params }: { params: { provider: Provider } }
) {
  try {
    const isFresh = await isDataFresh(params.provider);
    console.log(`${params.provider} data is fresh:`, isFresh);

    if (isFresh) {
      const latestData = await getLatestScraping(params.provider);
      console.log(`Returning cached ${params.provider} data`);
      return NextResponse.json(latestData?.data || null);
    }

    let result;
    switch (params.provider) {
      case 'nu':
        result = await scrapePage('https://nu.com.mx/cuenta/', scrapeNu);
        break;
      case 'cetes':
        result = await scrapeCetes();
        break;
      case 'supertasas':
        result = await scrapePage('https://supertasas.com/inversion/', scrapeSuperTasas);
        break;
      default:
        throw new Error('Proveedor no soportado');
    }

    await saveScraping(params.provider, result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in ${params.provider} scraper:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
