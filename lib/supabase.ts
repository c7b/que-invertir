import { createClient } from '@supabase/supabase-js';
import type { Provider, ScrapingData, DbRecord } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getLatestScraping(provider: Provider): Promise<DbRecord | null> {
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

export async function saveScraping(provider: Provider, data: ScrapingData): Promise<void> {
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

  const hasValidData = latestData.data?.products?.length > 0 && 
    latestData.data.products.every((p) => 
      p.name && 
      typeof p.yield === 'number' && 
      typeof p.termDays === 'number'
    );
  
  if (!hasValidData) {
    console.log(`Invalid data structure for ${provider}`);
    return false;
  }

  const lastUpdate = new Date(latestData.created_at);
  const now = new Date();
  const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastUpdate < 24;
}