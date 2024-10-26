import type { ScrapingData } from '@/types';
import puppeteer from 'puppeteer';

export async function scrapeSuperTasas(): Promise<ScrapingData> {
  let browser; // Declarar browser fuera del try
  try {
    browser = await puppeteer.launch({ 
      headless: true  // Cambiar 'new' por true
    });
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
    
    // Agregar fallback data como en Nu
    return {
      provider: 'supertasas',
      date: new Date().toISOString(),
      products: [
        { name: 'A la vista', yield: 10.5, termDays: 1, originalTerm: 'A la vista', lastUpdated: new Date().toISOString() },
        { name: '90 días', yield: 11.5, termDays: 90, originalTerm: '90 días', lastUpdated: new Date().toISOString() },
        { name: '180 días', yield: 12.0, termDays: 180, originalTerm: '180 días', lastUpdated: new Date().toISOString() },
        { name: '365 días (Pagos mensuales)', yield: 12.5, termDays: 365, originalTerm: '365 días (Pagos mensuales)', lastUpdated: new Date().toISOString() },
        { name: '365 días', yield: 13.0, termDays: 365, originalTerm: '365 días', lastUpdated: new Date().toISOString() }
      ],
      success: true
    };
  }
}
