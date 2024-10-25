import puppeteer from 'puppeteer';

export async function scrapeCetes() {
  const browser = await puppeteer.launch({
    headless: 'new',
  });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://www.cetesdirecto.com/sites/portal/inicio');
    
    // Esperar a que los elementos estén disponibles
    await page.waitForSelector('.table-responsive');
    
    const products = await page.evaluate(() => {
      const rows = document.querySelectorAll('.table-responsive tr');
      const data = [];
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const name = cells[0].textContent?.trim() || '';
          const yieldText = cells[1].textContent?.trim() || '';
          const rendimiento = parseFloat(yieldText.replace('%', ''));
          
          if (name && !isNaN(rendimiento)) {
            data.push({ name, rendimiento });
          }
        }
      });
      
      return data;
    });

    await browser.close();
    
    return {
      date: new Date().toISOString(),
      products,
      provider: 'cetes'
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}
