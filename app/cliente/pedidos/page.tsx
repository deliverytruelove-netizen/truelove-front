// app/cliente/pedidos/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Star,
  Store,
} from "lucide-react";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { useClienteCart } from "@/context/ClienteCartContext";
import SafeImage from "@/components/cliente/SafeImage";
import { buildStorageUrl } from "@/services/clienteLocalesService";
import { fetchPedidoDetalle, fetchPedidosCliente, Pedido, repetirOrden } from "@/services/clientePedidosService";

type QuickFilter = "todos" | "entregados" | "cancelados";

export default function ClientePedidosPage() {
  const router = useRouter();
  const { cliente, isAuthenticated, isLoading: authLoading } = useClienteAuth();
  const { addItem, totalItemsCount } = useClienteCart();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<QuickFilter>("todos");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [repeatingId, setRepeatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/cliente/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!cliente?.id) return;
    setIsLoading(true);
    fetchPedidosCliente(cliente.id)
      .then(setPedidos)
      .finally(() => setIsLoading(false));
  }, [cliente?.id]);

  const filteredPedidos = useMemo(() => {
    let result = pedidos;
    if (filter === "entregados") result = result.filter((p) => p.estado_numero === 8);
    if (filter === "cancelados") result = result.filter((p) => p.estado_numero === 0);
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((p) => p.local.toLowerCase().includes(term));
    }
    return result;
  }, [pedidos, filter, search]);

  const toggleExpanded = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleRepetir = async (pedido: Pedido) => {
    setRepeatingId(pedido.id);
    try {
      // El listado no trae id_local (el id real del negocio, distinto del
      // id del pedido); se necesita el detalle para saber a qué carrito
      // por-local deben sumarse los productos.
      const [detalle, items] = await Promise.all([fetchPedidoDetalle(pedido.id), repetirOrden(pedido.id)]);
      if (!detalle || items.length === 0) {
        alert("Algunos productos de este pedido ya no están disponibles.");
        return;
      }
      items.forEach((item) => {
        addItem(detalle.id_local, pedido.local, {
          cartItemId: `${item.id}_${Date.now()}_${Math.random()}`,
          menuId: item.id,
          titulo: item.name,
          precio: Number(item.price),
          foto: item.image,
          quantity: item.quantity,
          selectedAdicionales: [],
        });
      });
      router.push("/cliente/carrito");
    } finally {
      setRepeatingId(null);
    }
  };

  if (authLoading || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-slate-900">Mis pedidos</h1>
            <button
              onClick={() => router.push("/cliente/carrito")}
              className="relative w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-[18px] h-[18px] text-slate-700" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D9043D] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar"
              className="w-full h-11 rounded-full bg-slate-100 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#D9043D]/30"
            />
          </div>

          <div className="flex gap-2">
            {(
              [
                { key: "todos", label: "Todos" },
                { key: "entregados", label: "Entregados" },
                { key: "cancelados", label: "Cancelados" },
              ] as { key: QuickFilter; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  filter === key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-red-600" />
          </div>
        )}

        {!isLoading && filteredPedidos.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 text-slate-400">
            <Package className="w-12 h-12 mb-4 text-slate-200" />
            <p className="text-sm">Aún no tienes pedidos {filter !== "todos" ? "en esta categoría" : ""}.</p>
          </div>
        )}

        <div className="space-y-3">
          {filteredPedidos.map((pedido) => {
            const isExpanded = !!expanded[pedido.id];
            return (
              <div key={pedido.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleExpanded(pedido.id)}
                  className="w-full flex gap-3 p-4 text-left"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <SafeImage
                      src={buildStorageUrl(pedido.logo)}
                      alt={pedido.local}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Store className="w-5 h-5" />
                        </div>
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{pedido.local}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      S/ {Number(pedido.total).toFixed(2)} · {pedido.cantidad} productos
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`text-xs font-bold ${
                          pedido.estado_numero === 8
                            ? "text-emerald-600"
                            : pedido.estado_numero === 0
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {pedido.estado}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {pedido.fecha_entrega} {pedido.hora_entrega}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pt-3 pb-1">
                    <div className="space-y-1.5">
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {item.cantidad}x {item.nombre}
                          </span>
                          <span className="font-semibold text-slate-900">
                            S/ {(Number(item.precio) * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 border-t border-slate-100">
                  <button
                    onClick={() => router.push(`/cliente/pedidos/${pedido.id}`)}
                    className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver
                  </button>
                  <button
                    onClick={() => router.push(`/cliente/pedidos/${pedido.id}?opinar=1`)}
                    className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 border-x border-slate-100"
                    disabled={pedido.estado_numero !== 8}
                  >
                    <Star className="w-3.5 h-3.5" />
                    Opinar
                  </button>
                  <button
                    onClick={() => handleRepetir(pedido)}
                    disabled={repeatingId === pedido.id}
                    className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {repeatingId === pedido.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Repetir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
