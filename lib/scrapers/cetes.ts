import type { ScrapingData } from '@/types';
import { cleanHtmlEntities, normalizeYield, getTermDays } from '../utils';

export async function scrapeCetes(): Promise<ScrapingData> {
  try {
    const response = await fetch('https://www.cetesdirecto.com/sites/cetes/ticker.json');
    const { datos } = await response.json();

    const products = datos.map(dato => ({
      name: cleanHtmlEntities(dato.tipo),
      yield: normalizeYield(dato.porcentaje),
      termDays: getTermDays(dato.tipo),
      originalTerm: dato.tipo,
    }));

    return {
      provider: 'cetes',
      date: new Date().toISOString(),
      products,
      success: true
    };
  } catch (error) {
    return {
      provider: 'cetes',
      date: new Date().toISOString(),
      products: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
