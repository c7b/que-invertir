import type { ScrapingData } from '@/types';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function scrapeStori(): Promise<ScrapingData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
    });
    
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);
    
    await page.goto('https://www.storicard.com/stori-cuentamas');
    
    await page.waitForSelector('.text-\\[\\#132C42\\].w-full', {
      timeout: 10000
    });

    const products = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('.flex.justify-between.border-b');
      
      rows.forEach(row => {
        const term = row.querySelector('.md\\:w-1\\/4')?.textContent?.trim();
        const yieldText = row.querySelector('.md\\:w-3\\/4')?.textContent?.trim();
        
        if (term && yieldText && !yieldText.includes('GAT Real')) {
          let termDays: number;
          
          if (term === 'Sin plazo') {
            termDays = 1;
          } else {
            termDays = parseInt(term);
          }

          const yieldValue = parseFloat(yieldText.replace('% GAT Nominal', ''));
          
          if (!isNaN(yieldValue) && !isNaN(termDays)) {
            results.push({
              name: `Stori CuentaMás: ${term}`,
              yield: yieldValue,
              termDays,
              originalTerm: term,
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
      provider: 'stori',
      date: new Date().toISOString(),
      products: products.sort((a, b) => b.yield - a.yield),
      success: true
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error scraping Stori:', error);
    throw error;
  }
} 