// components/cliente/PromocionesCarousel.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/cliente/SafeImage";
import { buildStorageUrl, type Promocion, type TipoNegocio } from "@/services/clienteLocalesService";

const PANTALLAS_FIJAS: Record<string, string> = {
  cupones: "/cliente/cupones",
  perfil: "/cliente/cuenta",
  home: "/cliente/locales",
};

const AUTO_SCROLL_MS = 4000;

interface Props {
  promociones: Promocion[];
  tipos: TipoNegocio[];
}

export default function PromocionesCarousel({ promociones, tipos }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (promociones.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % promociones.length);
    }, AUTO_SCROLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [promociones.length]);

  if (promociones.length === 0) return null;

  const handleTap = (promo: Promocion) => {
    if (promo.tipo_destino === "pantalla" && promo.pantalla) {
      router.push(PANTALLAS_FIJAS[promo.pantalla] || "/cliente/locales");
      return;
    }
    if (promo.tipo_destino === "restaurante" && promo.destino_id) {
      router.push(`/cliente/locales/${promo.destino_id}`);
      return;
    }
    if (promo.tipo_destino === "categoria" && promo.destino_id) {
      const tipo = tipos.find((t) => t.id === promo.destino_id);
      if (tipo) {
        router.push(`/cliente/locales?categoria=${encodeURIComponent(tipo.nombre)}`);
      }
    }
  };

  const promo = promociones[index];

  return (
    <div className="mb-6">
      <button
        onClick={() => handleTap(promo)}
        className="relative w-full aspect-[16/9] sm:aspect-[16/8] max-h-80 rounded-2xl overflow-hidden shadow-sm block text-left bg-slate-950 group"
      >
        {/* Fondo ambiental difuminado para rellenar los bordes sin barras negras */}
        <SafeImage
          src={buildStorageUrl(promo.imagen)}
          alt=""
          fill
          className="object-cover blur-xl scale-110 opacity-40 pointer-events-none"
          fallback={null}
        />

        {/* Imagen principal completa centrada sin recortes */}
        <SafeImage
          src={buildStorageUrl(promo.imagen)}
          alt={promo.titulo}
          fill
          className="object-contain object-center relative z-10"
          fallback={null}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-white font-black text-base leading-tight drop-shadow-sm">{promo.titulo}</h3>
          {promo.subtitulo && <p className="text-white/90 text-xs mt-0.5 drop-shadow-sm">{promo.subtitulo}</p>}
        </div>
      </button>

      {promociones.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {promociones.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-[#D9043D]" : "w-1.5 bg-slate-300"
              }`}
              aria-label={`Ir a la promoción ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
