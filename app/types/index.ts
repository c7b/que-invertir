export type Product = {
  name: string;
  yield: number;
  termDays: number;  // nuevo campo normalizado
  originalTerm: string; // mantener el término original
  minimumAmount?: number;
  restrictions?: string[];
  lastUpdated: string; // ISO timestamp
}

export type ScraperResponse = {
  provider: string;
  date: string;
  products: Product[];
}
