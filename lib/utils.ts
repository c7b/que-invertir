import type { Product } from '@/types';

export function cleanHtmlEntities(str: string): string {
  return str
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&iacute;/g, 'í')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú');
}

export function normalizeYield(yieldStr: string): number {
  return parseFloat(yieldStr.replace(/[+%]/g, '').split(' (')[0].trim());
}

const TERM_MAPPINGS: Record<string, number> = {
  '1 mes': 30,
  '3 meses': 90,
  '6 meses': 180,
  '1 año': 365,
  '28 días': 28,
  '90 días': 90,
  '91 días': 91,
  '180 días': 180,
  '360 días': 360,
  '365 días': 365,
  'mensual': 30,
  'trimestral': 90,
  'semestral': 180,
  'anual': 365,
  // Mapeos específicos de CETES
  'CETES 1 mes': 30,
  'CETES 3 meses': 90,
  'CETES 6 meses': 180,
  'CETES 1 año': 365
};

export function getTermDays(term: string): number {
  const termLower = cleanHtmlEntities(term.toLowerCase().trim());
  const years = parseInt(termLower.match(/\d+/)?.[0] || '0');
  
  // Manejo específico por tipo de producto
  if (termLower.includes('bono') || termLower.includes('udibono')) {
    return years * 365; // Convertir años a días
  }

  // Mapeo para CETES y otros productos
  for (const [key, days] of Object.entries(TERM_MAPPINGS)) {
    if (termLower.includes(key.toLowerCase())) {
      return days;
    }
  }

  // Para BONDDIA y otros productos de 1 día
  if (termLower.includes('día') || termLower.includes('dia')) {
    return 1;
  }

  return years * 30; // Por defecto, si tiene un número asumimos que son meses
}

// Función auxiliar para normalizar los términos
export function normalizeTermDays(product: {name: string, termDays: number}): number {
  const termLower = product.name.toLowerCase().trim();
  
  // Buscar en mapeos exactos primero
  for (const [key, days] of Object.entries(TERM_MAPPINGS)) {
    if (termLower.includes(key.toLowerCase())) {
      return days;
    }
  }

  // Si no hay mapeo exacto, intentar extraer números
  const numbers = termLower.match(/\d+/);
  if (!numbers) return product.termDays;

  const days = parseInt(numbers[0]);

  if (termLower.includes('año') || termLower.includes('anual')) {
    return days * 365;
  }
  if (termLower.includes('mes') || termLower.includes('meses')) {
    return days * 30;
  }
  
  return days;
}
// Función para filtrar productos relevantes
export function filterRelevantProducts(products: Product[]): Product[] {
  return products.filter(product => {
    const name = product.name.toLowerCase();
    // Excluir BONOS y UDIBONOS
    if (name.includes('bono')) return false;
    // Incluir solo productos específicos de CETES
    if (name.includes('cetes')) {
      return ['1 mes', '3 meses', '6 meses', '1 año'].some(term => 
        name.includes(term.toLowerCase())
      );
    }
    return true;
  });
}

