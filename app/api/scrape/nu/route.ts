import { NextResponse } from 'next/server';
import { getLatestScraping, saveScraping, isDataFresh } from '@/lib/supabase';

// Datos fijos para Nu
const NU_DATA = {
  provider: 'Nu',
  date: new Date().toISOString(),
  products: [
    { name: "Cajitas Nu²", yield: "12.50%" },
    { name: "Ahorro Congelado: 7 días¹", yield: "12.75%" },
    { name: "Ahorro Congelado: 28 días¹", yield: "13.12%" },
    { name: "Ahorro Congelado: 90 días¹", yield: "14.50%" },
    { name: "Ahorro Congelado: 180 días¹", yield: "12.36%" }
  ]
};

export async function GET() {
  try {
    // Verificar si tenemos datos frescos
    const isFresh = await isDataFresh('nu');
    console.log('Nu data is fresh:', isFresh);

    if (isFresh) {
      const latestData = await getLatestScraping('nu');
      console.log('Returning cached Nu data');
      return NextResponse.json(latestData?.data || NU_DATA);
    }

    // Si no hay datos frescos, usar datos fijos por ahora
    console.log('Using fixed Nu data');
    await saveScraping('nu', NU_DATA);

    return NextResponse.json(NU_DATA);
  } catch (error: any) {
    console.error('Error in Nu GET:', error);
    // En caso de error, también devolver datos fijos
    return NextResponse.json(NU_DATA);
  }
}
