"use client";

import { useEffect, useState } from 'react';

const PROVIDERS = {
  nu: {
    label: 'Nu',
    color: 'text-[#7b4dd6]'
  },
  cetes: {
    label: 'CETES',
    color: 'text-blue-600'
  },
  supertasas: {
    label: 'SuperTasas',
    color: 'text-[#002C66]'
  },
  finsus: {
    label: 'Finsus',
    color: 'text-[#00A19B]'
  },
  klar: {
    label: 'Klar',
    color: 'text-[#1c1c1c]'
  },
  stori: {
    label: 'Stori',
    color: 'text-[#003a40]'
  },
  covalto: {
    label: 'Covalto',
    color: 'text-[#ffab4d]'
  }
} as const;

const TERMS = [
  { label: 'A la vista', days: 1 },
  { label: '7 días', days: 7 },
  { label: '28-30 días', days: [28, 30] as number[] },
  { label: '90 días', days: [90, 91] as number[] },
  { label: '180 días', days: [180, 182] as number[] },
  { label: '365 días', days: [360, 364, 365] as number[] },
  { label: '3 años', days: 1095 },
  { label: '5 años', days: 1825 },
  { label: '10 años', days: 3650 },
  { label: '20 años', days: 7300 },
  { label: '30 años', days: 10950 },
] as const;

function YieldTable({ providers }: { 
  providers: Record<keyof typeof PROVIDERS, {
    data: any;
    loading: boolean;
    error: string | null;
  }>;
}) {
  const getBestYield = (termDays: number | number[]) => {
    let maxYield = -1;
    Object.entries(providers).forEach(([_, { data }]) => {
      const yield_ = data?.products?.find(p => 
        Array.isArray(termDays) 
          ? termDays.includes(p.termDays)
          : p.termDays === termDays
      )?.yield ?? -1;
      maxYield = Math.max(maxYield, yield_);
    });
    return maxYield;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow-sm border border-gray-100">
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 bg-gray-50 px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-xl">
              Institución
            </th>
            {TERMS.map((term, index) => (
              <th 
                key={term.label} 
                scope="col" 
                className={`bg-gray-50 px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider
                  ${index === TERMS.length - 1 ? 'rounded-tr-xl' : ''}`}
              >
                {term.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {Object.entries(providers).map(([key, { data, loading, error }]) => (
            <tr key={key} className="hover:bg-gray-50 transition-colors">
              <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap">
                <span className={`font-bold ${PROVIDERS[key as keyof typeof PROVIDERS].color}`}>
                  {PROVIDERS[key as keyof typeof PROVIDERS].label}
                </span>
              </td>
              {TERMS.map(term => {
                const value = data?.products?.find(p => 
                  Array.isArray(term.days) 
                    ? term.days.includes(p.termDays)
                    : p.termDays === term.days
                )?.yield;
                const bestYield = getBestYield(term.days);

                return (
                  <td key={`${key}-${term.label}`} className="px-6 py-4 whitespace-nowrap text-center">
                    {loading ? (
                      <div className="animate-pulse h-5 w-16 bg-gray-200 rounded mx-auto" />
                    ) : error ? (
                      <span className="text-red-500 text-sm">Error</span>
                    ) : (
                      <span className={`text-sm font-semibold ${
                        !value ? 'text-gray-400' :
                        value === bestYield ? 'text-green-600 font-bold' :
                        'text-gray-600'
                      }`}>
                        {value ? `${value.toFixed(2)}%` : '-'}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const [providers, setProviders] = useState({
    nu: { data: null, loading: true, error: null },
    cetes: { data: null, loading: true, error: null },
    supertasas: { data: null, loading: true, error: null },
    finsus: { data: null, loading: true, error: null },
    klar: { data: null, loading: true, error: null },
    stori: { data: null, loading: true, error: null },
    covalto: { data: null, loading: true, error: null }
  });

  useEffect(() => {
    Object.keys(PROVIDERS).forEach(provider => {
      fetch(`/api/scrape/${provider}`)
        .then(res => res.json())
        .then(data => {
          setProviders(prev => ({
            ...prev,
            [provider]: { data, loading: false, error: null }
          }));
        })
        .catch(error => {
          setProviders(prev => ({
            ...prev,
            [provider]: { data: null, loading: false, error: error.message }
          }));
        });
    });
  }, []);

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Comparador de Rendimientos</h1>
        <p className="text-sm text-gray-600">
          Actualización en tiempo real
        </p>
      </header>

      <YieldTable providers={providers} />
    </main>
  );
}
