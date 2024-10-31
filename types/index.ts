export type Provider = 'nu' | 'cetes' | 'supertasas' | 'finsus';

export interface Product {
  name: string;
  yield: number;
  termDays: number;
  originalTerm: string;
  minimumAmount?: number;
  restrictions?: string[];
  lastUpdated: string;
}

export interface ScrapingData {
  provider: Provider;
  date: string;
  products: Product[];
  success: boolean;
  error?: string;
}

// Para tipar las respuestas de Supabase
export interface DbRecord {
  id: string;
  provider: Provider;
  data: ScrapingData;
  created_at: string;
}
