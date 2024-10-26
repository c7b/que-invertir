import { NextResponse } from 'next/server';
import { scrapeCetes } from '@/lib/scrapers/cetes';
import { scrapeNu } from '@/lib/scrapers/nu';
import { scrapeSuperTasas } from '@/lib/scrapers/supertasas';
import { saveScraping } from '@/lib/supabase';
import type { ScrapingData } from '@/types';

export async function GET() {
  try {
    const results: Record<string, ScrapingData> = {};
    const errors: string[] = [];

    // Ejecutar todos los scrapers en paralelo
    const [cetesData, nuData, supertasasData] = await Promise.all([
      scrapeCetes().catch(error => {
        errors.push(`CETES Error: ${error.message}`);
        return null;
      }),
      scrapeNu().catch(error => {
        errors.push(`Nu Error: ${error.message}`);
        return null;
      }),
      scrapeSuperTasas().catch(error => {
        errors.push(`SuperTasas Error: ${error.message}`);
        return null;
      })
    ]);

    // Guardar resultados exitosos
    if (cetesData?.success) {
      await saveScraping('cetes', cetesData);
      results.cetes = cetesData;
    }

    if (nuData?.success) {
      await saveScraping('nu', nuData);
      results.nu = nuData;
    }

    if (supertasasData?.success) {
      await saveScraping('supertasas', supertasasData);
      results.supertasas = supertasasData;
    }

    // Preparar respuesta
    const response = {
      date: new Date().toISOString(),
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    };

    // Si no hay ningún resultado exitoso, devolver 500
    if (Object.keys(results).length === 0) {
      return NextResponse.json(response, { status: 500 });
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in scrape/all:', error);
    return NextResponse.json({
      date: new Date().toISOString(),
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 });
  }
}
