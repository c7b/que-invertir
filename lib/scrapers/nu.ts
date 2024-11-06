import type { ScrapingData } from '@/types';
import puppeteer from 'puppeteer';

export async function scrapeNu(): Promise<ScrapingData> {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true
    });
    const page = await browser.newPage();
    
    await page.goto('https://nu.com.mx/cuenta/');
    await page.waitForSelector('.DesktopYieldTable__Container-sc-4h2kid-0', {
      timeout: 15000
    });

    const products = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('.DesktopYieldTable__StyledRow-sc-4h2kid-1');
      
      for (let i = 4; i < rows.length; i += 4) {
        const productRow = rows[i];
        const yieldRow = rows[i + 1];
        
        const productText = productRow.querySelector('.DesktopYieldTable__StyledRowFirstColumnText-sc-4h2kid-5')?.textContent;
        const yieldText = yieldRow.querySelector('.DesktopYieldTable__StyledRowPercentage-sc-4h2kid-6')?.textContent;
        
        if (productText && yieldText) {
          const name = productText.trim();
          if (name.includes('días') || name.includes('Cajitas')) {
            const termMatch = name.match(/(\d+)\s*días/);
            const termDays = termMatch ? parseInt(termMatch[1]) : 
                            name.includes('Cajitas') ? 1 : 0;

            results.push({
              name,
              yield: parseFloat(yieldText.replace('%', '').trim()),
              termDays,
              originalTerm: name,
            });
          }
        }
      }

      return results;
    });

    if (browser) {
      await browser.close();
    }

    if (products.length === 0) {
      throw new Error('No products found for Nu');
    }

    return {
      provider: 'nu',
      date: new Date().toISOString(),
      products: products.sort((a, b) => b.yield - a.yield),
      success: true
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error scraping Nu:', error);
    throw error; // Re-lanzamos el error para que sea manejado por el API route
  }
}
