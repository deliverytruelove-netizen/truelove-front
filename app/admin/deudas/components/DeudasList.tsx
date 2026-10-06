// app\admin\deudas\components\DeudasList.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Ban,
  CheckCircle,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import { actualizarDeuda, eliminarDeuda, fetchDeudas } from "../services/deudas.service";
import { Deuda, EstadoDeuda } from "../types/deudas.types";
import DeudaFormModal from "./DeudaFormModal";

const FILTROS: { valor: EstadoDeuda | "todas"; etiqueta: string }[] = [
  { valor: "pendiente", etiqueta: "Solo pendientes" },
  { valor: "pagado", etiqueta: "Pagadas" },
  { valor: "anulado", etiqueta: "Revocadas" },
  { valor: "todas", etiqueta: "Todas" },
];

const BADGE: Record<EstadoDeuda, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  pagado: "bg-green-100 text-green-800",
  anulado: "bg-gray-200 text-gray-700",
};

const ETIQUETA: Record<EstadoDeuda, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  anulado: "Revocada",
};

export default function DeudasList() {
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState<EstadoDeuda | "todas">("pendiente");
  const [busqueda, setBusqueda] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ abierto: boolean; deuda: Deuda | null }>({
    abierto: false,
    deuda: null,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["deudas-clientes", estado, q, page],
    queryFn: () =>
      fetchDeudas({ estado: estado === "todas" ? undefined : estado, q: q || undefined, page }),
  });

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["deudas-clientes"] });

  const avisoError = (err: unknown) =>
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err instanceof Error ? err.message : "Ocurrió un error",
      confirmButtonColor: "#dc2626",
    });

  const mutEstado = useMutation({
    mutationFn: ({
      id,
      nuevo,
      observaciones,
    }: {
      id: number;
      nuevo: EstadoDeuda;
      observaciones?: string;
    }) =>
      actualizarDeuda(id, {
        estado: nuevo,
        ...(observaciones ? { observaciones_admin: observaciones } : {}),
      }),
    onSuccess: refrescar,
    onError: avisoError,
  });
  const mutEliminar = useMutation({
    mutationFn: (id: number) => eliminarDeuda(id),
    onSuccess: refrescar,
    onError: avisoError,
  });

  const cambiarEstado = async (d: Deuda, nuevo: "pagado" | "anulado") => {
    const pagar = nuevo === "pagado";
    const result = await Swal.fire({
      title: pagar ? "¿Marcar como pagada?" : "¿Revocar esta deuda?",
      html: `<p><b>${d.cliente ?? "Cliente"}</b> · S/ ${d.monto}</p><p style="margin-top:8px">El cliente podrá volver a hacer pedidos de inmediato (si no tiene otras deudas pendientes) y recibirá un aviso.</p>`,
      input: "text",
      inputPlaceholder: pagar
        ? "Nota (opcional): cómo pagó"
        : "Motivo de la revocación (opcional)",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: pagar ? "#16a34a" : "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: pagar ? "Sí, marcar pagada" : "Sí, revocar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    // La nota queda en las observaciones, junto a lo que ya hubiera
    const nota = (result.value as string | undefined)?.trim();
    const etiqueta = pagar ? "Pagada" : "Revocada";
    const observaciones = nota
      ? [d.observaciones_admin, `${etiqueta}: ${nota}`].filter(Boolean).join(" | ")
      : undefined;
    mutEstado.mutate({ id: d.id, nuevo, observaciones });
  };

  const reactivar = async (d: Deuda) => {
    const result = await Swal.fire({
      title: "¿Reactivar la deuda?",
      html: `<p><b>${d.cliente ?? "Cliente"}</b> · S/ ${d.monto}</p><p style="margin-top:8px">Vuelve a quedar pendiente y el cliente no podrá hacer pedidos hasta regularizarla.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) mutEstado.mutate({ id: d.id, nuevo: "pendiente" });
  };
  const handleEliminar = async (d: Deuda) => {
    const result = await Swal.fire({
      title: "¿Eliminar la deuda?",
      text: "Se borra el registro del sistema. Úsalo solo si se creó por error.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) mutEliminar.mutate(d.id);
  };

  const conteos = data?.conteos;
  const deudas = data?.deudas.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deudas de clientes</h1>
          <p className="text-sm text-gray-500">
            Mientras un cliente tenga una deuda pendiente no puede hacer pedidos nuevos. Al marcarla
            como pagada o condonarla, se desbloquea de inmediato.
          </p>
        </div>
        <button
          onClick={() => setModal({ abierto: true, deuda: null })}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
        >
          <Plus className="w-4 h-4" /> Crear deuda manual
        </button>
      </div>

      {conteos && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold">{conteos.pendiente}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Monto por cobrar</p>
            <p className="text-2xl font-bold">S/ {conteos.monto_pendiente.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Pagadas</p>
            <p className="text-2xl font-bold">{conteos.pagado}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
            <p className="text-sm text-gray-500">Revocadas</p>
            <p className="text-2xl font-bold">{conteos.anulado}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              onClick={() => {
                setEstado(f.valor);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                estado === f.valor
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQ(busqueda.trim());
            setPage(1);
          }}
          className="flex gap-2 md:ml-auto"
        >
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, DNI, teléfono o N.º de pedido"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64"
          />
          <button type="submit" className="px-3 py-1.5 bg-gray-800 text-white rounded-lg" title="Buscar">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-12 text-red-600">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p>{error instanceof Error ? error.message : "Error al cargar las deudas"}</p>
        </div>
      ) : deudas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          No hay deudas en esta vista.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Cliente", "Teléfono", "Pedido", "Reportó", "Motivo", "Monto", "Estado", "Fecha", "Acciones"].map(
                  (t) => (
                    <th
                      key={t}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deudas.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium text-gray-900">{d.cliente || "—"}</p>
                    <p className="text-xs text-gray-500">{d.documento || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{d.telefono || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {d.pedido_id ? `#${d.pedido_id}` : "Manual"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {d.motorizado || (d.registrado_por === "admin" ? "Admin" : "—")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                    <p>{d.motivo}</p>
                    {d.observaciones_admin && (
                      <p className="text-xs text-gray-500">{d.observaciones_admin}</p>
                    )}
                    {d.foto_evidencia_url && (
                      <a
                        href={d.foto_evidencia_url}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver foto de evidencia"
                        className="inline-block mt-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={d.foto_evidencia_url}
                          alt="Evidencia del motorizado"
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <span className="block text-xs text-blue-600 mt-1">Ver evidencia</span>
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    S/ {d.monto}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${BADGE[d.estado]}`}>
                      {ETIQUETA[d.estado]}
                    </span>
                    {d.estado !== "pendiente" && d.gestionada_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(d.gestionada_at).toLocaleDateString("es-ES")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(d.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      {d.estado === "pendiente" && (
                        <>
                          <button
                            onClick={() => cambiarEstado(d, "pagado")}
                            className="text-green-600 hover:text-green-800"
                            title="Marcar como pagada"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => cambiarEstado(d, "anulado")}
                            className="text-orange-600 hover:text-orange-800"
                            title="Revocar deuda (el cliente queda libre)"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {d.estado !== "pendiente" && (
                        <button
                          onClick={() => reactivar(d)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Reactivar (vuelve a pendiente)"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => setModal({ abierto: true, deuda: d })}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(d)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.deudas.last_page > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {data.deudas.current_page} de {data.deudas.last_page}
          </span>
          <button
            disabled={page >= data.deudas.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {modal.abierto && (
        <DeudaFormModal
          deuda={modal.deuda}
          onClose={() => setModal({ abierto: false, deuda: null })}
          onGuardado={() => {
            setModal({ abierto: false, deuda: null });
            refrescar();
          }}
        />
      )}
    </div>
  );
}
