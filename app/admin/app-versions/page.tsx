'use client';

import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import AppVersionModal from './components/AppVersionModal';
import { useQuery } from '@tanstack/react-query';
import { fetchAppVersions } from './services/AppVersion.service';
import type { AppVersion } from './types/AppVersion.types';
import { Edit2, Smartphone, Apple, AlertTriangle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const APP_NAME_LABELS: Record<string, string> = {
  cliente: 'App Cliente',
  socio: 'App Socio',
  motorizado: 'App Motorizado',
};

const AppVersionsContent: React.FC = () => {
  const [seleccionada, setSeleccionada] = useState<AppVersion | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const { data: versiones = [], isLoading } = useQuery<AppVersion[]>({
    queryKey: ['app-versions'],
    queryFn: fetchAppVersions,
  });

  const handleAbrirModal = (version: AppVersion) => {
    setSeleccionada(version);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setSeleccionada(null);
  };

  return (
    <div className="space-y-4 pt-4 pb-20">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-2">
          <Smartphone className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-gray-700">Versiones de las Apps</h3>
          <span className="text-xs text-gray-400 font-normal">
            Controla la versión mínima, la más reciente y la actualización forzada por app y plataforma
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            <span className="ml-2 text-sm text-gray-500">Cargando versiones...</span>
          </div>
        ) : versiones.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No hay configuraciones de versión registradas.
          </div>
        ) : (
          <>
            {/* Tabla desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Android</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">iOS</th>
                    <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {versiones.map(version => (
                    <tr key={version.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-800 text-sm">
                          {APP_NAME_LABELS[version.app_name] ?? version.app_name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        <PlataformaInfo
                          min={version.min_version_android ?? version.min_version}
                          latest={version.latest_version_android ?? version.latest_version}
                          forzada={version.force_update_android ?? version.force_update}
                        />
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        <PlataformaInfo
                          min={version.min_version_ios ?? version.min_version}
                          latest={version.latest_version_ios ?? version.latest_version}
                          forzada={version.force_update_ios ?? version.force_update}
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleAbrirModal(version)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="sm:hidden divide-y divide-gray-100">
              {versiones.map(version => (
                <div key={version.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {APP_NAME_LABELS[version.app_name] ?? version.app_name}
                    </p>
                    <button
                      onClick={() => handleAbrirModal(version)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors flex-shrink-0"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <Smartphone className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <PlataformaInfo
                      min={version.min_version_android ?? version.min_version}
                      latest={version.latest_version_android ?? version.latest_version}
                      forzada={version.force_update_android ?? version.force_update}
                    />
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <Apple className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <PlataformaInfo
                      min={version.min_version_ios ?? version.min_version}
                      latest={version.latest_version_ios ?? version.latest_version}
                      forzada={version.force_update_ios ?? version.force_update}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <AppVersionModal
        appVersion={seleccionada}
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
      />
    </div>
  );
};

const AppVersionsPage: React.FC = () => (
  <MainLayout>
    <AppVersionsContent />
  </MainLayout>
);

const PlataformaInfo: React.FC<{ min: string; latest: string; forzada: boolean }> = ({ min, latest, forzada }) => (
  <span className="inline-flex items-center gap-1.5">
    mín. {min} · últ. {latest}
    {forzada && (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
        <AlertTriangle className="w-2.5 h-2.5" /> forzada
      </span>
    )}
  </span>
);

export default AppVersionsPage;
