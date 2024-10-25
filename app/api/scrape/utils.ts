import puppeteer from 'puppeteer';

export async function scrapePage(url: string, scrapeFunction: (page: any) => Promise<any>) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const result = await scrapeFunction(page);
    await browser.close();
    return result;
  } catch (error) {
    await browser.close();
    throw error;
  }
}
