"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import {
  fetchSolicitudesCancelacionPendientes,
  aprobarSolicitudCancelacion,
  rechazarSolicitudCancelacion,
  type OpcionesDeuda,
} from "../services/pedido-admin.service";
import type { SolicitudCancelacion } from "../types/pedido.types";

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
    mutationFn: ({ id, deuda }: { id: number; deuda?: OpcionesDeuda; yaCancelado: boolean }) =>
      aprobarSolicitudCancelacion(id, deuda),
    onSuccess: (_data, variables) => {
      invalidar();
      Swal.fire({
        title: variables.yaCancelado ? "Revisión guardada" : "Aprobada",
        text: variables.yaCancelado
          ? variables.deuda?.generar_deuda
            ? "Se generó la deuda al cliente."
            : "Se guardó sin generar deuda."
          : "El pedido fue cancelado.",
        icon: "success",
        confirmButtonColor: "#dc2626",
      });
    },
    onError: (error: Error) => {
      Swal.fire({ title: "Error", text: error.message, icon: "error", confirmButtonColor: "#dc2626" });
    },
  });

  const mutationRechazar = useMutation({
    mutationFn: ({ id }: { id: number; yaCancelado: boolean }) => rechazarSolicitudCancelacion(id),
    onSuccess: (_data, variables) => {
      invalidar();
      Swal.fire({
        title: variables.yaCancelado ? "Revisión cerrada" : "Declinada",
        text: variables.yaCancelado
          ? "Sin deuda. El pedido sigue cancelado."
          : "El pedido continúa su curso normal.",
        icon: "success",
        confirmButtonColor: "#dc2626",
      });
    },
    onError: (error: Error) => {
      Swal.fire({ title: "Error", text: error.message, icon: "error", confirmButtonColor: "#dc2626" });
    },
  });

  const handleAprobar = async (solicitud: SolicitudCancelacion) => {
    const sugerido = (solicitud.monto_sugerido ?? 0).toFixed(2);
    const escapar = (t: string) => t.replace(/"/g, "&quot;");

    // Si la pidió el motorizado, el pedido ya está cancelado: solo se revisa y se decide la deuda
    const yaCancelado = !!solicitud.solicitado_por_motorizado_id;

    const result = await Swal.fire({
      title: yaCancelado
        ? `Revisar cancelación del pedido #${solicitud.pedido_id}`
        : `¿Aprobar cancelación del pedido #${solicitud.pedido_id}?`,
      html: `
        <p style="margin-bottom:12px">${
          yaCancelado
            ? "El motorizado ya canceló este pedido. Decide si el cliente queda con una deuda."
            : "El pedido pasará a estado Cancelado y se notificará al cliente."
        }</p>
        <label style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:10px">
          <input type="checkbox" id="swal-deuda" ${solicitud.culpa_cliente ? "checked" : ""} />
          <span><b>Generar deuda al cliente</b>${solicitud.culpa_cliente ? " (el repartidor indicó culpa del cliente)" : ""}</span>
        </label>
        <div id="swal-deuda-campos" style="text-align:left">
          <label style="font-size:13px">Monto (S/) — por defecto el total del pedido</label>
          <input id="swal-monto" class="swal2-input" type="number" min="0.01" step="0.01" value="${sugerido}" style="margin:4px 0 10px;width:100%" />
          <label style="font-size:13px">Motivo de la deuda</label>
          <input id="swal-motivo" class="swal2-input" type="text" maxlength="255" value="${escapar(solicitud.motivo)}" style="margin:4px 0 0;width:100%" />
        </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: yaCancelado ? "Guardar revisión" : "Sí, aprobar y cancelar",
      cancelButtonText: "Volver",
      didOpen: () => {
        const check = document.getElementById("swal-deuda") as HTMLInputElement;
        const campos = document.getElementById("swal-deuda-campos") as HTMLElement;
        const sync = () => (campos.style.display = check.checked ? "block" : "none");
        check.addEventListener("change", sync);
        sync();
      },
      preConfirm: () => {
        const generar = (document.getElementById("swal-deuda") as HTMLInputElement).checked;
        if (!generar) return { generar_deuda: false } as OpcionesDeuda;
        const monto = parseFloat((document.getElementById("swal-monto") as HTMLInputElement).value);
        const motivo = (document.getElementById("swal-motivo") as HTMLInputElement).value.trim();
        if (!monto || monto <= 0) {
          Swal.showValidationMessage("Ingresa un monto mayor a 0");
          return false;
        }
        return { generar_deuda: true, monto, motivo_deuda: motivo || undefined } as OpcionesDeuda;
      },
    });
    if (result.isConfirmed) {
      mutationAprobar.mutate({ id: solicitud.id, deuda: result.value as OpcionesDeuda, yaCancelado });
    }
  };

  const handleRechazar = async (solicitud: SolicitudCancelacion) => {
    const yaCancelado = !!solicitud.solicitado_por_motorizado_id;
    const result = await Swal.fire({
      title: yaCancelado
        ? `¿Cerrar la revisión del pedido #${solicitud.pedido_id} sin deuda?`
        : `¿Declinar cancelación del pedido #${solicitud.pedido_id}?`,
      text: yaCancelado
        ? "El pedido seguirá cancelado y el cliente no quedará con ninguna deuda."
        : "El pedido continuará su curso normal y se notificará al socio.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#6b7280",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: yaCancelado ? "Sí, cerrar sin deuda" : "Sí, declinar",
      cancelButtonText: "Volver",
    });
    if (result.isConfirmed) mutationRechazar.mutate({ id: solicitud.id, yaCancelado });
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
                    {solicitud.solicitante && (
                      <p className="text-xs text-gray-400">{solicitud.solicitante}</p>
                    )}
                    <p>{solicitud.motivo}</p>
                    {solicitud.detalle && (
                      <p className="text-xs text-gray-500">{solicitud.detalle}</p>
                    )}
                    {solicitud.culpa_cliente && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Culpa del cliente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(solicitud.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAprobar(solicitud)}
                        disabled={mutationAprobar.isPending || mutationRechazar.isPending}
                        className="text-green-600 hover:text-green-800 transition disabled:opacity-50"
                        title={solicitud.solicitado_por_motorizado_id ? "Revisar y decidir la deuda (el pedido ya está cancelado)" : "Aprobar (cancela el pedido)"}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRechazar(solicitud)}
                        disabled={mutationAprobar.isPending || mutationRechazar.isPending}
                        className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                        title={solicitud.solicitado_por_motorizado_id ? "Cerrar sin deuda (el pedido sigue cancelado)" : "Declinar (el pedido continúa)"}
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
