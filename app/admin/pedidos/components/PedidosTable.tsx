"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertCircle, AlertTriangle, Pencil, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [localInput, setLocalInput] = useState("");
  const [localFiltro, setLocalFiltro] = useState("");
  const [page, setPage] = useState(1);

  // Debounce del buscador de locales para no disparar una request por tecla.
  useEffect(() => {
    const timeout = setTimeout(() => setLocalFiltro(localInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [localInput]);

  // Cualquier cambio de filtro vuelve a la página 1.
  useEffect(() => {
    setPage(1);
  }, [fechaDesde, fechaHasta, estadoFiltro, localFiltro]);

  const hayFiltros = !!(fechaDesde || fechaHasta || estadoFiltro || localFiltro);

  const limpiarFiltros = () => {
    setFechaDesde("");
    setFechaHasta("");
    setEstadoFiltro("");
    setLocalInput("");
    setLocalFiltro("");
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["pedidos-admin", fechaDesde, fechaHasta, estadoFiltro, localFiltro, page],
    queryFn: () =>
      fetchPedidos({
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        estado: estadoFiltro || undefined,
        local: localFiltro || undefined,
        page,
      }),
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
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-end gap-3">
        <h2 className="text-xl font-bold text-gray-900 mr-2">Pedidos</h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            max={fechaHasta || undefined}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            min={fechaDesde || undefined}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Estado</label>
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

        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs text-gray-500">Local</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="Buscar local..."
              className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm w-full"
            />
          </div>
        </div>

        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition px-2 py-2"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
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

      {data && data.last_page > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <span>
            Página {data.current_page} de {data.last_page} · {data.total} pedidos
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.current_page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
              disabled={data.current_page >= data.last_page}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
