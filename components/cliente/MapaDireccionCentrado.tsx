// components/cliente/MapaDireccionCentrado.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Loader2 } from "lucide-react";
import { loadLibrary, LIMA_COORDINATES } from "@/app/ubicar-local/services/maps.service";
import type { GoogleMapsLocation } from "@/app/ubicar-local/types/google-maps";

interface Props {
  /** Punto donde centrar el mapa (dirección guardada o ubicación del dispositivo). */
  inicial: GoogleMapsLocation | null;
  /** Se llama cuando el mapa queda quieto: trae la dirección del punto central. */
  onChange: (ubicacion: GoogleMapsLocation) => void;
  /** Avisa si se está buscando la dirección del nuevo punto. */
  onBuscando?: (buscando: boolean) => void;
}

const aUbicacion = (r: google.maps.GeocoderResult, centro: google.maps.LatLng): GoogleMapsLocation => ({
  place_id: r.place_id,
  formatted_address: r.formatted_address,
  center: [centro.lng(), centro.lat()],
  address_components: r.address_components?.map((c) => ({
    long_name: c.long_name,
    short_name: c.short_name,
    types: c.types,
  })),
});

/**
 * Mapa con el pin fijo en el centro, como en la app: el cliente arrastra el mapa y la
 * dirección se actualiza sola al soltar. No hay que tocar el mapa ni buscar nada.
 */
export default function MapaDireccionCentrado({ inicial, onChange, onBuscando }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const onChangeRef = useRef(onChange);
  const onBuscandoRef = useRef(onBuscando);
  const ultimoInicialRef = useRef<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [moviendo, setMoviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
    onBuscandoRef.current = onBuscando;
  }, [onChange, onBuscando]);

  /** Dirección del punto central del mapa. */
  const buscarDireccion = useCallback(async () => {
    const mapa = mapaRef.current;
    const geocoder = geocoderRef.current;
    const centro = mapa?.getCenter();
    if (!mapa || !geocoder || !centro) return;

    onBuscandoRef.current?.(true);
    try {
      const res = await geocoder.geocode({ location: centro });
      // El primer resultado suele ser el más preciso; se evita el "plus code" si hay otro
      const mejor = res.results.find((r) => !r.types.includes("plus_code")) ?? res.results[0];
      if (mejor) onChangeRef.current(aUbicacion(mejor, centro));
    } catch {
      // sin dirección para este punto: el cliente puede mover el mapa un poco
    } finally {
      onBuscandoRef.current?.(false);
    }
  }, []);

  // Crear el mapa una sola vez
  useEffect(() => {
    let cancelado = false;
    const iniciar = async () => {
      try {
        const [mapsLib, geocodingLib] = await Promise.all([
          loadLibrary<google.maps.MapsLibrary>("maps"),
          loadLibrary<google.maps.GeocodingLibrary>("geocoding"),
        ]);
        if (cancelado || !contenedorRef.current) return;

        geocoderRef.current = new geocodingLib.Geocoder();
        const [lng, lat] = inicial?.center ?? [LIMA_COORDINATES.lng, LIMA_COORDINATES.lat];
        const mapa = new mapsLib.Map(contenedorRef.current, {
          center: { lat, lng },
          zoom: inicial ? 17 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
        });
        mapaRef.current = mapa;
        ultimoInicialRef.current = inicial ? inicial.center.join(",") : null;

        mapa.addListener("dragstart", () => setMoviendo(true));
        mapa.addListener("idle", () => {
          setMoviendo(false);
          buscarDireccion();
        });
        setCargando(false);
      } catch {
        if (!cancelado) setError("No se pudo cargar el mapa");
      }
    };
    iniciar();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si llega un punto inicial nuevo (dirección guardada encontrada, GPS), el mapa va allí
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !inicial) return;
    const clave = inicial.center.join(",");
    if (clave === ultimoInicialRef.current) return;
    ultimoInicialRef.current = clave;
    mapa.setCenter({ lat: inicial.center[1], lng: inicial.center[0] });
    mapa.setZoom(17);
  }, [inicial, cargando]);

  const irAMiUbicacion = () => {
    const mapa = mapaRef.current;
    if (!mapa || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapa.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapa.setZoom(18);
      },
      () => undefined,
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full h-[55vh] min-h-[280px] max-h-[460px] rounded-xl overflow-hidden bg-slate-100">
      <div ref={contenedorRef} className="absolute inset-0" />

      {cargando && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-red-600 p-4 text-center">
          {error}
        </div>
      )}

      {/* Pin fijo en el centro: la punta queda exactamente sobre el centro del mapa */}
      {!cargando && !error && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2">
          <svg
            width="40"
            height="48"
            viewBox="0 0 24 30"
            className={`-translate-y-full drop-shadow-md transition-transform duration-150 ${
              moviendo ? "-translate-y-[calc(100%+8px)]" : ""
            }`}
            aria-hidden="true"
          >
            <path
              d="M12 0C5.9 0 1 4.9 1 11c0 8.2 11 19 11 19s11-10.8 11-19C23 4.9 18.1 0 12 0z"
              fill="#D9043D"
            />
            <circle cx="12" cy="11" r="4.2" fill="white" />
          </svg>
        </div>
      )}

      <button
        type="button"
        onClick={irAMiUbicacion}
        className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center text-[#D9043D] hover:bg-slate-50"
        title="Mi ubicación"
      >
        <Crosshair className="w-5 h-5" />
      </button>
    </div>
  );
}
