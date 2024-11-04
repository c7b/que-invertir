import type { ScrapingData } from '@/types';
import puppeteer from 'puppeteer';

export async function scrapeFinsus(): Promise<ScrapingData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    
    await page.goto('https://finsus-simulator.web.app/v2');
    // Esperamos a que cargue la tabla con los datos
    await page.waitForSelector('.graph-container.row', {
      timeout: 5000
    });

    const products = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('.graph-container.row');
      // Última fila que contiene GAT NOMINAL
      const gatNominalRow = rows[rows.length - 1];
      const yields = gatNominalRow.querySelectorAll('.helpText');
      const labels = document.querySelectorAll('.chartWrapper .row .label');
      
      // Empezamos desde 1 para saltar el texto "GAT NOMINAL"
      for (let i = 1; i < yields.length; i++) {
        const yieldText = yields[i].textContent;
        const label = labels[i - 1]?.textContent;
        
        if (yieldText && label) {
          const termMapping: Record<string, number> = {
            '7 dias': 7,
            '1 mes': 30,
            '3 meses': 90,
            '6 meses': 180,
            '12 meses': 365,
            '2 años': 730,
            '3 años': 1095,
            '4 años': 1460,
            '5 años': 1825
          };
          
          results.push({
            name: `GAT NOMINAL: ${label}`,
            yield: parseFloat(yieldText.replace('%', '')),
            termDays: termMapping[label.trim()] || parseInt(label),
            originalTerm: label,
          });
        }
      }

      return results;
    });

    if (browser) {
      await browser.close();
    }

    return {
      provider: 'finsus',
      date: new Date().toISOString(),
      products: products.sort((a, b) => b.yield - a.yield),
      success: true
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error scraping Finsus:', error);
    throw error; // Propagamos el error en lugar de usar fallback
  }
} 