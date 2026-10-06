// components/cliente/AddressPickerDialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapComponent from "@/app/ubicar-local/components/BusinessMap";
import SearchComponent from "@/app/ubicar-local/components/Search";
import type { GoogleMapsLocation } from "@/app/ubicar-local/types/google-maps";
import { loadLibrary } from "@/app/ubicar-local/services/maps.service";
import { updateClienteDireccion } from "@/services/clienteProfileService";

interface AddressPickerDialogProps {
  open: boolean;
  idCliente: number;
  /** Dirección guardada: al abrir, el mapa se centra ahí (como en la app). */
  direccionActual?: string | null;
  onClose: () => void;
  onSaved: (direccion: string) => void;
}

/** Convierte un resultado del geocodificador de Google en la ubicación que usa el mapa. */
const aUbicacion = (r: google.maps.GeocoderResult): GoogleMapsLocation => ({
  place_id: r.place_id,
  formatted_address: r.formatted_address,
  center: [r.geometry.location.lng(), r.geometry.location.lat()],
  address_components: r.address_components?.map((c) => ({
    long_name: c.long_name,
    short_name: c.short_name,
    types: c.types,
  })),
});

export default function AddressPickerDialog({
  open,
  idCliente,
  direccionActual,
  onClose,
  onSaved,
}: AddressPickerDialogProps) {
  const [location, setLocation] = useState<GoogleMapsLocation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingInicial, setIsLoadingInicial] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Igual que la app: al abrir se ubica la dirección guardada en el mapa; si no hay
  // (o no se encuentra), se intenta con la ubicación actual del dispositivo.
  useEffect(() => {
    if (!open) {
      setLocation(null);
      setError(null);
      return;
    }

    let cancelado = false;
    const cargarInicial = async () => {
      setIsLoadingInicial(true);
      try {
        const lib = await loadLibrary<google.maps.GeocodingLibrary>("geocoding");
        const geocoder = new lib.Geocoder();

        const direccion = direccionActual?.trim();
        if (direccion) {
          try {
            const res = await geocoder.geocode({ address: direccion, region: "pe" });
            if (!cancelado && res.results[0]) {
              setLocation(aUbicacion(res.results[0]));
              return;
            }
          } catch {
            // se prueba con el GPS
          }
        }

        if (typeof navigator !== "undefined" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const res = await geocoder.geocode({
                  location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                });
                if (!cancelado && res.results[0]) setLocation(aUbicacion(res.results[0]));
              } catch {
                // sin ubicación inicial: el cliente elige en el mapa
              }
            },
            () => undefined,
            { timeout: 8000 }
          );
        }
      } catch {
        // si Google Maps no carga, el mapa mostrará su propio error
      } finally {
        if (!cancelado) setIsLoadingInicial(false);
      }
    };

    cargarInicial();
    return () => {
      cancelado = true;
    };
  }, [open, direccionActual]);

  const handleConfirm = async () => {
    if (!location) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateClienteDireccion(idCliente, location.formatted_address, location.center);
      onSaved(location.formatted_address);
      setLocation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la dirección");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirmar dirección</DialogTitle>
        </DialogHeader>

        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

        <SearchComponent onLocationSelect={setLocation} />
        <MapComponent selectedLocation={location} onLocationUpdate={setLocation} />

        <div className="text-sm text-slate-600 min-h-[2.5rem]">
          {isLoadingInicial ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Ubicando tu dirección…
            </span>
          ) : location ? (
            <span className="font-semibold text-slate-800">{location.formatted_address}</span>
          ) : (
            "Busca tu dirección o toca el mapa para elegir el punto de entrega."
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!location || isSaving || isLoadingInicial}
          className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Continuar"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
