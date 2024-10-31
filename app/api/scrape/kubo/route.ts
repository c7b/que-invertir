import { scrapeKubo } from '@/lib/scrapers/kubo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await scrapeKubo();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error scraping Kubo:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to scrape Kubo' },
      { status: 500 }
    );
  }
} 