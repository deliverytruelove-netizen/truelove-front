// components/cliente/HorizontalScroller.tsx
"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollerProps {
  children: React.ReactNode;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
}

export default function HorizontalScroller({ children, className = "", innerRef }: HorizontalScrollerProps) {
  const localRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (el: HTMLDivElement | null) => {
    localRef.current = el;
    if (typeof innerRef === "function") innerRef(el);
    else if (innerRef && "current" in innerRef) (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  const scrollBy = (amount: number) => {
    localRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Permite usar la rueda del mouse (vertical) para desplazar el listado
    // horizontal, ya que en desktop no hay barra de scroll visible.
    if (!localRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      localRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="relative group/scroller">
      <button
        type="button"
        onClick={() => scrollBy(-220)}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition-opacity"
        aria-label="Desplazar a la izquierda"
      >
        <ChevronLeft className="w-4 h-4 text-slate-600" />
      </button>

      <div ref={setRefs} onWheel={handleWheel} className={`flex overflow-x-auto no-scrollbar ${className}`}>
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(220)}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition-opacity"
        aria-label="Desplazar a la derecha"
      >
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </button>
    </div>
  );
}
