import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { isDataFresh } from '@/lib/supabase';

const CRON_SECRET = process.env.CRON_SECRET;
const SITE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

export async function GET() {
  try {
    // Arreglar el error de headers asíncronos
    const headersList = await headers();
    const authHeader = await headersList.get('authorization');
    
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar si necesitamos actualizar
    const [cetesFresh, nuFresh, supertasasFresh] = await Promise.all([
      isDataFresh('cetes'),
      isDataFresh('nu'),
      isDataFresh('supertasas')
    ]);

    if (cetesFresh && nuFresh && supertasasFresh) {
      return NextResponse.json({
        message: 'All data is fresh, no update needed',
        date: new Date().toISOString()
      });
    }

    // Hacer la llamada usando la URL correcta
    const response = await fetch(`${SITE_URL}/api/scrape/all`, {
      method: 'GET'
    });

    const data = await response.json();

    return NextResponse.json({
      message: 'Cron job completed',
      date: new Date().toISOString(),
      results: data
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        date: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
