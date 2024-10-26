import type { ScrapingData } from '@/types';
import { cleanHtmlEntities, normalizeYield, getTermDays } from '../utils';

export async function scrapeCetes(): Promise<ScrapingData> {
  try {
    const response = await fetch('https://www.cetesdirecto.com/sites/cetes/ticker.json');
    const { datos } = await response.json();

    return {
      provider: 'cetes',
      date: new Date().toISOString(),
      products: datos.map(dato => ({
        name: cleanHtmlEntities(dato.tipo).replace(/^h2$/i, 'Cetes'),
        yield: normalizeYield(dato.porcentaje),
        termDays: getTermDays(dato.tipo),
        originalTerm: dato.tipo,
        lastUpdated: new Date().toISOString()
      })),
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
