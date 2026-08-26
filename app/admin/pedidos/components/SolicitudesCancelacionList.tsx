"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import {
  fetchSolicitudesCancelacionPendientes,
  aprobarSolicitudCancelacion,
  rechazarSolicitudCancelacion,
} from "../services/pedido-admin.service";

export default function SolicitudesCancelacionList() {
  const queryClient = useQueryClient();

  const {
    data: solicitudes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pedidos-cancelacion-solicitudes"],
    queryFn: fetchSolicitudesCancelacionPendientes,
    refetchInterval: 10000,
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ["pedidos-cancelacion-solicitudes"] });
    queryClient.invalidateQueries({ queryKey: ["pedidos-admin"] });
  };

  const mutationAprobar = useMutation({
    mutationFn: (id: number) => aprobarSolicitudCancelacion(id),
    onSuccess: () => {
      invalidar();
      Swal.fire({
        title: "Aprobada",
        text: "El pedido fue cancelado.",
        icon: "success",
        confirmButtonColor: "#dc2626",
      });
    },
    onError: (error: Error) => {
      Swal.fire({ title: "Error", text: error.message, icon: "error", confirmButtonColor: "#dc2626" });
    },
  });

  const mutationRechazar = useMutation({
    mutationFn: (id: number) => rechazarSolicitudCancelacion(id),
    onSuccess: () => {
      invalidar();
      Swal.fire({
        title: "Declinada",
        text: "El pedido continúa su curso normal.",
        icon: "success",
        confirmButtonColor: "#dc2626",
      });
    },
    onError: (error: Error) => {
      Swal.fire({ title: "Error", text: error.message, icon: "error", confirmButtonColor: "#dc2626" });
    },
  });

  const handleAprobar = async (id: number, pedidoId: number) => {
    const result = await Swal.fire({
      title: `¿Aprobar cancelación del pedido #${pedidoId}?`,
      text: "El pedido pasará a estado Cancelado y se notificará al cliente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, aprobar y cancelar",
      cancelButtonText: "Volver",
    });
    if (result.isConfirmed) mutationAprobar.mutate(id);
  };

  const handleRechazar = async (id: number, pedidoId: number) => {
    const result = await Swal.fire({
      title: `¿Declinar cancelación del pedido #${pedidoId}?`,
      text: "El pedido continuará su curso normal y se notificará al socio.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#6b7280",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Sí, declinar",
      cancelButtonText: "Volver",
    });
    if (result.isConfirmed) mutationRechazar.mutate(id);
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          Solicitudes de cancelación pendientes
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          El socio solicitó cancelar estos pedidos porque ya fueron recogidos por el motorizado.
        </p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    #{solicitud.pedido_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {solicitud.pedido?.local || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {solicitud.pedido?.cliente || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    {solicitud.motivo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(solicitud.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAprobar(solicitud.id, solicitud.pedido_id)}
                        disabled={mutationAprobar.isPending || mutationRechazar.isPending}
                        className="text-green-600 hover:text-green-800 transition disabled:opacity-50"
                        title="Aprobar (cancela el pedido)"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRechazar(solicitud.id, solicitud.pedido_id)}
                        disabled={mutationAprobar.isPending || mutationRechazar.isPending}
                        className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                        title="Declinar (el pedido continúa)"
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
  );
}
