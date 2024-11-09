import { supabase } from './supabase';
import type { Provider, ScrapingData } from '@/types';

export async function consolidateInvestments() {
  try {
    const providers: Provider[] = ['cetes', 'nu', 'supertasas', 'covalto', 'finsus', 'klar', 'stori'];
    
    // Get latest record for each provider in a single query
    const { data: latestData, error } = await supabase
      .from('scraping_history')
      .select('*')
      .in('provider', providers)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Create consolidated object with latest data per provider
    const consolidated = providers.reduce((acc, provider) => {
      const latest = latestData
        .filter(d => d.provider === provider)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      if (latest?.data) {
        acc[provider] = latest.data;
      }
      return acc;
    }, {} as Record<Provider, ScrapingData>);

    // Save consolidated data
    const { error: insertError } = await supabase
      .from('consolidated_view')
      .insert({ consolidated_data: consolidated });

    if (insertError) throw insertError;

    return consolidated;
  } catch (error) {
    console.error('Error consolidating investments:', error);
    throw error;
  }
} 