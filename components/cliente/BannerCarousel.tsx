// components/cliente/BannerCarousel.tsx
"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SafeImage from "@/components/cliente/SafeImage";
import { buildStorageUrl, type Banner } from "@/services/clienteLocalesService";

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  if (banners.length === 0) return null;

  const goTo = (i: number) => setIndex((i + banners.length) % banners.length);
  const banner = banners[index];

  return (
    <div className="relative mb-6">
      <div
        className="relative rounded-2xl overflow-hidden shadow-sm h-[140px] flex items-center px-6"
        style={{ backgroundColor: banner.color_fondo || "#D9043D" }}
      >
        <SafeImage
          src={buildStorageUrl(banner.url_imagen)}
          alt={banner.titulo}
          fill
          className="object-cover object-center opacity-25"
          fallback={null}
        />
        <div className="relative z-10 max-w-[70%]">
          <h3 className="text-white font-black text-lg sm:text-xl leading-tight mb-1">{banner.titulo}</h3>
          <p className="text-white/85 text-sm mb-3">{banner.subtitulo}</p>
          {banner.texto_boton && (
            <span className="inline-block text-[11px] font-bold uppercase tracking-wide bg-white/20 text-white px-3 py-1.5 rounded-full">
              {banner.texto_boton}
            </span>
          )}
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-[#D9043D]" : "w-1.5 bg-slate-300"
              }`}
              aria-label={`Ir al banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
