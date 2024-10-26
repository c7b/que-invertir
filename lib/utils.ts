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
  'anual': 365
};

export function getTermDays(term: string): number {
  const termLower = term.toLowerCase().trim();
  
  // Buscar en mapeos exactos primero
  for (const [key, days] of Object.entries(TERM_MAPPINGS)) {
    if (termLower.includes(key)) {
      return days;
    }
  }

  // Si no hay mapeo exacto, intentar extraer números
  const numbers = termLower.match(/\d+/);
  if (!numbers) return 0;

  const days = parseInt(numbers[0]);

  if (termLower.includes('año') || termLower.includes('anual')) {
    return days * 365;
  }
  if (termLower.includes('mes') || termLower.includes('meses')) {
    return days * 30;
  }
  
  return days;
}
