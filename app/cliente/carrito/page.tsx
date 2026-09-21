// app/cliente/carrito/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Minus, Plus, ShoppingCart, Store, Trash2 } from "lucide-react";
import { buildStorageUrl } from "@/services/clienteLocalesService";
import { useClienteCart, cartItemTotal } from "@/context/ClienteCartContext";

export default function ClienteCarritoPage() {
  const router = useRouter();
  const { carts, updateQuantity, removeItem, clearCart } = useClienteCart();
  const localCarts = Object.values(carts);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (cartItemId: string) =>
    setExpanded((prev) => ({ ...prev, [cartItemId]: !prev[cartItemId] }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-slate-900">Mi carrito</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {localCarts.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 text-slate-400">
            <ShoppingCart className="w-12 h-12 mb-4 text-slate-200" />
            <p className="text-sm mb-4">Tu carrito está vacío.</p>
            <button
              onClick={() => router.push("/cliente/locales")}
              className="text-[#D9043D] font-bold text-sm"
            >
              Explorar locales
            </button>
          </div>
        )}

        <div className="space-y-6">
          {localCarts.map((cart) => {
            const subtotal = cart.items.reduce((s, i) => s + cartItemTotal(i), 0);
            return (
              <div key={cart.localId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-red-500" />
                    <h2 className="text-sm font-black text-slate-900">{cart.localName}</h2>
                  </div>
                  <button
                    onClick={() => clearCart(cart.localId)}
                    className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Vaciar
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.items.map((item) => (
                    <div key={item.cartItemId} className="p-4 flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        {buildStorageUrl(item.foto) ? (
                          <Image
                            src={buildStorageUrl(item.foto) as string}
                            alt={item.titulo}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Store className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{item.titulo}</h3>
                          <button
                            onClick={() => removeItem(cart.localId, item.cartItemId)}
                            className="text-slate-300 hover:text-red-600 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.selectedAdicionales.length > 0 && (
                          <div className="mt-1">
                            <button
                              onClick={() => toggleExpanded(item.cartItemId)}
                              className="flex items-center gap-1 text-xs font-semibold text-[#D9043D]"
                            >
                              {expanded[item.cartItemId] ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  Ocultar adicionales
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  Ver adicionales
                                </>
                              )}
                            </button>

                            {expanded[item.cartItemId] && (
                              <div className="mt-2 space-y-1.5">
                                {item.selectedAdicionales.map((grupo) => (
                                  <div key={grupo.grupoId}>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                      {grupo.grupoNombre}
                                    </p>
                                    {grupo.items.map((gi) => (
                                      <div key={gi.id} className="flex justify-between text-xs text-slate-600">
                                        <span>{gi.titulo}</span>
                                        {gi.precio > 0 && <span>+ S/ {gi.precio.toFixed(2)}</span>}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(cart.localId, item.cartItemId, Math.max(1, item.quantity - 1))
                              }
                              className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(cart.localId, item.cartItemId, item.quantity + 1)}
                              className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-slate-900">
                            S/ {cartItemTotal(item).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-black text-slate-900">S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => router.push(`/cliente/checkout/${cart.localId}`)}
                    className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors"
                  >
                    Continuar pedido
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
