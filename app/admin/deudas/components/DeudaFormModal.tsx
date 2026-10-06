// app\admin\deudas\components\DeudaFormModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import {
  actualizarDeuda,
  buscarClientes,
  crearDeuda,
} from "../services/deudas.service";
import { ClienteBusqueda, Deuda } from "../types/deudas.types";

interface Props {
  /** Si viene una deuda se edita; si no, se crea una manual. */
  deuda: Deuda | null;
  onClose: () => void;
  onGuardado: () => void;
}

export default function DeudaFormModal({ deuda, onClose, onGuardado }: Props) {
  const editando = deuda !== null;

  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [cliente, setCliente] = useState<ClienteBusqueda | null>(null);
  const [monto, setMonto] = useState(deuda?.monto ?? "");
  const [motivo, setMotivo] = useState(deuda?.motivo ?? "");
  const [observaciones, setObservaciones] = useState(deuda?.observaciones_admin ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda.trim()), 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  const { data: resultados = [], isFetching } = useQuery({
    queryKey: ["deudas-buscar-clientes", busquedaDebounced],
    queryFn: () => buscarClientes(busquedaDebounced),
    enabled: !editando && !cliente && busquedaDebounced.length >= 2,
  });

  const mutacion = useMutation({
    mutationFn: async () => {
      const montoNum = parseFloat(String(monto));
      if (!montoNum || montoNum <= 0) throw new Error("Ingresa un monto mayor a 0");
      if (!motivo.trim()) throw new Error("Ingresa el motivo");

      if (editando) {
        await actualizarDeuda(deuda.id, {
          monto: montoNum,
          motivo: motivo.trim(),
          observaciones_admin: observaciones.trim() || undefined,
        });
      } else {
        if (!cliente) throw new Error("Selecciona un cliente");
        await crearDeuda({
          cliente_id: cliente.id,
          monto: montoNum,
          motivo: motivo.trim(),
          observaciones_admin: observaciones.trim() || undefined,
        });
      }
    },
    onSuccess: onGuardado,
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {editando ? `Editar deuda #${deuda.id}` : "Crear deuda manual"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {editando ? (
            <p className="text-sm text-gray-600">
              Cliente: <b>{deuda.cliente}</b>
              {deuda.pedido_id ? ` · Pedido #${deuda.pedido_id}` : ""}
            </p>
          ) : cliente ? (
            <div className="flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2">
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {cliente.nombre} {cliente.apellido}
                </p>
                <p className="text-gray-500">
                  {cliente.documento || "Sin documento"} · {cliente.celular || "Sin celular"}
                </p>
              </div>
              <button
                onClick={() => setCliente(null)}
                className="text-xs text-blue-600 hover:underline"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, documento o celular"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                autoFocus
              />
              {isFetching && <p className="text-xs text-gray-400 mt-1">Buscando…</p>}
              {resultados.length > 0 && (
                <ul className="mt-2 border rounded-lg divide-y max-h-48 overflow-auto">
                  {resultados.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => setCliente(c)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <span className="font-medium">
                          {c.nombre} {c.apellido}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {c.documento || "Sin documento"} · {c.celular || "Sin celular"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!isFetching && busquedaDebounced.length >= 2 && resultados.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">Sin resultados.</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto (S/)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={255}
              placeholder="Ej. Cliente no contesta / rechazó el pedido en puerta"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones (solo admin)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              maxLength={1000}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              setError(null);
              mutacion.mutate();
            }}
            disabled={mutacion.isPending}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {mutacion.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {editando ? "Guardar cambios" : "Crear deuda"}
          </button>
        </div>
      </div>
    </div>
  );
}
