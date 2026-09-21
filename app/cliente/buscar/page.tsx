// app/cliente/buscar/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, Search, Store, X } from "lucide-react";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import SafeImage from "@/components/cliente/SafeImage";
import {
  CLIENTE_LOCALES_STORAGE_KEY,
  Local,
  buildStorageUrl,
  searchLocales,
} from "@/services/clienteLocalesService";

function formatDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function ClienteBuscarPage() {
  const router = useRouter();
  const { cliente } = useClienteAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [initialLocales, setInitialLocales] = useState<Local[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Local[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    try {
      const stored = sessionStorage.getItem(CLIENTE_LOCALES_STORAGE_KEY);
      if (stored) setInitialLocales(JSON.parse(stored));
    } catch {
      // ignorar si no hay datos guardados
    }
  }, []);

  useEffect(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      setResults([]);
      return;
    }

    // Filtro local inmediato sobre los locales ya cargados en el home,
    // igual que la app (_filterLocales).
    setResults(
      initialLocales.filter(
        (l) =>
          l.nombre_establecimiento.toLowerCase().includes(term) ||
          (l.direccion_completa || "").toLowerCase().includes(term)
      )
    );

    if (term.length < 3 || !cliente?.id) return;

    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchLocales(cliente.id, term)
        .then((data) => {
          if (!cancelled) setResults(data);
        })
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, initialLocales, cliente?.id]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca un restaurante o tipo de comida..."
            className="w-full h-11 rounded-full bg-slate-100 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-[#D9043D]/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {!query && (
          <div className="flex flex-col items-center text-center py-20 text-slate-400">
            <Search className="w-12 h-12 mb-4 text-slate-200" />
            <h2 className="text-lg font-bold text-slate-700 mb-1">¡Bienvenido a True Love!</h2>
            <p className="text-sm">Busca tu restaurante o comida favorita</p>
          </div>
        )}

        {query && (
          <>
            {isSearching && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-red-600" />
              </div>
            )}

            {!isSearching && results.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm">
                No encontramos resultados para &quot;{query}&quot;
              </div>
            )}

            <div className="space-y-3">
              {results.map((local) => (
                <div
                  key={local.business_registration_id}
                  onClick={() => router.push(`/cliente/locales/${local.business_registration_id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-50">
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{local.nombre_establecimiento}</p>
                    <p className="text-xs text-slate-500 truncate">{local.businessType}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        local.estaAbierto ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {local.estaAbierto ? "Abierto" : "Cerrado"}
                    </span>
                    <p className="flex items-center justify-end gap-1 text-[11px] text-slate-400 mt-1">
                      <MapPin className="w-3 h-3" />
                      {formatDistancia(local.distancia)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
