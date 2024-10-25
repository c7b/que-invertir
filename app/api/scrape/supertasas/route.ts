import { NextResponse } from 'next/server';
import { scrapePage } from '../common/utils';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';

export async function GET() {
  try {
    // Verificar si tenemos datos frescos
    const isFresh = await isDataFresh('supertasas');
    console.log('SuperTasas data is fresh:', isFresh);

    if (isFresh) {
      const latestData = await getLatestScraping('supertasas');
      console.log('Returning cached SuperTasas data');
      return NextResponse.json(latestData?.data || null);
    }

    // Si no hay datos frescos, hacer scraping
    const url = 'https://supertasas.com/inversion/';
    const result = await scrapePage(url, async (page) => {
      await page.waitForSelector('#plazo');
      
      const yields = await page.evaluate(() => {
        const options = Array.from(document.getElementById('plazo')?.options || []);
        return {
          '1': parseFloat(options[0]?.value || '0'),
          '90': parseFloat(options[1]?.value || '0'),
          '180': parseFloat(options[2]?.value || '0'),
          '365_2': parseFloat(options[3]?.value || '0'),
          '365': parseFloat(options[4]?.value || '0')
        };
      });

      return {
        provider: 'SuperTasas',
        date: new Date().toISOString(),
        products: [
          { name: 'A la vista', yield: `${yields['1']}%` },
          { name: '90 días', yield: `${yields['90']}%` },
          { name: '180 días', yield: `${yields['180']}%` },
          { name: '365 días (Pagos mensuales)', yield: `${yields['365_2']}%` },
          { name: '365 días', yield: `${yields['365']}%` }
        ]
      };
    });

    // Guardar los nuevos datos en Supabase
    console.log('Saving new SuperTasas data');
    await saveScraping('supertasas', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in SuperTasas scraper:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
