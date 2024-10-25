interface ScraperResponse {
  provider: string;
  date: string;
  products: Array<{
    name: string;
    yield: number;
  }>;
  success: boolean;
  error?: string;
}

export async function scrapeCetes(): Promise<ScraperResponse> {
  try {
    const response = await fetch('https://www.cetesdirecto.com/sites/cetes/ticker.json', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const { datos } = await response.json();
    
    return {
      provider: 'cetes', // importante: usar minúsculas consistentemente
      date: new Date().toISOString(),
      products: datos.map(dato => ({
        name: dato.tipo,
        yield: parseFloat(dato.porcentaje.replace('+', '').replace('%', '').split(' (')[0])
      })),
      success: true
    };
  } catch (error) {
    console.error('Error scraping CETES:', error);
    throw error;
  }
}
