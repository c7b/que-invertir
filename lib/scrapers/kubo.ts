import type { ScrapingData } from '@/types';
import puppeteer from 'puppeteer';

export async function scrapeKubo(): Promise<ScrapingData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    
    await page.goto('https://www.kubofinanciero.com/ley-transparencia/kubo-plazofijo-tasas', {
      waitUntil: 'networkidle0',
      timeout: 20000
    });

    const products = await page.evaluate(() => {
      const uniqueProducts = new Map();
      
      // Verificar que estamos en el Nivel 0
      const titleElement = document.querySelector('.headline-medium');
      if (!titleElement?.textContent?.includes('Nivel (0)')) {
        return [];
      }

      // Obtener el contenedor específico del Nivel 0
      const container = titleElement.closest('.kdst-plazofijo-table');
      if (!container) return [];

      // Obtener todas las filas de datos
      const rows = container.querySelectorAll('[style="grid-template-columns: repeat(4, 1fr); display: grid;"]');
      
      rows.forEach((row, index) => {
        // Saltamos la primera fila que es el encabezado
        if (index === 0) return;
        
        const cells = row.querySelectorAll('.kds-detail-text');
        if (cells.length >= 2) {
          const days = cells[0]?.textContent?.trim();
          const rate = cells[1]?.textContent?.trim();
          
          if (days && rate) {
            const termDays = parseInt(days);
            const yieldValue = parseFloat(rate.replace('%', ''));
            
            if (!isNaN(termDays) && !isNaN(yieldValue)) {
              const key = termDays.toString();
              // Actualizar solo si no existe o si la tasa es menor
              if (!uniqueProducts.has(key) || uniqueProducts.get(key).yield > yieldValue) {
                uniqueProducts.set(key, {
                  name: `Kubo ${days} días`,
                  yield: yieldValue,
                  termDays,
                  originalTerm: `${days} días`
                });
              }
            }
          }
        }
      });

      return Array.from(uniqueProducts.values());
    });

    if (browser) {
      await browser.close();
    }

    if (products.length === 0) {
      throw new Error('No products found in Nivel 0');
    }

    return {
      provider: 'kubo',
      date: new Date().toISOString(),
      products: products.sort((a, b) => b.yield - a.yield),
      success: true
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(error.message || 'Failed to scrape Kubo');
  }
} 