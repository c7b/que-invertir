import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getLatestScraping(provider: 'nu' | 'cetes' | 'supertasas') {
  const { data, error } = await supabase
    .rpc('get_latest_scraping', { provider_name: provider });

  if (error) throw error;
  return data?.[0];
}

export async function saveScraping(provider: 'nu' | 'cetes' | 'supertasas', data: any) {
  const { error } = await supabase
    .from('scraping_history')
    .insert([{ provider, data }]);

  if (error) throw error;
}
