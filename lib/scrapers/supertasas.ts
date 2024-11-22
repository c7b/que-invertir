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
    
    // Wait for the container with rates to be visible
    await page.waitForSelector('.tasasPM .fade-in.show', {
      timeout: 7000,
      visible: true
    });

    const products = await page.evaluate(() => {
      const results = [];
      
      // Select all rate containers
      const rateContainers = document.querySelectorAll('.tasasPM .fade-in.show');
      
      rateContainers.forEach(container => {
        const yieldElement = container.querySelector('.txt48.c-white .numeros');
        const decimalElement = container.querySelector('.txt48.c-white');
        const termElement = container.querySelector('.txt24.is-bold.c-black');
        
        if (yieldElement && decimalElement && termElement) {
          const wholeNumber = yieldElement.textContent?.trim() || '0';
          const fullYieldText = decimalElement.textContent?.trim() || '0';
          const decimal = fullYieldText.split('.')[1]?.replace('%', '') || '0';
          const termText = termElement.textContent?.trim() || '';
          
          // Calculate full yield number
          const yieldValue = parseFloat(`${wholeNumber}.${decimal}`);
          
          // Extract term days
          let termDays = 1; // default for "A la vista"
          if (termText.includes('364')) {
            termDays = 364;
          } else if (termText.includes('182')) {
            termDays = 182;
          } else if (termText.includes('91')) {
            termDays = 91;
          } else if (termText.includes('28')) {
            termDays = 28;
          }

          // Skip duplicate 364-day product (the one with monthly interests)
          if (!termText.includes('intereses cada 28 días')) {
            results.push({
              name: `SuperTasas: ${termText.split('(')[0].trim()}`,
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
