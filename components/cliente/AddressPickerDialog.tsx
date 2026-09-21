// components/cliente/AddressPickerDialog.tsx
"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapComponent from "@/app/ubicar-local/components/BusinessMap";
import SearchComponent from "@/app/ubicar-local/components/Search";
import type { GoogleMapsLocation } from "@/app/ubicar-local/types/google-maps";
import { updateClienteDireccion } from "@/services/clienteProfileService";

interface AddressPickerDialogProps {
  open: boolean;
  idCliente: number;
  onClose: () => void;
  onSaved: (direccion: string) => void;
}

export default function AddressPickerDialog({ open, idCliente, onClose, onSaved }: AddressPickerDialogProps) {
  const [location, setLocation] = useState<GoogleMapsLocation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <DialogTitle>Cambiar dirección de entrega</DialogTitle>
        </DialogHeader>

        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

        <SearchComponent onLocationSelect={setLocation} />
        <MapComponent selectedLocation={location} onLocationUpdate={setLocation} />

        <button
          onClick={handleConfirm}
          disabled={!location || isSaving}
          className="w-full h-11 bg-[#D9043D] hover:bg-[#b8032f] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirmar dirección"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
