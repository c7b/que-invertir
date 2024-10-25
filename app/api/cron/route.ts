import { NextResponse } from 'next/server';
import { saveScraping } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Verificar el secreto del cron (opcional pero recomendado)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Realizar scraping para todos los proveedores
    const providers = ['nu', 'cetes', 'supertasas'] as const;
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        const data = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scrape/${provider}`);
        const json = await data.json();
        await saveScraping(provider, json);
        return provider;
      })
    );

    return NextResponse.json({
      success: true,
      results: results.map((result, index) => ({
        provider: providers[index],
        status: result.status,
        ...(result.status === 'rejected' ? { error: result.reason } : {})
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
