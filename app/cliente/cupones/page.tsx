// app/cliente/cupones/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket } from "lucide-react";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { Cupon, fetchCuponesCliente, formatCuponValor } from "@/services/clientePedidosService";

export default function ClienteCuponesPage() {
  const router = useRouter();
  const { cliente, isAuthenticated, isLoading: authLoading } = useClienteAuth();

  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/cliente/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!cliente?.id) return;
    setIsLoading(true);
    fetchCuponesCliente(cliente.id)
      .then(setCupones)
      .finally(() => setIsLoading(false));
  }, [cliente?.id]);

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
          <h1 className="text-xl font-black text-slate-900">Mis cupones</h1>
          <p className="text-sm text-slate-500 mt-1">Aplícalos al hacer tu pedido usando el código</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-red-600" />
          </div>
        )}

        {!isLoading && cupones.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 text-slate-400">
            <Ticket className="w-12 h-12 mb-4 text-slate-200" />
            <p className="text-sm">Por ahora no tienes cupones disponibles.</p>
          </div>
        )}

        <div className="space-y-3">
          {cupones.map((cupon) => (
            <div
              key={cupon.id}
              className="relative bg-white rounded-2xl border border-dashed border-[#D9043D]/40 p-5 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#D9043D]/10 flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4 text-[#D9043D]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 tracking-wide">{cupon.codigo}</p>
                    <p className="text-xs text-slate-500">{formatCuponValor(cupon)}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                    cupon.estado ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cupon.estado ? "Activo" : "Inactivo"}
                </span>
              </div>

              {cupon.descripcion && <p className="text-xs text-slate-500 mb-2">{cupon.descripcion}</p>}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>
                  {cupon.fecha_inicio ? `${cupon.fecha_inicio} - ` : ""}
                  {cupon.fecha_fin || "Sin vencimiento"}
                </span>
                <span>
                  Usos: {cupon.cantidad_usos}
                  {cupon.usos_disponibles !== null ? ` / ${cupon.usos_disponibles}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
