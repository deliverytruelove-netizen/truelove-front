import React, { useState } from 'react';
import { Calendar, Clock, Package, X, Check, AlertCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchEntregaCalendarios, actualizarEstadoEntrega }from "@/app/admin/motorizado/services/motorizado.service";
import type { EntregaCalendario } from '@/app/admin/motorizado/types/motorizado.types';

interface EntregaCalendarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  motorizadoId: number;
  motorizadoNombre: string;
}

export const EntregaCalendarioModal: React.FC<EntregaCalendarioModalProps> = ({
  isOpen,
  onClose,
  motorizadoId,
  motorizadoNombre,
}) => {
  const queryClient = useQueryClient();
  const [, setSelectedEntrega] = useState<number | null>(null);

  const { data: entregas = [], isLoading } = useQuery<EntregaCalendario[]>({
    queryKey: ['entrega-calendario', motorizadoId],
    queryFn: () => fetchEntregaCalendarios(motorizadoId),
    enabled: isOpen && !!motorizadoId,
  });

  const mutationEstado = useMutation({
    mutationFn: ({ entregaId, estado }: { entregaId: number; estado: string }) =>
      actualizarEstadoEntrega(entregaId, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrega-calendario', motorizadoId] });
      setSelectedEntrega(null);
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'entregado':
        return <Check className="w-4 h-4" />;
      case 'cancelado':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Calendario de Entrega de Materiales
              </h2>
              <p className="text-sm text-gray-600">{motorizadoNombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando calendario...</span>
            </div>
          ) : entregas.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay entregas programadas
              </h3>
              <p className="text-gray-500">
                Este motorizado no ha programado ninguna entrega de materiales.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {entregas.length} entrega{entregas.length !== 1 ? 's' : ''} programada{entregas.length !== 1 ? 's' : ''}
                </span>
              </div>

              {entregas.map((entrega) => (
                <div
                  key={entrega.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {formatDate(entrega.fecha)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">
                            {formatTime(entrega.hora)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
                            entrega.estado
                          )}`}
                        >
                          {getEstadoIcon(entrega.estado)}
                          {entrega.estado.charAt(0).toUpperCase() + entrega.estado.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Programado el {new Date(entrega.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {entrega.estado === 'pendiente' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            mutationEstado.mutate({
                              entregaId: entrega.id,
                              estado: 'entregado',
                            });
                          }}
                          disabled={mutationEstado.isPending}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Marcar Entregado
                        </button>
                        <button
                          onClick={() => {
                            mutationEstado.mutate({
                              entregaId: entrega.id,
                              estado: 'cancelado',
                            });
                          }}
                          disabled={mutationEstado.isPending}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};