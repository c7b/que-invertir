import { NextResponse } from 'next/server';
import { scrapePage } from '../utils';
import type { ScraperResponse } from '../types';

async function scrapeNu(page: any): Promise<ScraperResponse> {
  try {
    await page.waitForSelector('.DesktopYieldTable__Container-sc-4h2kid-0');

    const yields = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('.DesktopYieldTable__StyledRow-sc-4h2kid-1');
      
      let currentProduct = '';
      let currentData = {
        name: '',
        yield: '',
        gatNominal: '',
        gatReal: ''
      };

      rows.forEach((row, index) => {
        // Obtener el texto del producto (si existe)
        const productText = row.querySelector('.DesktopYieldTable__StyledRowFirstColumnText-sc-4h2kid-5')?.textContent;
        if (productText) {
          // Si tenemos datos anteriores completos, los guardamos
          if (currentData.name && (currentData.yield || currentData.gatNominal)) {
            results.push({ ...currentData });
          }
          // Iniciamos un nuevo producto
          currentProduct = productText.trim();
          currentData = {
            name: currentProduct,
            yield: '',
            gatNominal: '',
            gatReal: ''
          };
        }

        // Obtener el rendimiento (si existe)
        const yieldPercentage = row.querySelector('.DesktopYieldTable__StyledRowPercentage-sc-4h2kid-6')?.textContent;
        if (yieldPercentage) {
          currentData.yield = yieldPercentage.trim();
        }

        // Obtener GAT Nominal y Real
        const gatPercentage = row.querySelector('.DesktopYieldTable__StyledGatPercentage-sc-4h2kid-7')?.textContent;
        if (gatPercentage) {
          // Si ya tenemos GAT Nominal, entonces este es GAT Real
          if (currentData.gatNominal) {
            currentData.gatReal = gatPercentage.trim();
            // Guardar el producto completo
            results.push({ ...currentData });
            // Resetear para el siguiente producto
            currentData = {
              name: currentProduct,
              yield: '',
              gatNominal: '',
              gatReal: ''
            };
          } else {
            currentData.gatNominal = gatPercentage.trim();
          }
        }
      });

      // Asegurarnos de guardar el último producto si tiene datos
      if (currentData.name && (currentData.yield || currentData.gatNominal)) {
        results.push({ ...currentData });
      }

      return results;
    });

    // Ordenar los productos en el orden deseado
    const orderedProducts = yields.reduce((acc: any[], current: any) => {
      const existingProduct = acc.find(p => p.name === current.name);
      if (existingProduct) {
        if (current.yield) existingProduct.yield = current.yield;
        if (current.gatNominal) existingProduct.gatNominal = current.gatNominal;
        if (current.gatReal) existingProduct.gatReal = current.gatReal;
      } else {
        acc.push(current);
      }
      return acc;
    }, []);

    // Definir el orden deseado
    const productOrder = [
      'Cajitas Nu²',
      'Ahorro Congelado: 7 días¹',
      'Ahorro Congelado: 28 días¹',
      'Ahorro Congelado: 90 días¹',
      'Ahorro Congelado: 180 días¹'
    ];

    // Ordenar los productos según el orden definido
    const sortedProducts = orderedProducts.sort((a, b) => {
      const indexA = productOrder.indexOf(a.name);
      const indexB = productOrder.indexOf(b.name);
      return indexA - indexB;
    });

    return {
      success: true,
      data: {
        provider: 'Nu',
        date: new Date().toISOString(),
        products: sortedProducts
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function GET() {
  try {
    const url = 'https://nu.com.mx/cuenta/';
    const result = await scrapePage(url, scrapeNu);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
