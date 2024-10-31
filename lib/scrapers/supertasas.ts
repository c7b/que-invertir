import type { ScrapingData } from '@/types';
import puppeteer from 'puppeteer';

export async function scrapeSuperTasas(): Promise<ScrapingData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    
    await page.goto('https://supertasas.com/inversion/');
    
    // Esperamos a que la animación termine y los elementos estén visibles
    await page.waitForSelector('.tasasPM .fade-in.show', {
      timeout: 10000,
      visible: true
    });

    // Esperamos usando setTimeout en lugar de waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 3000));

    const products = await page.evaluate(() => {
      const results = [];
      
      // Buscamos todos los elementos con tasas
      const tasasElements = document.querySelectorAll('.tasasPM .fade-in.show');
      
      tasasElements.forEach(element => {
        const yieldElement = element.querySelector('.txt48.c-green');
        const termElement = element.querySelector('.txt22.is-bold');
        
        if (yieldElement && termElement) {
          const yieldText = yieldElement.textContent?.trim();
          const termText = termElement.textContent?.trim();
          
          if (yieldText && termText) {
            // Extraer el número de yield
            const yieldValue = parseFloat(yieldText.replace('%', ''));
            
            // Determinar los días
            let termDays = 1; // default para "A la vista"
            if (termText.includes('364')) {
              termDays = 364;
            } else if (termText.includes('182')) {
              termDays = 182;
            } else if (termText.includes('91')) {
              termDays = 91;
            } else if (termText.includes('28')) {
              termDays = 28;
            }

            results.push({
              name: `SuperTasas: ${termText}`,
              yield: yieldValue,
              termDays,
              originalTerm: termText
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
      provider: 'supertasas',
      date: new Date().toISOString(),
      products: products.sort((a, b) => b.yield - a.yield),
      success: true
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error scraping SuperTasas:', error);
    throw error;
  }
}
