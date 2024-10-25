import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';
import { scrapeCetes } from '@/lib/scraper';

// Datos fijos como fallback
const NU_DATA = {
  provider: 'Nu',
  date: new Date().toISOString(),
  products: [
    { name: "Cajitas Nu²", yield: "12.50%" },
    { name: "Ahorro Congelado: 7 días¹", yield: "12.75%" },
    { name: "Ahorro Congelado: 28 días¹", yield: "13.12%" },
    { name: "Ahorro Congelado: 90 días¹", yield: "14.50%" },
    { name: "Ahorro Congelado: 180 días¹", yield: "12.36%" }
  ]
};

export async function GET() {
  try {
    // Verificar si tenemos datos frescos
    const isFresh = await isDataFresh('nu');
    console.log('Nu data is fresh:', isFresh);

    if (isFresh) {
      const latestData = await getLatestScraping('nu');
      console.log('Returning cached Nu data');
      return NextResponse.json(latestData?.data || NU_DATA);
    }

    // Si no hay datos frescos, hacer scraping
    const scrapedData = await scrapeCetes({
      url: 'https://nu.com.mx/cuenta/',
      scraper: async (page) => {
        await page.waitForSelector('.DesktopYieldTable__Container-sc-4h2kid-0', {
          timeout: 5000
        });

        const yields = await page.evaluate(() => {
          const results = [];
          const rows = document.querySelectorAll('.DesktopYieldTable__StyledRow-sc-4h2kid-1');
          
          let currentProduct = '';
          
          rows.forEach(row => {
            const productText = row.querySelector('.DesktopYieldTable__StyledRowFirstColumnText-sc-4h2kid-5')?.textContent;
            if (productText) {
              currentProduct = productText.trim();
            }

            const percentage = row.querySelector('.DesktopYieldTable__StyledRowPercentage-sc-4h2kid-6')?.textContent;
            const gatNominal = row.querySelector('.DesktopYieldTable__StyledGatPercentage-sc-4h2kid-7')?.textContent;
            
            if (percentage || gatNominal) {
              results.push({
                name: currentProduct,
                yield: percentage?.trim() || gatNominal?.trim() || null
              });
            }
          });

          return results;
        });

        return {
          provider: 'Nu',
          date: new Date().toISOString(),
          products: yields
        };
      }
    });

    // Guardar los datos scrapeados en Supabase
    await saveScraping('nu', scrapedData);

    return NextResponse.json(scrapedData);
  } catch (error: any) {
    console.error('Error in Nu GET:', error);
    // En caso de error, devolver datos fijos
    return NextResponse.json(NU_DATA);
  }
}
