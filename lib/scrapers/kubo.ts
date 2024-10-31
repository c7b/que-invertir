import type { ScrapingData } from '@/types';
import puppeteer from 'puppeteer';

export async function scrapeKubo(): Promise<ScrapingData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    
    await page.goto('https://www.kubofinanciero.com/ley-transparencia/kubo-plazofijo-tasas');
    
    await page.waitForSelector('.kdst-plazofijo-table');

    const products = await page.evaluate(() => {
      const uniqueProducts = new Map();
      
      const rows = document.querySelectorAll('.kdst-plazofijo-table > div:not(:first-child)');
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('.kds-detail-table');
        if (cells.length >= 2) {
          const days = parseInt(cells[0].textContent?.trim() || '0');
          const rate = parseFloat(cells[1].textContent?.trim().replace('%', '') || '0');
          
          if (days && rate) {
            const key = days.toString();
            if (!uniqueProducts.has(key) || uniqueProducts.get(key).yield < rate) {
              uniqueProducts.set(key, {
                yield: rate,
                termDays: days,
                originalTerm: `${days} días`
              });
            }
          }
        }
      });

      return Array.from(uniqueProducts.values());
    });

    if (browser) {
      await browser.close();
    }

    const now = new Date().toISOString();

    return {
      provider: 'kubo',
      date: now,
      products: products.sort((a, b) => b.yield - a.yield),
      success: true
    };
    

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error scraping Kubo:', error);
    throw error;
  }
} 