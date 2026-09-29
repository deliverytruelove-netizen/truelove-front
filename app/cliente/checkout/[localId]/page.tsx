// app/cliente/checkout/[localId]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Bike, Loader2, MapPin, Pencil, Store, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { useClienteCart, cartItemTotal } from "@/context/ClienteCartContext";
import AddressPickerDialog from "@/components/cliente/AddressPickerDialog";
import {
  fetchMediosPago,
  fetchPrecioDelivery,
  validarCupon,
  crearPedido,
  MedioPago,
  TipoDescuento,
} from "@/services/clienteCheckoutService";

type DeliveryType = "delivery" | "pickup";
type TipoComprobante = "ninguno" | "boleta" | "factura";

// Recargo por pago con POS, igual que en la app (ids de medios de pago fijos).
const POS_MEDIO_PAGO_IDS = ["4", "5"];
const POS_SURCHARGE = 2;
const PAGO_ADELANTADO_UMBRAL = 100;

export default function ClienteCheckoutPage() {
  const router = useRouter();
  const params = useParams<{ localId: string }>();
  const localId = Number(params.localId);
  const { cliente, refresh } = useClienteAuth();
  const { getCartForLocal, clearCart } = useClienteCart();
  const cart = getCartForLocal(localId);

  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [addressVersion, setAddressVersion] = useState(0);

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [idTipoPago, setIdTipoPago] = useState<number | null>(null);
  const [pagaConModo, setPagaConModo] = useState<"exacto" | "cambio">("exacto");
  const [pagaConMonto, setPagaConMonto] = useState("");
  const [nota, setNota] = useState("");
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>("ninguno");
  const [documento, setDocumento] = useState("");
  const [precioDelivery, setPrecioDelivery] = useState(0);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);

  const [cuponInput, setCuponInput] = useState("");
  const [cupon, setCupon] = useState<{ codigo: string; tipo: TipoDescuento; valor: number } | null>(null);
  const [cuponError, setCuponError] = useState<string | null>(null);
  const [isValidatingCupon, setIsValidatingCupon] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!localId) return;
    fetchMediosPago(localId).then((medios) => {
      setMediosPago(medios);
      if (medios.length > 0) setIdTipoPago(medios[0].id);
    });
  }, [localId]);

  useEffect(() => {
    if (!cliente?.id || !localId || deliveryType !== "delivery") {
      setPrecioDelivery(0);
      return;
    }
    setIsLoadingDelivery(true);
    fetchPrecioDelivery(localId, cliente.id)
      .then(setPrecioDelivery)
      .finally(() => setIsLoadingDelivery(false));
  }, [cliente?.id, localId, deliveryType, addressVersion]);

  const subtotal = useMemo(() => cart?.items.reduce((s, i) => s + cartItemTotal(i), 0) || 0, [cart]);

  const medioPagoSeleccionado = mediosPago.find((m) => m.id === idTipoPago);
  const esEfectivo = medioPagoSeleccionado?.nombre.toUpperCase().includes("EFECTIVO") || false;
  const esPos = idTipoPago !== null && POS_MEDIO_PAGO_IDS.includes(String(idTipoPago));

  const descuento = useMemo(() => {
    if (!cupon) return 0;
    if (cupon.tipo === "porcentaje") return (subtotal * cupon.valor) / 100;
    if (cupon.tipo === "monto_fijo") return Math.min(cupon.valor, subtotal);
    return 0;
  }, [cupon, subtotal]);

  const deliveryFinal = cupon?.tipo === "delivery_gratis" ? 0 : precioDelivery;
  const posRecargo = esPos ? POS_SURCHARGE : 0;
  const total = Math.max(0, subtotal + deliveryFinal + posRecargo - descuento);
  const requierePagoAdelantado = subtotal >= PAGO_ADELANTADO_UMBRAL;

  const handleValidarCupon = async () => {
    if (!cliente?.id || !cuponInput.trim()) return;
    setIsValidatingCupon(true);
    setCuponError(null);
    try {
      const result = await validarCupon(cuponInput.trim(), cliente.id);
      if (!result.success || !result.tipo) {
        setCuponError(result.message || "El código no es válido");
        setCupon(null);
        return;
      }
      setCupon({ codigo: cuponInput.trim(), tipo: result.tipo, valor: Number(result.valor || 0) });
    } finally {
      setIsValidatingCupon(false);
    }
  };

  const handleSubmit = async () => {
    if (!cliente || !cart || cart.items.length === 0 || idTipoPago === null) return;
    setError(null);

    if (tipoComprobante !== "ninguno") {
      const expectedLength = tipoComprobante === "boleta" ? 8 : 11;
      if (documento.trim().length !== expectedLength) {
        setError(`El ${tipoComprobante === "boleta" ? "DNI" : "RUC"} debe tener ${expectedLength} dígitos`);
        return;
      }
    }
    if (esEfectivo && pagaConModo === "cambio" && !pagaConMonto.trim()) {
      setError("Ingresa con cuánto vas a pagar");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await crearPedido({
        id_local: localId,
        id_cliente: cliente.id,
        latitud: 0,
        longitud: 0,
        nota,
        id_tipo_pago: idTipoPago,
        tipo_comprobante: tipoComprobante,
        documento: tipoComprobante !== "ninguno" ? documento : undefined,
        precio_delivery: deliveryFinal + posRecargo,
        descuento,
        subtotal,
        codigo: cupon?.codigo,
        paga_con: esEfectivo && pagaConModo === "cambio" ? Number(pagaConMonto) : "exacto",
        tipo_entrega: deliveryType,
        items: cart.items.map((item) => ({
          id: item.menuId,
          name: item.titulo,
          price: item.precio,
          quantity: item.quantity,
          selectedAdicionales: item.selectedAdicionales.map((g) => ({
            grupoId: g.grupoId,
            items: g.items,
          })),
        })),
      });

      if (response.status !== "success" || !response.pedido_id) {
        setError(response.message || "No se pudo crear el pedido");
        return;
      }

      clearCart(localId);

      if (response.requiere_confirmacion) {
        router.push(`/cliente/pedido-espera/${response.pedido_id}`);
      } else {
        router.push(`/cliente/pedidos`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Store className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-500 text-sm mb-4">No tienes productos de este local en tu carrito.</p>
        <button onClick={() => router.push("/cliente/locales")} className="text-[#D9043D] font-bold text-sm">
          Explorar locales
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-slate-900">Confirmar pedido</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

        {/* Resumen del carrito */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-black text-slate-900 mb-3">{cart.localName}</h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.cartItemId} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {item.quantity}x {item.titulo}
                  </span>
                  <span className="font-semibold text-slate-900">S/ {cartItemTotal(item).toFixed(2)}</span>
                </div>
                {item.selectedAdicionales.length > 0 && (
                  <div className="mt-1 pl-4 space-y-0.5">
                    {item.selectedAdicionales.flatMap((grupo) =>
                      grupo.items.map((gi) => (
                        <div key={`${grupo.grupoId}-${gi.id}`} className="flex justify-between text-xs text-slate-400">
                          <span>+ {gi.titulo}</span>
                          {gi.precio > 0 && <span>S/ {gi.precio.toFixed(2)}</span>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dirección de entrega */}
        {deliveryType === "delivery" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Dirección de entrega</p>
                <p className="text-sm text-slate-700">{cliente?.direccion || "Sin dirección guardada"}</p>
              </div>
              <button
                onClick={() => setShowAddressPicker(true)}
                className="flex items-center gap-1 text-xs font-bold text-[#D9043D] shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </button>
            </div>
          </div>
        )}

        {/* Delivery / Recojo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-black text-slate-900 mb-3">Tipo de entrega</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDeliveryType("delivery")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                deliveryType === "delivery" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              <Bike className="w-4 h-4" />
              Delivery
            </button>
            <button
              onClick={() => setDeliveryType("pickup")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                deliveryType === "pickup" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              <Store className="w-4 h-4" />
              Recojo en tienda
            </button>
          </div>
          {deliveryType === "delivery" && (
            <p className="text-xs text-slate-500 mt-2">
              {isLoadingDelivery ? "Calculando costo de envío..." : `Costo de envío: S/ ${precioDelivery.toFixed(2)}`}
            </p>
          )}
        </div>

        {/* Método de pago */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-black text-slate-900 mb-3">Método de pago</h2>
          <div className="space-y-2">
            {mediosPago.map((medio) => (
              <button
                key={medio.id}
                onClick={() => setIdTipoPago(medio.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                  idTipoPago === medio.id ? "border-[#D9043D] bg-red-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-sm text-slate-800">{medio.nombre}</span>
              </button>
            ))}
          </div>

          {esEfectivo && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setPagaConModo("exacto")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                    pagaConModo === "exacto" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Pago exacto
                </button>
                <button
                  onClick={() => setPagaConModo("cambio")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                    pagaConModo === "cambio" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Necesito vuelto
                </button>
              </div>
              {pagaConModo === "cambio" && (
                <Input
                  type="number"
                  value={pagaConMonto}
                  onChange={(e) => setPagaConMonto(e.target.value)}
                  placeholder="¿Con cuánto vas a pagar?"
                  className="h-10 rounded-lg"
                />
              )}
            </div>
          )}
          {esPos && (
            <p className="text-xs text-amber-600 mt-2">Pago con POS: recargo de S/ {POS_SURCHARGE.toFixed(2)}</p>
          )}
        </div>

        {/* Comprobante */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-black text-slate-900 mb-3">Comprobante</h2>
          <div className="flex gap-2 mb-3">
            {(["ninguno", "boleta", "factura"] as TipoComprobante[]).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoComprobante(tipo)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize ${
                  tipoComprobante === tipo ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
          {tipoComprobante !== "ninguno" && (
            <Input
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder={tipoComprobante === "boleta" ? "DNI (8 dígitos)" : "RUC (11 dígitos)"}
              maxLength={tipoComprobante === "boleta" ? 8 : 11}
              className="h-10 rounded-lg"
            />
          )}
        </div>

        {/* Cupón */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-black text-slate-900 mb-3">Cupón de descuento</h2>
          {cupon ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <Tag className="w-4 h-4" />
                {cupon.codigo}
              </span>
              <button onClick={() => setCupon(null)} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={cuponInput}
                onChange={(e) => setCuponInput(e.target.value)}
                placeholder="Ingresa tu código"
                className="h-10 rounded-lg flex-1"
              />
              <button
                onClick={handleValidarCupon}
                disabled={isValidatingCupon || !cuponInput.trim()}
                className="px-4 rounded-lg bg-slate-900 text-white text-xs font-bold disabled:opacity-50"
              >
                {isValidatingCupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
              </button>
            </div>
          )}
          {cuponError && <p className="text-xs text-red-600 mt-2">{cuponError}</p>}
        </div>

        {/* Nota */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-black text-slate-900 mb-3">Notas para el local</h2>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej: sin cebolla, tocar el timbre..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm resize-none"
          />
        </div>

        {requierePagoAdelantado && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Tu pedido supera los S/ {PAGO_ADELANTADO_UMBRAL.toFixed(2)}. Es posible que el local te pida confirmar
            el pago antes de empezar a prepararlo — te lo indicaremos apenas confirmes el pedido.
          </div>
        )}

        {/* Totales */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-slate-900">S/ {subtotal.toFixed(2)}</span>
          </div>
          {deliveryType === "delivery" && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Envío</span>
              <span className="text-slate-900">S/ {deliveryFinal.toFixed(2)}</span>
            </div>
          )}
          {esPos && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Recargo POS</span>
              <span className="text-slate-900">S/ {posRecargo.toFixed(2)}</span>
            </div>
          )}
          {descuento > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Descuento</span>
              <span>- S/ {descuento.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Política de cancelación */}
        <div className="flex items-start gap-2 text-xs text-slate-500 px-1">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Puedes cancelar tu pedido sin cargo solo antes de que el local lo confirme. Una vez confirmado, ya no
            podrá cancelarse desde la web.
          </p>
        </div>
      </div>

      <AddressPickerDialog
        open={showAddressPicker}
        idCliente={cliente?.id || 0}
        onClose={() => setShowAddressPicker(false)}
        onSaved={async () => {
          await refresh();
          setAddressVersion((v) => v + 1);
          setShowAddressPicker(false);
        }}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || idTipoPago === null}
            className="w-full h-12 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              `Confirmar pedido · S/ ${total.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
