// app/cliente/locales/[id]/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bike, Loader2, MapPin, Search, ShoppingCart, Store, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { buildStorageUrl, fetchLocalById, Local } from "@/services/clienteLocalesService";
import { fetchMenuCategorias, MenuCategoria, MenuItem } from "@/services/clienteMenuService";
import { useClienteCart, cartItemTotal } from "@/context/ClienteCartContext";
import ProductModal from "@/components/cliente/ProductModal";
import ClienteHeaderActions from "@/components/cliente/ClienteHeaderActions";
import SafeImage from "@/components/cliente/SafeImage";
import HorizontalScroller from "@/components/cliente/HorizontalScroller";

type DeliveryType = "delivery" | "recojo";

export default function ClienteLocalDetallePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const localId = Number(params.id);
  const { cliente } = useClienteAuth();

  const [local, setLocal] = useState<Local | null>(null);
  const [categorias, setCategorias] = useState<MenuCategoria[]>([]);
  const [activeCategoria, setActiveCategoria] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [query, setQuery] = useState("");

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const chipsContainerRef = useRef<HTMLDivElement | null>(null);
  const suppressObserverRef = useRef(false);
  const { getCartForLocal, addItem } = useClienteCart();
  const cart = getCartForLocal(localId);
  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) || 0;
  const cartTotal = cart?.items.reduce((s, i) => s + cartItemTotal(i), 0) || 0;

  useEffect(() => {
    if (!localId) return;
    Promise.all([fetchLocalById(localId), fetchMenuCategorias(localId)]).then(([localData, cats]) => {
      setLocal(localData);
      setCategorias(cats);
      if (cats.length > 0) setActiveCategoria(cats[0].nombre);
      setIsLoading(false);
    });
  }, [localId]);

  const scrollChipIntoView = (nombre: string) => {
    chipRefs.current[nombre]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const scrollToCategoria = (nombre: string) => {
    setActiveCategoria(nombre);
    scrollChipIntoView(nombre);
    // Evita que el scroll-spy pise el estado mientras dura el scroll suave
    // provocado por el propio click en el chip.
    suppressObserverRef.current = true;
    sectionRefs.current[nombre]?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      suppressObserverRef.current = false;
    }, 700);
  };

  // Scroll-spy: resalta la categoría visible mientras el usuario hace
  // scroll por el menú, en vez de quedarse fija en la última tocada.
  useEffect(() => {
    if (categorias.length === 0 || query) return;

    const stickyOffset = 56; // alto aprox. de la barra de categorías pegajosa
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserverRef.current) return;
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b));
        const nombre = topMost.target.getAttribute("data-categoria");
        if (nombre) {
          setActiveCategoria(nombre);
          scrollChipIntoView(nombre);
        }
      },
      { rootMargin: `-${stickyOffset}px 0px -70% 0px`, threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [categorias, query]);

  const filteredCategorias = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return categorias;
    return categorias
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.titulo.toLowerCase().includes(term) ||
            (item.descripcion || "").toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categorias, query]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!local) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Store className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-500 text-sm mb-4">No encontramos este local.</p>
        <button onClick={() => router.push("/cliente/locales")} className="text-[#D9043D] font-bold text-sm">
          Volver a locales
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="relative h-56 md:h-64 bg-slate-100 overflow-hidden">
        <SafeImage
          src={buildStorageUrl(local.banner)}
          alt={local.nombre_establecimiento}
          fill
          className="object-cover object-center"
          fallback={
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Store className="w-10 h-10" />
            </div>
          }
        />
        <button
          onClick={() => router.push("/cliente/locales")}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
          aria-label="Volver"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <div className="absolute top-4 right-4 [&_button]:bg-white/90 [&_button]:shadow-sm">
          <ClienteHeaderActions variant="dark" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* El logo queda a caballo entre el banner y el cuerpo (mitad y
            mitad); el nombre va siempre debajo, sin tocar la imagen. */}
        <div className="relative z-10 -mt-10 w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-white">
          <SafeImage
            src={buildStorageUrl(local.ruta_logo)}
            alt={local.nombre_establecimiento}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            fallback={
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Store className="w-8 h-8" />
              </div>
            }
          />
        </div>

        <div className="flex items-start justify-between gap-2 mt-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{local.nombre_establecimiento}</h1>
          <span
            className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
              local.estaAbierto ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {local.estaAbierto ? "Abierto" : "Cerrado"}
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-4">{local.businessType}</p>

        {/* Delivery / Recojo en tienda */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setDeliveryType("delivery")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              deliveryType === "delivery" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Bike className="w-4 h-4" />
            Delivery
          </button>
          <button
            onClick={() => setDeliveryType("recojo")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              deliveryType === "recojo" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Store className="w-4 h-4" />
            Recojo en tienda
          </button>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-5">
          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
              {deliveryType === "delivery" ? "Entregar en" : "Recoger en"}
            </p>
            <p className="text-sm text-slate-700">
              {deliveryType === "delivery" ? cliente?.direccion || "Tu dirección" : local.direccion_completa}
            </p>
          </div>
        </div>

        {/* Buscador dentro del menú, igual que en la app */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca un producto en este menú..."
            className="h-11 rounded-xl pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50/60 p-4 text-sm text-red-700">
            Este local aún no tiene su menú disponible en la web.
          </div>
        </div>
      ) : (
        <>
          {!query && (
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-y border-slate-100 px-4 sm:px-6 lg:px-8 py-2">
              <div className="max-w-5xl mx-auto">
                <HorizontalScroller innerRef={chipsContainerRef} className="gap-2">
                  {categorias.map((cat) => (
                    <button
                      key={cat.nombre}
                      ref={(el) => {
                        chipRefs.current[cat.nombre] = el;
                      }}
                      onClick={() => scrollToCategoria(cat.nombre)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        activeCategoria === cat.nombre
                          ? "bg-[#D9043D] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </HorizontalScroller>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredCategorias.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-16">
                No encontramos productos para &quot;{query}&quot;
              </p>
            )}

            {filteredCategorias.map((cat) => (
              <div
                key={cat.nombre}
                ref={(el) => {
                  sectionRefs.current[cat.nombre] = el;
                }}
                data-categoria={cat.nombre}
                className="pt-6"
              >
                <h2 className="text-base font-black text-slate-900 mb-3">{cat.nombre}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900">{item.titulo}</h3>
                        {item.descripcion && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.descripcion}</p>
                        )}
                        <p className="text-sm font-bold text-[#D9043D] mt-1.5">
                          S/ {Number(item.precio).toFixed(2)}
                        </p>
                      </div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <SafeImage
                          src={buildStorageUrl(item.foto)}
                          alt={item.titulo}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          fallback={
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Store className="w-5 h-5" />
                            </div>
                          }
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ProductModal
        item={selectedItem}
        empresaId={localId}
        onClose={() => setSelectedItem(null)}
        onAdd={(cartItem) => addItem(localId, local.nombre_establecimiento, cartItem)}
      />

      {cartCount > 0 && (
        <button
          onClick={() => router.push("/cliente/carrito")}
          className="fixed bottom-4 left-4 right-4 max-w-md mx-auto h-14 bg-[#D9043D] hover:bg-[#b8032f] text-white rounded-2xl shadow-xl flex items-center justify-between px-5 transition-colors"
        >
          <span className="flex items-center gap-2 font-bold text-sm">
            <ShoppingCart className="w-4 h-4" />
            {cartCount} {cartCount === 1 ? "producto" : "productos"}
          </span>
          <span className="font-black">S/ {cartTotal.toFixed(2)}</span>
        </button>
      )}
    </div>
  );
}
