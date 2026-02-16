'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Calculator } from 'lucide-react';
import MainLayout from '../components/MainLayout';

export default function KilometrosTarifaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <MainLayout>
      <div>
        {/*sin Título */}
       
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              href="/admin/kilometros-tarifa"
              className={`${
                isActive('/admin/kilometros-tarifa')
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Configuración de Tarifas
            </Link>
            <Link
              href="/admin/kilometros-tarifa/simulador-tarifa"
              className={`${
                isActive('/admin/kilometros-tarifa/simulador-tarifa')
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
            >
              <Calculator className="w-4 h-4" />
              Simulador de Tarifas
            </Link>
          </nav>
        </div>

        {/* Contenido */}
        {children}
      </div>
    </MainLayout>
  );
}
