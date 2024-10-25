export interface YieldData {
  provider: string;
  date: string;
  products: Array<{
    name: string;
    yield: string;
    gatNominal?: string;
    gatReal?: string;
  }>;
}

export interface ScraperResponse {
  success: boolean;
  data?: YieldData;
  error?: string;
}

