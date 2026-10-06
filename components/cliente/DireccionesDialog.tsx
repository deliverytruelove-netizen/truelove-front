// components/cliente/DireccionesDialog.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Briefcase, Check, Hotel, Home, Loader2, MapPin, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddressPickerDialog from "@/components/cliente/AddressPickerDialog";
import {
  activarDireccion,
  eliminarDireccion,
  fetchDirecciones,
  type DireccionCliente,
} from "@/services/clienteDireccionesService";

interface DireccionesDialogProps {
  open: boolean;
  idCliente: number;
  nombre?: string;
  onClose: () => void;
  /** Se llama cuando cambió la dirección activa o alguna dirección (para refrescar listados y precios). */
  onChanged: () => void | Promise<void>;
}

const iconoDe = (alias: string | null) => {
  switch ((alias || "").toLowerCase()) {
    case "casa":
      return Home;
    case "trabajo":
    case "oficina":
      return Briefcase;
    case "hotel":
      return Hotel;
    default:
      return MapPin;
  }
};

export default function DireccionesDialog({ open, idCliente, nombre, onClose, onChanged }: DireccionesDialogProps) {
  const [direcciones, setDirecciones] = useState<DireccionCliente[]>([]);
  const [cargando, setCargando] = useState(false);
  const [trabajando, setTrabajando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // undefined = cerrado, null = nueva, objeto = editar
  const [formulario, setFormulario] = useState<DireccionCliente | null | undefined>(undefined);

  const cargar = useCallback(async () => {
    if (!idCliente) return;
    setCargando(true);
    setError(null);
    try {
      setDirecciones(await fetchDirecciones(idCliente));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las direcciones");
    } finally {
      setCargando(false);
    }
  }, [idCliente]);

  useEffect(() => {
    if (open) cargar();
  }, [open, cargar]);

  const elegir = async (d: DireccionCliente) => {
    if (d.activa) {
      onClose();
      return;
    }
    setTrabajando(d.id);
    setError(null);
    try {
      await activarDireccion(idCliente, d.id);
      await onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la dirección");
    } finally {
      setTrabajando(null);
    }
  };

  const eliminar = async (d: DireccionCliente) => {
    if (!window.confirm(`¿Eliminar "${d.alias || d.direccion}"?`)) return;
    setTrabajando(d.id);
    setError(null);
    try {
      await eliminarDireccion(idCliente, d.id);
      await cargar();
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la dirección");
    } finally {
      setTrabajando(null);
    }
  };

  return (
    <>
      <Dialog open={open && formulario === undefined} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <p className="inline-block self-start rounded-full bg-[#D9043D]/10 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#D9043D]">
              {nombre ? `HOLA, ${nombre.split(" ")[0].toUpperCase()} 👋` : "HOLA 👋"}
            </p>
            <DialogTitle className="text-xl font-extrabold">¿Dónde entregamos tu pedido?</DialogTitle>
          </DialogHeader>

          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-wider text-slate-400">DIRECCIONES GUARDADAS</p>
            <p className="text-xs font-bold text-[#D9043D]">
              {direcciones.length} {direcciones.length === 1 ? "lugar" : "lugares"}
            </p>
          </div>

          {cargando && direcciones.length === 0 ? (
            <div className="py-8 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2.5">
              {direcciones.map((d) => {
                const Icono = iconoDe(d.alias);
                const ocupada = trabajando === d.id;
                return (
                  <div
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => !ocupada && elegir(d)}
                    onKeyDown={(e) => e.key === "Enter" && !ocupada && elegir(d)}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 cursor-pointer transition-colors ${
                      d.activa ? "border-[#D9043D] bg-[#D9043D]/5 border-2" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        d.activa ? "bg-gradient-to-br from-[#ef2a39] to-[#D9043D] text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icono className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 truncate">{d.alias || "Dirección"}</p>
                        {d.activa && (
                          <span className="rounded-full bg-[#D9043D]/10 px-2 py-0.5 text-[10px] font-bold text-[#D9043D]">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{d.direccion}</p>
                      {d.departamento && <p className="text-[11px] text-slate-400 mt-0.5">{d.departamento}</p>}
                      {d.referencia && (
                        <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                          <MessageSquare className="w-3 h-3" />
                          {d.referencia}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      {ocupada ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                      ) : d.activa ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full border-2 border-slate-300" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormulario(d);
                        }}
                        className="text-slate-400 hover:text-slate-700"
                        aria-label="Editar dirección"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {direcciones.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminar(d);
                          }}
                          className="text-slate-400 hover:text-red-600"
                          aria-label="Eliminar dirección"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setFormulario(null)}
            className="w-full h-12 bg-gradient-to-r from-[#ef2a39] to-[#D9043D] hover:opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva dirección
          </button>
        </DialogContent>
      </Dialog>

      <AddressPickerDialog
        open={open && formulario !== undefined}
        idCliente={idCliente}
        direccion={formulario ?? null}
        onClose={() => setFormulario(undefined)}
        onSaved={async () => {
          setFormulario(undefined);
          await cargar();
          await onChanged();
        }}
      />
    </>
  );
}
