import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import type { ScraperResponse } from '@/types';

// Función helper para limpiar entidades HTML
function cleanHtmlEntities(str: string): string {
  return str
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&iacute;/g, 'í')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú');
}

export async function GET() {
  try {
    // Verificar si tenemos datos frescos
    const isFresh = await isDataFresh('cetes');
    console.log('CETES data is fresh:', isFresh);

    if (isFresh) {
      const latestData = await getLatestScraping('cetes');
      console.log('Returning cached CETES data');
      return NextResponse.json(latestData?.data || null);
    }

    // Si no hay datos frescos, hacer scraping
    const response = await fetch('https://www.cetesdirecto.com/sites/cetes/ticker.json');
    const { datos } = await response.json();

    // Formatear los datos según nuestra estructura
    const formattedData: ScraperResponse = {
      provider: 'cetes',
      date: new Date().toISOString(),
      products: datos.map((dato: any) => ({
        name: cleanHtmlEntities(dato.tipo),
        yield: parseFloat(dato.porcentaje.replace('+', '').replace('%', '').split(' (')[0])
      }))
    };

    // Guardar los nuevos datos en Supabase
    console.log('Saving new CETES data');
    await saveScraping('cetes', formattedData);

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error('Error in CETES scraper:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
