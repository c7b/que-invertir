import { NextResponse } from 'next/server';
import { scrapeCetes } from '@/lib/scrapers/cetes';
import { scrapeNu } from '@/lib/scrapers/nu';
import { scrapeSuperTasas } from '@/lib/scrapers/supertasas';
import { scrapeCovalto } from '@/lib/scrapers/covalto';
import { scrapeFinsus } from '@/lib/scrapers/finsus';
import { scrapeKlar } from '@/lib/scrapers/klar';
import { scrapeStori } from '@/lib/scrapers/stori';
import { saveScraping } from '@/lib/supabase';
import type { ScrapingData, Provider } from '@/types';

// Type-safe scraper mapping
const scrapers = {
  cetes: scrapeCetes,
  nu: scrapeNu,
  supertasas: scrapeSuperTasas,
  covalto: scrapeCovalto,
  finsus: scrapeFinsus,
  klar: scrapeKlar,
  stori: scrapeStori
} as const;

export async function GET() {
  try {
    const results: Record<Provider, ScrapingData | null> = {} as Record<Provider, ScrapingData | null>;
    const errors: string[] = [];

    // Execute all scrapers in parallel
    const scrapeResults = await Promise.allSettled(
      Object.entries(scrapers).map(async ([provider, scraper]) => {
        try {
          const data = await scraper();
          if (data?.success) {
            await saveScraping(provider, data);
            results[provider as Provider] = data;
          } else {
            errors.push(`${provider}: No data returned`);
            results[provider as Provider] = null;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${provider}: ${errorMessage}`);
          results[provider as Provider] = null;
        }
      })
    );

    // Count successful scrapes
    const successfulScrapes = Object.values(results).filter(Boolean).length;

    // Prepare response
    const response = {
      date: new Date().toISOString(),
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
      stats: {
        total: Object.keys(scrapers).length,
        successful: successfulScrapes,
        failed: errors.length
      }
    };

    // If no successful scrapes, return 500
    if (successfulScrapes === 0) {
      return NextResponse.json(response, { status: 500 });
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in scrape/all:', error);
    return NextResponse.json({
      date: new Date().toISOString(),
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      stats: {
        total: Object.keys(scrapers).length,
        successful: 0,
        failed: 1
      }
    }, { status: 500 });
  }
}
