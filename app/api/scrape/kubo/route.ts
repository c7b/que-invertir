import { scrapeKubo } from '@/lib/scrapers/kubo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await scrapeKubo();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Kubo route:', error);
    return NextResponse.json(
      { error: 'Failed to scrape Kubo' },
      { status: 500 }
    );
  }
} 