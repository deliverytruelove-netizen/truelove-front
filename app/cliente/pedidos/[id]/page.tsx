// app/cliente/pedidos/[id]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Star,
  Store,
} from "lucide-react";
import { useClienteCart } from "@/context/ClienteCartContext";
import { buildStorageUrl } from "@/services/clienteLocalesService";
import { fetchMediosPago, MedioPago } from "@/services/clienteCheckoutService";
import {
  ESTADO_PEDIDO_TEXTO,
  fetchPedidoDetalle,
  PedidoDetalle,
  repetirOrden,
  submitRating,
} from "@/services/clientePedidosService";

interface ItemGroup {
  item: PedidoDetalle["detalleArray"][number];
  adicionales: PedidoDetalle["detalleArray"];
}

export default function ClientePedidoDetallePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const pedidoId = Number(params.id);
  const { addItem } = useClienteCart();

  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRepeating, setIsRepeating] = useState(false);
  const [showRating, setShowRating] = useState(searchParams.get("opinar") === "1");
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSent, setRatingSent] = useState(false);

  useEffect(() => {
    if (!pedidoId) return;
    fetchPedidoDetalle(pedidoId)
      .then((data) => {
        setPedido(data);
        if (data?.id_local) fetchMediosPago(data.id_local).then(setMediosPago);
      })
      .finally(() => setIsLoading(false));
  }, [pedidoId]);

  const itemGroups = useMemo<ItemGroup[]>(() => {
    if (!pedido) return [];
    const groups: ItemGroup[] = [];
    for (const detalle of pedido.detalleArray) {
      if (detalle.tipo === "item") {
        groups.push({ item: detalle, adicionales: [] });
      } else if (groups.length > 0) {
        groups[groups.length - 1].adicionales.push(detalle);
      }
    }
    return groups;
  }, [pedido]);

  const total = pedido
    ? Number(pedido.subtotal) + Number(pedido.precio_delivery) - Number(pedido.descuento)
    : 0;

  const metodoPago = mediosPago.find((m) => m.id === pedido?.id_tipo_pago)?.nombre;
  const estadoActual = pedido ? Number(pedido.ultimo_estado_tracking) : null;
  const entregado = estadoActual === 8;
  const cancelado = estadoActual === 0;

  const handleRepetir = async () => {
    if (!pedido) return;
    setIsRepeating(true);
    try {
      const items = await repetirOrden(pedido.id);
      if (items.length === 0) {
        alert("Algunos productos de este pedido ya no están disponibles.");
        return;
      }
      items.forEach((item) => {
        addItem(pedido.id_local, pedido.local, {
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
      setIsRepeating(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!pedido) return;
    await submitRating({ id_pedido: pedido.id, restaurant_rating: ratingValue, restaurant_comment: ratingComment });
    setRatingSent(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Store className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-500 text-sm mb-4">No encontramos este pedido.</p>
        <button onClick={() => router.push("/cliente/pedidos")} className="text-[#D9043D] font-bold text-sm">
          Volver a mis pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-slate-900">Pedido #{pedido.id}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Estado */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-black text-slate-900">{pedido.local}</h2>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                entregado
                  ? "bg-emerald-100 text-emerald-700"
                  : cancelado
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {pedido.estado}
            </span>
          </div>
          <p className="text-xs text-slate-400">{new Date(pedido.created_at).toLocaleString("es-PE")}</p>
        </div>

        {/* Timeline */}
        {pedido.trackings.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-black text-slate-900 mb-3">Seguimiento</h2>
            <div className="space-y-3">
              {[...pedido.trackings]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((t, idx) => (
                  <div key={t.id} className="flex items-start gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        idx === 0 ? "bg-[#D9043D]" : "bg-slate-300"
                      }`}
                    />
                    <div>
                      <p className={`text-sm ${idx === 0 ? "font-bold text-slate-900" : "text-slate-500"}`}>
                        {ESTADO_PEDIDO_TEXTO[t.estado] || `Estado ${t.estado}`}
                      </p>
                      <p className="text-[11px] text-slate-400">{new Date(t.created_at).toLocaleString("es-PE")}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-black text-slate-900 mb-3">Productos</h2>
          <div className="space-y-3">
            {itemGroups.map((group) => (
              <div key={group.item.id} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700">
                    {group.item.cantidad}x {group.item.nombre}
                  </span>
                  <span className="font-semibold text-slate-900">
                    S/ {(Number(group.item.precio) * group.item.cantidad).toFixed(2)}
                  </span>
                </div>
                {group.adicionales.map((ad) => (
                  <div key={ad.id} className="flex justify-between text-xs text-slate-400 pl-4">
                    <span>+ {ad.nombre}</span>
                    <span>S/ {(Number(ad.precio) * ad.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900">S/ {Number(pedido.subtotal).toFixed(2)}</span>
            </div>
            {pedido.tipo_pedido === 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Envío</span>
                <span className="text-slate-900">S/ {Number(pedido.precio_delivery).toFixed(2)}</span>
              </div>
            )}
            {Number(pedido.descuento) > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Descuento</span>
                <span>- S/ {Number(pedido.descuento).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-1">
              <span>Total</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Entrega y pago */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-start gap-2">
            {pedido.tipo_pedido === 0 ? (
              <Bike className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            ) : (
              <Store className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                {pedido.tipo_pedido === 0 ? "Entrega a domicilio" : "Recojo en tienda"}
              </p>
              <p className="text-sm text-slate-700">
                {pedido.tipo_pedido === 0 ? pedido.direccion_entrega : pedido.direccion_local}
              </p>
            </div>
          </div>

          {metodoPago && (
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-slate-700">
                {metodoPago}
                {pedido.paga_con && Number(pedido.paga_con) > 0 ? ` · Paga con S/ ${pedido.paga_con}` : ""}
              </p>
            </div>
          )}

          {pedido.nota && (
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{pedido.nota}</p>
            </div>
          )}
        </div>

        {/* Motorizado */}
        {pedido.motorizado && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0">
              {pedido.foto_motorizado ? (
                <Image
                  src={pedido.foto_motorizado}
                  alt={pedido.motorizado}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Bike className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{pedido.motorizado}</p>
              <p className="text-xs text-slate-500">Tu motorizado</p>
            </div>
            {pedido.celular_motorizado && (
              <a href={`tel:${pedido.celular_motorizado}`} className="text-slate-400 hover:text-[#D9043D]">
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Comprobante de pago */}
        {pedido.foto_pago && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-black text-slate-900 mb-3">Comprobante de pago</h2>
            <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-100">
              <Image
                src={buildStorageUrl(pedido.foto_pago) as string}
                alt="Comprobante de pago"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={handleRepetir}
            disabled={isRepeating}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-60"
          >
            {isRepeating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Volver a pedir
          </button>
          {entregado && (
            <button
              onClick={() => setShowRating(true)}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-[#D9043D] text-white font-semibold hover:bg-[#b8032f] transition-colors"
            >
              <Star className="w-4 h-4" />
              Calificar
            </button>
          )}
        </div>

        {showRating && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            {ratingSent ? (
              <p className="text-sm font-bold text-emerald-700 text-center py-2">¡Gracias por tu calificación!</p>
            ) : (
              <>
                <h2 className="text-sm font-black text-slate-900 mb-3">Califica tu pedido</h2>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRatingValue(n)}>
                      <Star
                        className={`w-6 h-6 ${
                          n <= ratingValue ? "fill-amber-400 text-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Cuéntanos tu experiencia (opcional)"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm resize-none mb-3"
                />
                <button
                  onClick={handleSubmitRating}
                  className="w-full h-10 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors"
                >
                  Enviar calificación
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
