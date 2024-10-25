import { NextResponse } from 'next/server';
import { scrapePage, scrapeNu, scrapeCetes, scrapeSuperTasas } from '../../common';
import { saveScraping } from '@/lib/supabase';
import type { Provider } from '../../common';

export async function GET(
  request: Request,
  { params }: { params: { provider: Provider } }
) {
  try {
    const provider = params.provider; // Next.js 13+ requiere que esperemos los params
    console.log(`Forcing new scraping for ${provider}...`);

    let result;
    switch (provider) {
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

    await saveScraping(provider, result);
    return NextResponse.json({
      success: true,
      message: `Scraping forzado completado para ${provider}`,
      data: result
    });
  } catch (error: any) {
    console.error(`Error in forced scraping for ${params.provider}:`, error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
