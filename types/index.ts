export type Provider = 'nu' | 'cetes' | 'supertasas' | 'finsus' | 'klar' | 'stori' | 'covalto';

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

export interface DbRecord {
  id: string;
  provider: Provider;
  data: ScrapingData;
  created_at: string;
}
