"use client";

import { useEffect, useState } from 'react';

interface Product {
  name: string;
  yield: string;
}

interface ProviderData {
  provider: string;
  date: string;
  products: Product[];
}

function ProviderCard({ data, isLoading, error, provider }: { 
  data: any; 
  isLoading: boolean;
  error: string | null;
  provider: 'nu' | 'cetes' | 'supertasas';
}) {
  // Función para obtener el color del título según el proveedor
  const getTitleColor = () => {
    switch (provider) {
      case 'nu':
        return 'text-[#7b4dd6]';
      case 'supertasas':
        return 'text-[#002C66]';
      case 'cetes':
      default:
        return 'text-blue-600';
    }
  };

  if (isLoading) {
    return (
      <section className="bg-white rounded-lg shadow-lg p-6 min-h-[200px]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-500">Error: {error}</div>
      </section>
    );
  }

  if (!data) return null;

  const items = data.products || (data.datos ? data.datos.map((item: any) => ({
    name: item.tipo,
    yield: item.porcentaje
  })) : []);

  return (
    <section className="bg-white rounded-lg shadow-lg p-6">
      <h2 className={`text-2xl font-semibold mb-4 ${getTitleColor()}`}>
        {data.provider || 'CETES Directo'}
      </h2>
      <div className="space-y-4">
        {items.map((product: any, index: number) => (
          <div key={index} className="border-b pb-4">
            <h3 className="font-medium text-gray-800">{product.name}</h3>
            <p className="mt-2 text-lg text-green-600 font-semibold">
              {typeof product.yield === 'number' 
                ? `${product.yield}%` 
                : product.yield.includes('%') 
                  ? product.yield 
                  : `${product.yield}%`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [providers, setProviders] = useState({
    nu: { data: null, loading: true, error: null },
    cetes: { data: null, loading: true, error: null },
    supertasas: { data: null, loading: true, error: null },
  });

  useEffect(() => {
    // Fetch Nu data
    fetch('/api/scrape/nu')
      .then(res => res.json())
      .then(data => {
        setProviders(prev => ({
          ...prev,
          nu: { data, loading: false, error: null }
        }));
      })
      .catch(error => {
        setProviders(prev => ({
          ...prev,
          nu: { data: null, loading: false, error: error.message }
        }));
      });

    // Fetch CETES data
    fetch('/api/scrape/cetes')
      .then(res => res.json())
      .then(data => {
        setProviders(prev => ({
          ...prev,
          cetes: { data, loading: false, error: null }
        }));
      })
      .catch(error => {
        setProviders(prev => ({
          ...prev,
          cetes: { data: null, loading: false, error: error.message }
        }));
      });

    // Fetch SuperTasas data
    fetch('/api/scrape/supertasas')
      .then(res => res.json())
      .then(data => {
        setProviders(prev => ({
          ...prev,
          supertasas: { data, loading: false, error: null }
        }));
      })
      .catch(error => {
        setProviders(prev => ({
          ...prev,
          supertasas: { data: null, loading: false, error: error.message }
        }));
      });
  }, []);

  return (
    <main className="container mx-auto p-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Comparador de Rendimientos</h1>
        <p className="text-sm text-gray-600">
          Actualización en tiempo real
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <ProviderCard 
          data={providers.nu.data}
          isLoading={providers.nu.loading}
          error={providers.nu.error}
          provider="nu"
        />
        <ProviderCard 
          data={providers.cetes.data}
          isLoading={providers.cetes.loading}
          error={providers.cetes.error}
          provider="cetes"
        />
        <ProviderCard 
          data={providers.supertasas.data}
          isLoading={providers.supertasas.loading}
          error={providers.supertasas.error}
          provider="supertasas"
        />
      </div>
    </main>
  );
}
