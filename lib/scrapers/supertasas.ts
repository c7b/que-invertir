import type { ScrapingData } from '@/types';
import puppeteer from 'puppeteer';

export async function scrapeSuperTasas(): Promise<ScrapingData> {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto('https://supertasas.com/inversion/');
    await page.waitForSelector('#plazo');
    
    const products = await page.evaluate(() => {
      const options = Array.from(
        (document.getElementById('plazo') as HTMLSelectElement)?.options || []
      ) as HTMLOptionElement[];
      
      const terms = [
        { name: 'A la vista', days: 1 },
        { name: '90 días', days: 90 },
        { name: '180 días', days: 180 },
        { name: '365 días (Pagos mensuales)', days: 365 },
        { name: '365 días', days: 365 }
      ];

      return terms.map((term, index) => ({
        name: term.name,
        yield: parseFloat(options[index]?.value || '0'),
        termDays: term.days,
        originalTerm: term.name,
        lastUpdated: new Date().toISOString()
      }));
    });

    await browser.close();

    return {
      provider: 'supertasas',
      date: new Date().toISOString(),
      products,
      success: true
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error scraping SuperTasas:', error);
    return {
      provider: 'supertasas',
      date: new Date().toISOString(),
      products: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
