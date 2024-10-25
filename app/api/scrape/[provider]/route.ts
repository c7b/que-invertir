import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping } from '@/lib/supabase';
import { scrapePage } from '../utils';

export async function GET(
  request: Request,
  { params }: { params: { provider: 'nu' | 'cetes' | 'supertasas' } }
) {
  try {
    // Intentar obtener datos recientes de Supabase
    const latestData = await getLatestScraping(params.provider);

    // Si tenemos datos frescos (menos de 24 horas), los devolvemos
    if (latestData?.is_fresh) {
      return NextResponse.json(latestData.data);
    }

    // Si no hay datos frescos, hacemos scraping
    let newData;
    switch (params.provider) {
      case 'nu':
        newData = await scrapeNu();
        break;
      case 'cetes':
        newData = await scrapeCetes();
        break;
      case 'supertasas':
        newData = await scrapeSuperTasas();
        break;
      default:
        throw new Error('Proveedor no soportado');
    }

    // Guardar nuevos datos en Supabase
    await saveScraping(params.provider, newData);

    return NextResponse.json(newData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
