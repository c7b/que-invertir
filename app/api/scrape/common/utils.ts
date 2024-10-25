import puppeteer from 'puppeteer';
import { supabase } from '@/lib/supabase';
import type { ScraperResponse } from '@/types';

export async function scrapePage(url: string, scraper: (page: any) => Promise<any>) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(15000);
    await page.setDefaultTimeout(15000);
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 15000 
    });
    
    console.log('Page loaded, running scraper...');
    const result = await scraper(page);
    return result;
  } catch (error) {
    console.error('Error in scrapePage:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export function normalizeTermToDays(term: string): number {
  const termLower = term.toLowerCase();
  
  // Casos especiales
  if (termLower.includes('vista') || termLower.includes('diario')) {
    return 1;
  }
  
  // Extraer números y unidades
  const number = parseInt(term.match(/\d+/)?.[0] || '0');
  
  if (termLower.includes('día')) return number;
  if (termLower.includes('mes')) return number * 30;
  if (termLower.includes('año')) return number * 365;
  
  return 0; // default para casos no manejados
}

export async function saveToSupabase(data: ScraperResponse) {
  try {
    const { provider } = data;
    const providerLower = provider.toLowerCase();

    // Primero intentamos actualizar
    const { error: updateError } = await supabase
      .from('scraping_data')
      .update({ data: data })
      .eq('provider', providerLower);

    if (updateError) {
      // Si no existe el registro, lo insertamos
      const { error: insertError } = await supabase
        .from('scraping_data')
        .insert([{ 
          provider: providerLower,
          data: data 
        }]);

      if (insertError) throw insertError;
    }

    console.log(`Data saved/updated for ${provider}`);
    
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
}
