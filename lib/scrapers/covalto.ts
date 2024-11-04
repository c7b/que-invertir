import type { ScrapingData } from '@/types';
import puppeteer from 'puppeteer';

export async function scrapeCovalto(): Promise<ScrapingData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    
    await page.goto('https://covalto.com/invierte-hoy/');
    // Esperamos a que cargue la tabla
    await page.waitForSelector('table', {
      timeout: 5000
    });

    const products = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('table tbody tr');
      
      rows.forEach(row => {
        const plazo = row.querySelector('td:first-child')?.textContent?.trim();
        const rendimiento = row.querySelector('td:last-child')?.textContent?.trim();
        
        if (plazo && rendimiento && rendimiento.includes('%')) {
          // Solo tomamos las tasas fijas, ignoramos la variable
          if (rendimiento.includes('fija')) {
            const yieldValue = parseFloat(rendimiento.replace(/[^0-9.]/g, ''));
            const termDays = parseInt(plazo.replace(/[^0-9]/g, ''));
            
            if (!isNaN(yieldValue) && !isNaN(termDays)) {
              const pago = row.querySelector('td:nth-child(2)')?.textContent?.trim();
              results.push({
                name: `Inversión Covalto: ${termDays} días (${pago})`,
                yield: yieldValue,
                termDays,
                originalTerm: plazo,
              });
            }
          }
        }
      });

      return results;
    });

    if (browser) {
      await browser.close();
    }

    return {
      provider: 'covalto',
      date: new Date().toISOString(),
      products: products.sort((a, b) => b.yield - a.yield),
      success: true
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error scraping Covalto:', error);
    throw error;
  }
} 