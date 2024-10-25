// app/api/scrape/route.ts
import { NextResponse } from 'next/server';
import { scrapePage } from '@/lib/scraper';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // URL de la página a hacer scraping
    const url = 'https://nu.com.mx/cuenta/';

    // Add error handling and launch options to scrapePage
    const content = await scrapePage(url, async (page) => {
      // Esperar a que la tabla se cargue
      await page.waitForSelector('.DesktopYieldTable__Container-sc-4h2kid-0');

      const yields = await page.evaluate(() => {
        const results = [];
        
        // Obtener todas las filas
        const rows = document.querySelectorAll('.DesktopYieldTable__StyledRow-sc-4h2kid-1');
        
        let currentProduct = '';
        
        rows.forEach(row => {
          // Obtener el texto del producto (si existe)
          const productText = row.querySelector('.DesktopYieldTable__StyledRowFirstColumnText-sc-4h2kid-5')?.textContent;
          if (productText) {
            currentProduct = productText.trim();
          }

          // Obtener el porcentaje (si existe)
          const percentage = row.querySelector('.DesktopYieldTable__StyledRowPercentage-sc-4h2kid-6')?.textContent;
          const gatNominal = row.querySelector('.DesktopYieldTable__StyledGatPercentage-sc-4h2kid-7')?.textContent;
          
          if (percentage || gatNominal) {
            results.push({
              producto: currentProduct,
              rendimiento: percentage?.trim() || null,
              gatNominal: gatNominal?.trim() || null
            });
          }
        });

        return results;
      });

      return yields;
    });

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
