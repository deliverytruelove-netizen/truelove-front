"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Eye, Loader2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import {
  fetchSolicitudesPendientes,
  fetchEstadisticas,
  aprobarSolicitud,
} from "../services/solicitud-eliminacion.service";
import { SolicitudEliminacion } from "../types/solicitud-eliminacion.types";
import DetalleModal from "./DetalleModal";
import RechazarModal from "./RechazarModal";

export default function SolicitudesList() {
  const queryClient = useQueryClient();
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<SolicitudEliminacion | null>(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showRechazarModal, setShowRechazarModal] = useState(false);

  // Queries
  const {
    data: solicitudes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["solicitudes-eliminacion-pendientes"],
    queryFn: fetchSolicitudesPendientes,
  });

  const { data: stats } = useQuery({
    queryKey: ["solicitudes-eliminacion-stats"],
    queryFn: fetchEstadisticas,
  });

  // Mutation para aprobar
  const mutationAprobar = useMutation({
    mutationFn: (id: number) => aprobarSolicitud(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["solicitudes-eliminacion-pendientes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["solicitudes-eliminacion-stats"],
      });
      Swal.fire({
        title: "¡Aprobada!",
        text: "La solicitud ha sido aprobada y la cuenta eliminada exitosamente",
        icon: "success",
        confirmButtonColor: "#dc2626",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    },
  });

  // Handlers
  const handleVerDetalle = (solicitud: SolicitudEliminacion) => {
    setSelectedSolicitud(solicitud);
    setShowDetalleModal(true);
  };

  const handleAprobar = async (solicitud: SolicitudEliminacion) => {
    const result = await Swal.fire({
      title: "¿Aprobar solicitud?",
      html: `
        <p class="text-sm text-gray-600 mb-2">Cliente: <strong>${solicitud.cliente.nombre} ${solicitud.cliente.apellido}</strong></p>
        <p class="text-sm text-gray-600">ID: <strong>${solicitud.request_id}</strong></p>
        <div class="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p class="text-sm text-red-800"><strong>⚠️ Esta acción eliminará permanentemente:</strong></p>
          <ul class="text-xs text-red-700 mt-2 text-left list-disc list-inside">
            <li>La cuenta del cliente</li>
            <li>Todos sus datos personales</li>
            <li>Su historial de pedidos</li>
            <li>Sus direcciones guardadas</li>
          </ul>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, aprobar y eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      mutationAprobar.mutate(solicitud.id);
    }
  };

  const handleRechazar = (solicitud: SolicitudEliminacion) => {
    setSelectedSolicitud(solicitud);
    setShowRechazarModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Error al cargar las solicitudes</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Aprobadas</p>
            <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 mb-1">Rechazadas</p>
            <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Solicitudes Pendientes
          </h2>
        </div>

        <div className="overflow-x-auto">
          {solicitudes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay solicitudes pendientes</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Solicitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Solicitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-600">
                        {solicitud.request_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {solicitud.cliente.nombre} {solicitud.cliente.apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {solicitud.cliente.documento}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {solicitud.cliente.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(solicitud.requested_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerDetalle(solicitud)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAprobar(solicitud)}
                          className="text-green-600 hover:text-green-800 transition"
                          title="Aprobar"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRechazar(solicitud)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Rechazar"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modales */}
      {showDetalleModal && selectedSolicitud && (
        <DetalleModal
          solicitud={selectedSolicitud}
          onClose={() => {
            setShowDetalleModal(false);
            setSelectedSolicitud(null);
          }}
        />
      )}

      {showRechazarModal && selectedSolicitud && (
        <RechazarModal
          solicitud={selectedSolicitud}
          onClose={() => {
            setShowRechazarModal(false);
            setSelectedSolicitud(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["solicitudes-eliminacion-pendientes"],
            });
            queryClient.invalidateQueries({
              queryKey: ["solicitudes-eliminacion-stats"],
            });
          }}
        />
      )}
    </>
  );
}
