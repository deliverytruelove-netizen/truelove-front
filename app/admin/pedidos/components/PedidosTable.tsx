"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertCircle, AlertTriangle, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import {
  fetchPedidos,
  cambiarEstadoPedido,
  actualizarFechaPedido,
  getEstadoInfo,
  ESTADOS_PEDIDO,
} from "../services/pedido-admin.service";

// Formato requerido por <input type="datetime-local">: "YYYY-MM-DDTHH:mm"
const toDatetimeLocalValue = (dateString: string) => {
  const date = new Date(dateString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function PedidosTable() {
  const queryClient = useQueryClient();
  const [fecha, setFecha] = useState("hoy");
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["pedidos-admin", fecha, estadoFiltro],
    queryFn: () => fetchPedidos({ fecha, estado: estadoFiltro || undefined }),
    refetchInterval: 15000,
  });

  const mutationEstado = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: number }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-admin"] });
      Swal.fire({
        title: "Estado actualizado",
        icon: "success",
        confirmButtonColor: "#dc2626",
        timer: 1200,
        showConfirmButton: false,
      });
    },
    onError: (error: Error) => {
      Swal.fire({ title: "Error", text: error.message, icon: "error", confirmButtonColor: "#dc2626" });
    },
  });

  const mutationFecha = useMutation({
    mutationFn: ({ id, fecha }: { id: number; fecha: string }) =>
      actualizarFechaPedido(id, fecha),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-admin"] });
      Swal.fire({
        title: "Fecha actualizada",
        icon: "success",
        confirmButtonColor: "#dc2626",
        timer: 1200,
        showConfirmButton: false,
      });
    },
    onError: (error: Error) => {
      Swal.fire({ title: "Error", text: error.message, icon: "error", confirmButtonColor: "#dc2626" });
    },
  });

  const handleEditarFecha = async (id: number, createdAt: string) => {
    const { value: fecha } = await Swal.fire({
      title: `Cambiar fecha del pedido #${id}`,
      input: "datetime-local",
      inputValue: toDatetimeLocalValue(createdAt),
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) return "Selecciona una fecha y hora.";
        return undefined;
      },
    });
    if (fecha) {
      mutationFecha.mutate({ id, fecha });
    }
  };

  const handleCambiarEstado = async (id: number, estadoActual: number | null, nuevoEstado: number) => {
    if (nuevoEstado === estadoActual) return;
    const result = await Swal.fire({
      title: `¿Cambiar el pedido #${id} a "${getEstadoInfo(nuevoEstado).label}"?`,
      text: "Este cambio es manual y no pasa por las validaciones normales de flujo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      mutationEstado.mutate({ id, estado: nuevoEstado });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
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
          <p className="text-gray-600">Error al cargar los pedidos</p>
        </div>
      </div>
    );
  }

  const pedidos = data?.data || [];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center gap-4 justify-between">
        <h2 className="text-xl font-bold text-gray-900">Pedidos</h2>
        <div className="flex gap-3">
          <select
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="hoy">Hoy</option>
            <option value="todas">Todas las fechas</option>
          </select>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {pedidos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay pedidos para los filtros seleccionados</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motorizado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cambiar estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pedidos.map((pedido) => {
                const estadoInfo = getEstadoInfo(pedido.ultimo_estado_tracking);
                return (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      #{pedido.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pedido.local || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pedido.cliente || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pedido.motorizado_nombre || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {formatDate(pedido.created_at)}
                        {pedido.ultimo_estado_tracking === 8 && (
                          <button
                            onClick={() => handleEditarFecha(pedido.id, pedido.created_at)}
                            disabled={mutationFecha.isPending}
                            className="text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                            title="Editar fecha del pedido"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                        {estadoInfo.label}
                      </span>
                      {pedido.solicitud_cancelacion_pendiente && (
                        <span
                          className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                          title={pedido.solicitud_cancelacion_pendiente.motivo}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Solicitud pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value=""
                        onChange={(e) =>
                          handleCambiarEstado(pedido.id, pedido.ultimo_estado_tracking, Number(e.target.value))
                        }
                        disabled={mutationEstado.isPending}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="" disabled>
                          Cambiar a...
                        </option>
                        {ESTADOS_PEDIDO.map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
