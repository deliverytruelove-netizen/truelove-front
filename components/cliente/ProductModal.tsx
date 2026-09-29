// components/cliente/ProductModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Minus, Plus, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SafeImage from "@/components/cliente/SafeImage";
import { buildStorageUrl } from "@/services/clienteLocalesService";
import { fetchAdicionales, Grupo, MenuItem } from "@/services/clienteMenuService";
import { CartAdicionalGrupo, CartItem } from "@/context/ClienteCartContext";

interface ProductModalProps {
  item: MenuItem | null;
  empresaId: number;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}

export default function ProductModal({ item, empresaId, onClose, onAdd }: ProductModalProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<number, number[]>>({});

  useEffect(() => {
    if (!item) return;
    setIsLoading(true);
    setQuantity(1);
    setSelected({});
    fetchAdicionales(empresaId, item.id)
      .then(setGrupos)
      .finally(() => setIsLoading(false));
  }, [item, empresaId]);

  const toggleItem = (grupo: Grupo, itemId: number) => {
    setSelected((prev) => {
      const current = prev[grupo.id] || [];
      const isSelected = current.includes(itemId);
      const single = grupo.maximo === 1;

      if (isSelected) {
        return { ...prev, [grupo.id]: current.filter((id) => id !== itemId) };
      }
      if (single) {
        return { ...prev, [grupo.id]: [itemId] };
      }
      if (current.length >= grupo.maximo) return prev;
      return { ...prev, [grupo.id]: [...current, itemId] };
    });
  };

  const missingRequired = useMemo(
    () => grupos.some((g) => g.minimo > 0 && (selected[g.id]?.length || 0) < g.minimo),
    [grupos, selected]
  );

  const total = useMemo(() => {
    if (!item) return 0;
    const base = Number(item.precio);
    const adicionalesTotal = grupos.reduce((sum, g) => {
      const selectedIds = selected[g.id] || [];
      return (
        sum +
        g.items
          .filter((i) => selectedIds.includes(i.id))
          .reduce((s, i) => s + Number(i.precio), 0)
      );
    }, 0);
    return (base + adicionalesTotal) * quantity;
  }, [item, grupos, selected, quantity]);

  if (!item) return null;

  const handleAdd = () => {
    const selectedAdicionales: CartAdicionalGrupo[] = grupos
      .filter((g) => (selected[g.id]?.length || 0) > 0)
      .map((g) => ({
        grupoId: g.id,
        grupoNombre: g.nombre,
        items: g.items
          .filter((i) => selected[g.id].includes(i.id))
          .map((i) => ({ id: i.id, titulo: i.titulo, precio: Number(i.precio) })),
      }));

    onAdd({
      cartItemId: `${item.id}_${Date.now()}`,
      menuId: item.id,
      titulo: item.titulo,
      precio: Number(item.precio),
      foto: item.foto,
      quantity,
      selectedAdicionales,
    });
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <div className="relative h-40 bg-slate-100">
          <SafeImage
            src={buildStorageUrl(item.foto)}
            alt={item.titulo}
            fill
            className="object-cover object-center"
            fallback={
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Store className="w-10 h-10" />
              </div>
            }
          />
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left text-lg font-black text-slate-900">{item.titulo}</DialogTitle>
          </DialogHeader>
          {item.descripcion && <p className="text-sm text-slate-500 mt-1">{item.descripcion}</p>}
          <p className="text-base font-bold text-[#D9043D] mt-2">S/ {Number(item.precio).toFixed(2)}</p>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            </div>
          )}

          {!isLoading &&
            grupos.map((grupo) => (
              <div key={grupo.id} className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">{grupo.nombre}</h4>
                  {grupo.minimo > 0 && (
                    <span className="text-[10px] font-bold text-red-500 uppercase">Obligatorio</span>
                  )}
                </div>
                <div className="space-y-2">
                  {grupo.items.map((gi) => {
                    const isSelected = (selected[grupo.id] || []).includes(gi.id);
                    return (
                      <button
                        key={gi.id}
                        type="button"
                        onClick={() => toggleItem(grupo, gi.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                          isSelected ? "border-[#D9043D] bg-red-50" : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm text-slate-800">{gi.titulo}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {Number(gi.precio) > 0 ? `+ S/ ${Number(gi.precio).toFixed(2)}` : "Gratis"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          <div className="flex items-center justify-between mt-6">
            <span className="text-sm font-semibold text-slate-700">Cantidad</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold w-4 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleAdd}
            disabled={missingRequired || isLoading}
            className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Agregar · S/ {total.toFixed(2)}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
