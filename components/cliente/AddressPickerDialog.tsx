// components/cliente/AddressPickerDialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapaDireccionCentrado from "@/components/cliente/MapaDireccionCentrado";
import type { GoogleMapsLocation } from "@/app/ubicar-local/types/google-maps";
import { loadLibrary } from "@/app/ubicar-local/services/maps.service";
import { actualizarDireccion, crearDireccion, type DireccionCliente } from "@/services/clienteDireccionesService";

const ALIAS = ["Casa", "Trabajo", "Hotel", "Otro"];

interface AddressPickerDialogProps {
  open: boolean;
  idCliente: number;
  /** Dirección a editar; sin ella se crea una nueva. Al abrir, el mapa se centra ahí (como en la app). */
  direccion?: DireccionCliente | null;
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
  direccion: editando,
  onClose,
  onSaved,
}: AddressPickerDialogProps) {
  // Dónde centrar el mapa al abrir (dirección guardada o GPS)
  const [inicial, setInicial] = useState<GoogleMapsLocation | null>(null);
  const [inicialListo, setInicialListo] = useState(false);
  // Punto que marca el pin ahora mismo
  const [location, setLocation] = useState<GoogleMapsLocation | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alias, setAlias] = useState("Casa");
  const [referencia, setReferencia] = useState("");

  // Igual que la app: al abrir se ubica la dirección guardada en el mapa; si no hay
  // (o no se encuentra), se intenta con la ubicación actual del dispositivo.
  useEffect(() => {
    if (!open) {
      setInicial(null);
      setInicialListo(false);
      setLocation(null);
      setError(null);
      return;
    }

    setAlias(editando?.alias && ALIAS.includes(editando.alias) ? editando.alias : editando?.alias ? "Otro" : "Casa");
    setReferencia(editando?.referencia ?? "");

    let cancelado = false;
    const cargarInicial = async () => {
      try {
        const lib = await loadLibrary<google.maps.GeocodingLibrary>("geocoding");
        const geocoder = new lib.Geocoder();

        // Dirección guardada con coordenadas: se centra exactamente ahí
        if (editando?.latitud != null && editando?.longitud != null) {
          if (!cancelado) {
            setInicial({
              formatted_address: editando.direccion,
              center: [editando.longitud, editando.latitud],
            });
          }
          return;
        }

        const direccion = editando?.direccion?.trim();
        if (direccion) {
          try {
            const res = await geocoder.geocode({ address: direccion, region: "pe" });
            if (!cancelado && res.results[0]) {
              setInicial(aUbicacion(res.results[0]));
              return;
            }
          } catch {
            // se prueba con el GPS
          }
        }

        if (typeof navigator !== "undefined" && navigator.geolocation) {
          await new Promise<void>((resolver) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                if (!cancelado) {
                  setInicial({
                    formatted_address: "",
                    center: [pos.coords.longitude, pos.coords.latitude],
                  });
                }
                resolver();
              },
              () => resolver(),
              { timeout: 8000 }
            );
          });
        }
      } catch {
        // si Google Maps no carga, el mapa mostrará su propio error
      } finally {
        if (!cancelado) setInicialListo(true);
      }
    };

    cargarInicial();
    return () => {
      cancelado = true;
    };
  }, [open, editando]);

  const handleConfirm = async () => {
    if (!location) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        direccion: location.formatted_address,
        center: location.center,
        alias,
        referencia: referencia.trim() || null,
        departamento: editando?.departamento ?? null,
      };
      if (editando) await actualizarDireccion(idCliente, editando.id, payload);
      else await crearDireccion(idCliente, payload);
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
          <DialogTitle>{editando ? "Editar dirección" : "Nueva dirección"}</DialogTitle>
        </DialogHeader>

        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

        <p className="text-xs text-slate-500 -mt-1">
          Mueve el mapa hasta que el pin quede en el lugar correcto.
        </p>

        {/* El mapa se crea cuando ya se sabe dónde centrarlo, para no abrir en otra ciudad */}
        {inicialListo ? (
          <MapaDireccionCentrado inicial={inicial} onChange={setLocation} onBuscando={setBuscando} />
        ) : (
          <div className="h-[55vh] min-h-[280px] max-h-[460px] rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {/* La dirección se rellena sola al mover el mapa: no es un buscador */}
        <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-slate-200 bg-slate-50">
          <MapPin className="w-4 h-4 text-[#D9043D] shrink-0" />
          <input
            readOnly
            value={buscando ? "Buscando dirección…" : location?.formatted_address || ""}
            placeholder="Dirección seleccionada"
            className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none truncate"
          />
          {buscando && <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />}
        </div>

        <div className="flex flex-wrap gap-2">
          {ALIAS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAlias(a)}
              className={`h-8 px-3 rounded-full text-xs font-bold border transition-colors ${
                alias === a ? "bg-[#D9043D] border-[#D9043D] text-white" : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <input
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          maxLength={100}
          placeholder="Referencia (piso, color de puerta, etc.)"
          className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#D9043D]"
        />

        <button
          onClick={handleConfirm}
          disabled={!location || buscando || isSaving}
          className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar dirección"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
