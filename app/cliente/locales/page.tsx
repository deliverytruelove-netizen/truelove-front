// app/cliente/locales/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, MapPin, Search, Store } from "lucide-react";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import BannerCarousel from "@/components/cliente/BannerCarousel";
import PromocionesCarousel from "@/components/cliente/PromocionesCarousel";
import ClienteHeaderActions from "@/components/cliente/ClienteHeaderActions";
import SafeImage from "@/components/cliente/SafeImage";
import HorizontalScroller from "@/components/cliente/HorizontalScroller";
import {
  Banner,
  CLIENTE_LOCALES_STORAGE_KEY,
  Local,
  Promocion,
  TipoNegocio,
  buildStorageUrl,
  fetchBanners,
  fetchLocalesByCategory,
  fetchLocalesTop,
  fetchPromociones,
  fetchTiposNegocio,
  LocalesError,
} from "@/services/clienteLocalesService";

type QuickFilter = "todos" | "abiertos" | "cerca";

const CERCA_UMBRAL_KM = 3;

function formatDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function ClienteLocalesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cliente, isAuthenticated, isLoading: authLoading } = useClienteAuth();

  const [tipos, setTipos] = useState<TipoNegocio[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("categoria")
  );
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("todos");

  const [locales, setLocales] = useState<Local[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAddress, setNeedsAddress] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/cliente/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    fetchTiposNegocio().then(setTipos);
    fetchBanners().then(setBanners);
    fetchPromociones().then(setPromociones);
  }, []);

  useEffect(() => {
    if (!cliente?.id) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setNeedsAddress(false);

    const load = async () => {
      try {
        const data = selectedCategory
          ? await fetchLocalesByCategory(cliente.id, selectedCategory)
          : await fetchLocalesTop(cliente.id);
        if (cancelled) return;
        setLocales(data);
        // Se guarda para que la pantalla de búsqueda pueda filtrar localmente
        // de inmediato, igual que en la app (initialLocales).
        sessionStorage.setItem(CLIENTE_LOCALES_STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        if (cancelled) return;
        if (err instanceof LocalesError && /Dirección no encontrada/i.test(err.message)) {
          setNeedsAddress(true);
        } else {
          setError(err instanceof Error ? err.message : "No se pudieron cargar los locales");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [cliente?.id, selectedCategory]);

  const filteredLocales = useMemo(() => {
    return locales.filter((local) => {
      if (quickFilter === "abiertos" && !local.estaAbierto) return false;
      if (quickFilter === "cerca" && local.distancia > CERCA_UMBRAL_KM) return false;
      return true;
    });
  }, [locales, quickFilter]);

  if (authLoading || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-[#D9043D] to-[#b8032f] text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-3 mb-1">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Pidiendo a</p>
            <ClienteHeaderActions variant="light" />
          </div>
          <h1 className="flex items-center gap-2 text-lg sm:text-xl font-bold mb-4">
            <MapPin className="w-5 h-5 shrink-0" />
            {cliente.direccion || "Tu dirección"}
          </h1>

          {/* Igual que en la app: tocar el buscador abre la pantalla de
              búsqueda completa, no filtra en línea. */}
          <button
            onClick={() => router.push("/cliente/buscar")}
            className="relative w-full h-12 rounded-xl bg-white text-left pl-10 pr-4 text-sm text-slate-400 shadow-sm"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            Busca un restaurante o tipo de comida...
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BannerCarousel banners={banners} />
        <PromocionesCarousel promociones={promociones} tipos={tipos} />

        {/* Categorías */}
        {tipos.length > 0 && (
          <HorizontalScroller className="gap-3 pb-3 mb-4 -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 flex flex-col items-center gap-1.5 px-1 ${
                !selectedCategory ? "opacity-100" : "opacity-60 hover:opacity-100"
              } transition-opacity`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  !selectedCategory ? "bg-[#D9043D] text-white" : "bg-white border border-slate-200 text-slate-500"
                }`}
              >
                <Store className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700">Todas</span>
            </button>

            {tipos.map((tipo) => {
              const active = selectedCategory === tipo.nombre;
              const img = buildStorageUrl(tipo.image);
              return (
                <button
                  key={tipo.id}
                  onClick={() => setSelectedCategory(active ? null : tipo.nombre)}
                  className={`shrink-0 flex flex-col items-center gap-1.5 px-1 ${
                    active ? "opacity-100" : "opacity-60 hover:opacity-100"
                  } transition-opacity`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center ${
                      active ? "ring-2 ring-[#D9043D]" : "bg-white border border-slate-200"
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={tipo.nombre}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                      fallback={<Store className="w-6 h-6 text-slate-400" />}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 max-w-[64px] truncate">
                    {tipo.nombre}
                  </span>
                </button>
              );
            })}
          </HorizontalScroller>
        )}

        {/* Filtros rápidos */}
        <div className="flex gap-2 mb-5">
          {(
            [
              { key: "todos", label: "Todos" },
              { key: "abiertos", label: "Abiertos ahora" },
              { key: "cerca", label: "Cerca de ti" },
            ] as { key: QuickFilter; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setQuickFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                quickFilter === key
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {needsAddress && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            Aún no tienes una dirección guardada, así que no podemos mostrarte locales cercanos.{" "}
            <Link href="/cliente/cuenta" className="font-bold underline">
              Completa tu dirección
            </Link>
          </div>
        )}

        {error && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
        )}

        {isLoading && !needsAddress && !error && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-red-600" />
          </div>
        )}

        {!isLoading && !needsAddress && !error && filteredLocales.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            No encontramos locales con esos filtros.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredLocales.map((local, index) => (
            <motion.div
              key={local.business_registration_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
              onClick={() => router.push(`/cliente/locales/${local.business_registration_id}`)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="relative h-32 bg-slate-100 overflow-hidden">
                <SafeImage
                  src={buildStorageUrl(local.banner)}
                  alt={local.nombre_establecimiento}
                  fill
                  className="object-cover object-center"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Store className="w-8 h-8" />
                    </div>
                  }
                />
                <span
                  className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${
                    local.estaAbierto ? "bg-emerald-500 text-white" : "bg-slate-700 text-white"
                  }`}
                >
                  {local.estaAbierto ? "Abierto" : "Cerrado"}
                </span>
              </div>

              <div className="p-4 flex gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white shadow-sm">
                  <SafeImage
                    src={buildStorageUrl(local.ruta_logo)}
                    alt={local.nombre_establecimiento}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Store className="w-5 h-5" />
                      </div>
                    }
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{local.nombre_establecimiento}</h3>
                  <p className="text-xs text-slate-500 truncate">{local.businessType}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDistancia(local.distancia)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
