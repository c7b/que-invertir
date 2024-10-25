import { NextResponse } from 'next/server';

function decodeHtmlEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&ntilde;': 'ñ',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú'
  };

  return text.replace(/&[^;]+;/g, match => entities[match] || match);
}

export async function GET() {
  try {
    const response = await fetch('https://www.cetesdirecto.com/sites/cetes/ticker.json');
    const data = await response.json();

    // Decodificar los caracteres HTML pero mantener la estructura
    const decodedData = {
      datos: data.datos.map((item: { tipo: string, porcentaje: string }) => ({
        tipo: decodeHtmlEntities(item.tipo),
        porcentaje: decodeHtmlEntities(item.porcentaje)
      }))
    };

    return NextResponse.json(decodedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
