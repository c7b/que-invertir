import type { ScrapingData } from '@/types';
import puppeteer from 'puppeteer';

export async function scrapeKlar(): Promise<ScrapingData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    
    // Primero vamos a la página de Klar
    await page.goto('https://www.klar.mx/simulador-de-inversiones');
    
    // Esperamos y obtenemos el src del iframe
    const iframeSrc = await page.evaluate(() => {
      const iframe = document.querySelector('iframe[src*="flo.uri.sh"]');
      return iframe?.getAttribute('src');
    });

    if (!iframeSrc) {
      throw new Error('No se encontró el iframe de Flourish');
    }

    // Navegamos al iframe
    await page.goto(iframeSrc);
    
    // Esperamos a que la tabla se cargue
    await page.waitForSelector('.tr.body-row', {
      timeout: 5000
    });

    const products = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('.tr.body-row');
      
      rows.forEach(row => {
        const days = row.querySelector('.td:first-child .cell-body p')?.textContent?.trim();
        const klarYield = row.querySelector('.td:nth-child(2) .cell-body p')?.textContent?.trim();
        
        if (days && klarYield && klarYield !== 'NA') {
          let termDays: number;
          
          // Convertir el texto de días a número
          if (days.includes('año') || days.includes('ańo')) {
            termDays = 365;
          } else {
            termDays = parseInt(days);
          }

          // Limpiar y convertir el rendimiento a número
          const yieldValue = parseFloat(klarYield.replace('%', ''));
          
          if (!isNaN(yieldValue) && !isNaN(termDays)) {
            results.push({
              name: `Inversión Klar: ${days}`,
              yield: yieldValue,
              termDays,
              originalTerm: days,
            });
          }
        }
      });

      return results;
    });

    if (browser) {
      await browser.close();
    }

    return {
      provider: 'klar',
      date: new Date().toISOString(),
      products: products.sort((a, b) => b.yield - a.yield),
      success: true
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error scraping Klar:', error);
    throw error;
  }
} 