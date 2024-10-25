// app/api/scrape/route.ts
import { NextResponse } from 'next/server';
import { scrapePage } from '../../../lib/scraper';

export async function GET() {
  try {
    // URL de la página a hacer scraping
    const url = 'https://nu.com.mx/cuenta/';

    // Add error handling and launch options to scrapePage
    const content = await scrapePage(url, async (page) => {
      // Esperamos a que cargue la tabla con un selector más genérico
      await page.waitForSelector('table', { timeout: 10000 });

      const yields = await page.evaluate(() => {
        const results = [];
        
        // Usamos selectores más genéricos basados en la estructura de la tabla
        const rows = document.querySelectorAll('table tr');
        
        let currentProduct = '';
        
        rows.forEach(row => {
          // Buscamos el texto del producto en la primera columna
          const productCell = row.querySelector('td:first-child');
          if (productCell?.textContent) {
            currentProduct = productCell.textContent.trim();
          }

          // Buscamos los porcentajes en las columnas siguientes
          const percentageCell = row.querySelector('td:nth-child(2)');
          const gatCell = row.querySelector('td:nth-child(3)');
          
          if (percentageCell || gatCell) {
            results.push({
              producto: currentProduct,
              rendimiento: percentageCell?.textContent?.trim() || null,
              gatNominal: gatCell?.textContent?.trim() || null
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
