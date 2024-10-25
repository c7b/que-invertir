import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Tipos
type Provider = 'nu' | 'cetes' | 'supertasas';

interface ScrapingData {
  id: string;
  provider: Provider;
  data: any;
  created_at: string;
}

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Funciones de utilidad
export async function getLatestScraping(provider: Provider): Promise<ScrapingData | null> {
  const { data, error } = await supabase
    .from('scraping_history')
    .select('*')
    .eq('provider', provider)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest scraping:', error);
    return null;
  }

  return data;
}

export async function saveScraping(provider: Provider, data: any): Promise<void> {
  const { error } = await supabase
    .from('scraping_history')
    .insert([{ provider, data }]);

  if (error) {
    console.error('Error saving scraping:', error);
    throw error;
  }
}

export async function isDataFresh(provider: Provider): Promise<boolean> {
  const latestData = await getLatestScraping(provider);
  if (!latestData) return false;

  // Validar estructura y contenido de los datos
  const hasValidData = latestData.data?.products?.length > 0 && 
    latestData.data.products.every((p: any) => p.name && p.yield);
  
  if (!hasValidData) {
    console.log(`Invalid data structure for ${provider}`);
    return false;
  }

  const lastUpdate = new Date(latestData.created_at);
  const now = new Date();
  const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastUpdate < 24;
}
