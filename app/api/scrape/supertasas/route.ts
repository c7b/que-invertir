import { NextResponse } from 'next/server';
import { scrapePage } from '../utils';
import type { ScraperResponse } from '../types';

async function scrapeSuperTasas(page: any): Promise<ScraperResponse> {
  try {
    await page.waitForSelector('#plazo');

    const yields = await page.evaluate(() => {
      const options = Array.from(document.getElementById('plazo')?.options || []);
      return {
        '1': parseFloat(options[0]?.value || '0'),
        '90': parseFloat(options[1]?.value || '0'),
        '180': parseFloat(options[2]?.value || '0'),
        '365_2': parseFloat(options[3]?.value || '0'),
        '365': parseFloat(options[4]?.value || '0')
      };
    });

    return {
      success: true,
      data: {
        provider: 'SuperTasas',
        date: new Date().toISOString(),
        products: [
          { name: 'A la vista', yield: `${yields['1']}%` },
          { name: '90 días', yield: `${yields['90']}%` },
          { name: '180 días', yield: `${yields['180']}%` },
          { name: '365 días (Pagos mensuales)', yield: `${yields['365_2']}%` },
          { name: '365 días', yield: `${yields['365']}%` }
        ]
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function GET() {
  try {
    const url = 'https://supertasas.com/inversion/';
    const result = await scrapePage(url, scrapeSuperTasas);
    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
