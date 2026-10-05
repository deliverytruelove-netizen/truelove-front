// app\admin\entrega-notas\components\EntregaNotasList.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  AlertCircle,
  MapPin,
  Search,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  fetchEntregaNotas,
  aprobarNota,
  rechazarNota,
  eliminarNota,
} from "../services/entrega-notas.service";
import { EntregaNota, EstadoNota } from "../types/entrega-notas.types";

const ESTADOS: { valor: EstadoNota | "todas"; etiqueta: string }[] = [
  { valor: "pendiente", etiqueta: "Por revisar" },
  { valor: "aprobada", etiqueta: "Aprobadas" },
  { valor: "rechazada", etiqueta: "Rechazadas" },
  { valor: "todas", etiqueta: "Todas" },
];

const BADGE: Record<EstadoNota, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
};

const ETIQUETA: Record<EstadoNota, string> = {
  pendiente: "Por revisar",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

export default function EntregaNotasList() {
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState<EstadoNota | "todas">("pendiente");
  const [busqueda, setBusqueda] = useState("");
  const [q, setQ] = useState("");
  const [conFoto, setConFoto] = useState(false);
  const [page, setPage] = useState(1);
  const [fotoGrande, setFotoGrande] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["entrega-notas", estado, q, conFoto, page],
    queryFn: () =>
      fetchEntregaNotas({
        estado: estado === "todas" ? undefined : estado,
        q: q || undefined,
        con_foto: conFoto,
        page,
      }),
  });

  const refrescar = () =>
    queryClient.invalidateQueries({ queryKey: ["entrega-notas"] });

  const avisoError = (err: unknown) =>
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err instanceof Error ? err.message : "Ocurrió un error",
    });

  const mutAprobar = useMutation({
    mutationFn: (id: number) => aprobarNota(id),
    onSuccess: refrescar,
    onError: avisoError,
  });
  const mutRechazar = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) =>
      rechazarNota(id, motivo),
    onSuccess: refrescar,
    onError: avisoError,
  });
  const mutEliminar = useMutation({
    mutationFn: (id: number) => eliminarNota(id),
    onSuccess: refrescar,
    onError: avisoError,
  });

  const handleRechazar = async (nota: EntregaNota) => {
    const result = await Swal.fire({
      title: "¿Rechazar esta nota?",
      text: "Dejará de mostrarse a los repartidores.",
      icon: "warning",
      input: "text",
      inputPlaceholder: "Motivo (opcional)",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      mutRechazar.mutate({ id: nota.id, motivo: result.value || undefined });
    }
  };

  const handleEliminar = async (nota: EntregaNota) => {
    const result = await Swal.fire({
      title: "¿Eliminar definitivamente?",
      text: "Se borrará la nota y su foto. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) mutEliminar.mutate(nota.id);
  };

  const cambiarEstado = (nuevo: EstadoNota | "todas") => {
    setEstado(nuevo);
    setPage(1);
  };

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(busqueda.trim());
    setPage(1);
  };

  const conteos = data?.conteos;
  const notas = data?.notas.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Notas de las casas
        </h1>
        <p className="text-sm text-gray-500">
          Notas y fotos que dejan los repartidores sobre los lugares de entrega.
          Las notas se muestran a los repartidores apenas se crean; aquí puedes
          aprobarlas, rechazarlas o eliminarlas.
        </p>
      </div>

      {conteos && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Por revisar</p>
            <p className="text-2xl font-bold">{conteos.pendiente}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Aprobadas</p>
            <p className="text-2xl font-bold">{conteos.aprobada}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Rechazadas</p>
            <p className="text-2xl font-bold">{conteos.rechazada}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {ESTADOS.map((e) => (
            <button
              key={e.valor}
              onClick={() => cambiarEstado(e.valor)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                estado === e.valor
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {e.etiqueta}
            </button>
          ))}
        </div>
        <form onSubmit={buscar} className="flex gap-2 md:ml-auto">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nota, repartidor o dirección"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={conFoto}
            onChange={(e) => {
              setConFoto(e.target.checked);
              setPage(1);
            }}
          />
          Solo con foto
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-12 text-red-600">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p>
            {error instanceof Error ? error.message : "Error al cargar las notas"}
          </p>
        </div>
      ) : notas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          No hay notas en esta vista.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Foto", "Nota", "Repartidor", "Lugar", "Estado", "Acciones"].map(
                  (t) => (
                    <th
                      key={t}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notas.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50 align-top">
                  <td className="px-6 py-4">
                    {n.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.foto_url}
                        alt="Foto de la casa"
                        className="w-24 h-24 object-cover rounded-lg cursor-zoom-in"
                        onClick={() => setFotoGrande(n.foto_url)}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Sin foto</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-xs whitespace-pre-wrap">
                    {n.nota || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-medium text-gray-900">
                      {n.repartidor?.nombre || "—"}
                    </p>
                    {n.repartidor?.celular && (
                      <p className="text-gray-500">{n.repartidor.celular}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString("es-ES")}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <p>{n.direccion || "Sin dirección"}</p>
                    {n.referencia && (
                      <p className="text-gray-500 text-xs">{n.referencia}</p>
                    )}
                    <a
                      href={`https://www.google.com/maps?q=${n.latitud},${n.longitud}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                    >
                      <MapPin className="w-3 h-3" /> Ver en mapa
                    </a>
                    {n.pedido_id && (
                      <p className="text-xs text-gray-400">Pedido #{n.pedido_id}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${BADGE[n.estado]}`}
                    >
                      {ETIQUETA[n.estado]}
                    </span>
                    {n.estado === "rechazada" && n.motivo_rechazo && (
                      <p className="text-xs text-gray-500 mt-1">
                        {n.motivo_rechazo}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      {n.estado !== "aprobada" && (
                        <button
                          onClick={() => mutAprobar.mutate(n.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Aprobar"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {n.estado !== "rechazada" && (
                        <button
                          onClick={() => handleRechazar(n)}
                          className="text-orange-600 hover:text-orange-800"
                          title="Rechazar (ocultar a repartidores)"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminar(n)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar definitivamente"
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

      {data && data.notas.last_page > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {data.notas.current_page} de {data.notas.last_page}
          </span>
          <button
            disabled={page >= data.notas.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {fotoGrande && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 cursor-zoom-out"
          onClick={() => setFotoGrande(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoGrande}
            alt="Foto de la casa"
            className="max-h-full max-w-full rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
