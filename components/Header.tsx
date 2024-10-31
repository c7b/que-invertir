'use client';

import { useState, useEffect } from 'react';

export function Header() {
  const [currentDate, setCurrentDate] = useState('');
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    // Solo actualizamos la fecha una vez que estamos en el cliente
    setCurrentDate(new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
    setDateTime(new Date().toISOString());
  }, []);

  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold mb-2">
        Comparador de Rendimientos México
      </h1>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Actualización en tiempo real
        </div>
        <span className="text-gray-400">•</span>
        {currentDate && (
          <time dateTime={dateTime} className="text-gray-400">
            {currentDate}
          </time>
        )}
      </div>
    </header>
  );
} 