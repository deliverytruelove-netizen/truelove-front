'use client';

import React, { useState } from 'react';
import LocalTarifaModal from './components/LocalTarifaModal';
import { useQuery } from '@tanstack/react-query';
import { fetchLocalesConConfig } from './services/KilometrosTarifa.service';
import type { LocalConConfig } from './types/KilometrosTarifa.types';
import { Store, Plus, Edit2, Globe, Info, Bell, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const KilometrosTarifaPage: React.FC = () => {
  const [localSeleccionado, setLocalSeleccionado] = useState<LocalConConfig | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [notifOculta, setNotifOculta] = useState(false);

  const { data: locales = [], isLoading: isLoadingLocales } = useQuery<LocalConConfig[]>({
    queryKey: ['locales-con-config'],
    queryFn: fetchLocalesConConfig,
  });

  const handleAbrirModal = (local: LocalConConfig) => {
    setLocalSeleccionado(local);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setLocalSeleccionado(null);
  };

  const localesConConfig = locales.filter(l => l.tiene_config_propia);
  const localesSinConfig = locales.filter(l => !l.tiene_config_propia);
  const mostrarAvisoGlobal = localesSinConfig.length > 0;
  const mostrarNotif = !notifOculta && localesSinConfig.length > 0;

  return (
    <div className="space-y-4 pt-4 pb-20">

      {/* Notificación flotante */}
      {mostrarNotif && (
        <div className="fixed bottom-5 right-4 z-40 max-w-xs w-[calc(100vw-2rem)] sm:w-80 bg-amber-500 text-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
          <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed flex-1">
            <strong>{localesSinConfig.length} {localesSinConfig.length === 1 ? 'local' : 'locales'}</strong> sin tarifa personalizada.
            Están usando la tarifa global por defecto.
          </p>
          <button onClick={() => setNotifOculta(true)} className="text-white/70 hover:text-white flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sección: Tarifas por Local */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-2">
          <Store className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-gray-700">Tarifas por Local</h3>
          <span className="text-xs text-gray-400 font-normal">
            {localesConConfig.length} con tarifa propia · {localesSinConfig.length} usando global
          </span>
        </div>

        {/* Aviso config global — solo si hay locales sin config */}
        {mostrarAvisoGlobal && (
          <div className="mx-4 sm:mx-5 mt-4 bg-blue-50 border border-blue-100 rounded-lg overflow-hidden">
            <div className="flex items-start gap-2 px-4 py-2.5 border-b border-blue-100">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Los locales marcados como <span className="font-semibold">Global</span> usan esta configuración por defecto.
                Para modificarla ve a la pestaña <span className="font-semibold">Configuración de Tarifas</span>.
              </p>
            </div>

          </div>
        )}

        {isLoadingLocales ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            <span className="ml-2 text-sm text-gray-500">Cargando locales...</span>
          </div>
        ) : locales.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No hay locales activos registrados.
          </div>
        ) : (
          <>
            {/* Tabla desktop */}
            <div className="hidden sm:block overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modo</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                    <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {locales.map(local => (
                    <tr key={local.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-800 text-sm">{local.nombre}</span>
                      </td>
                      <td className="px-5 py-3">
                        <ModoBadge local={local} />
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        <DetallesTexto local={local} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <BotonAccion local={local} onAbrir={handleAbrirModal} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="sm:hidden divide-y divide-gray-100 mt-3">
              {locales.map(local => (
                <div key={local.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm truncate">{local.nombre}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <ModoBadge local={local} />
                      <span className="text-xs text-gray-400"><DetallesTexto local={local} /></span>
                    </div>
                  </div>
                  <BotonAccion local={local} onAbrir={handleAbrirModal} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <LocalTarifaModal
        local={localSeleccionado}
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
      />
    </div>
  );
};

// Sub-componentes para evitar repetición
const ModoBadge: React.FC<{ local: LocalConConfig }> = ({ local }) => {
  if (!local.tiene_config_propia) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <Globe className="w-3 h-3" /> Global
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      local.config?.modo_tarifa === 'precio_por_km'
        ? 'bg-purple-100 text-purple-700'
        : 'bg-blue-100 text-blue-700'
    }`}>
      {local.config?.modo_tarifa === 'precio_por_km' ? 'Precio/km' : 'Por rangos'}
    </span>
  );
};

const DetallesTexto: React.FC<{ local: LocalConConfig }> = ({ local }) => {
  if (!local.tiene_config_propia || !local.config) {
    return <span className="text-gray-400 italic">Usa configuración global</span>;
  }
  if (local.config.modo_tarifa === 'precio_por_km') {
    return (
      <span>
        Base S/ {Number(local.config.precio_base_diurno ?? 0).toFixed(2)} · S/ {Number(local.config.precio_por_km_diurno ?? 0).toFixed(2)}/km
      </span>
    );
  }
  return <span>{local.config.rangos?.length ?? 0} rangos configurados</span>;
};

const BotonAccion: React.FC<{ local: LocalConConfig; onAbrir: (l: LocalConConfig) => void }> = ({ local, onAbrir }) => (
  <button
    onClick={() => onAbrir(local)}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
      local.tiene_config_propia
        ? 'bg-brand-50 text-brand-600 hover:bg-brand-100'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {local.tiene_config_propia
      ? <><Edit2 className="w-3.5 h-3.5" /> Editar</>
      : <><Plus className="w-3.5 h-3.5" /> Asignar</>
    }
  </button>
);

export default KilometrosTarifaPage;
