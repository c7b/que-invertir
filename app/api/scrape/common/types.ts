export type Provider = 'nu' | 'cetes' | 'supertasas';

export interface Product {
  name: string;
  yield: string;
  gatNominal?: string;
  gatReal?: string;
}

export interface ScraperResponse {
  provider: string;
  date: string;
  products: Product[];
}
