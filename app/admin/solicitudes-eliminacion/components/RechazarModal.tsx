"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { rechazarSolicitud } from "../services/solicitud-eliminacion.service";
import { SolicitudEliminacion } from "../types/solicitud-eliminacion.types";

interface RechazarModalProps {
  solicitud: SolicitudEliminacion;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RechazarModal({
  solicitud,
  onClose,
  onSuccess,
}: RechazarModalProps) {
  const [motivo, setMotivo] = useState("");

  const mutation = useMutation({
    mutationFn: (admin_notes: string) =>
      rechazarSolicitud(solicitud.id, { admin_notes }),
    onSuccess: async () => {
      await Swal.fire({
        title: "¡Rechazada!",
        text: "La solicitud ha sido rechazada. Se enviará un email al cliente.",
        icon: "success",
        confirmButtonColor: "#dc2626",
      });
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!motivo.trim()) {
      Swal.fire({
        title: "Campo requerido",
        text: "Por favor indica el motivo del rechazo",
        icon: "warning",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    mutation.mutate(motivo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Rechazar Solicitud
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={mutation.isPending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Info del cliente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Cliente:</p>
              <p className="font-medium text-gray-900">
                {solicitud.cliente.nombre} {solicitud.cliente.apellido}
              </p>
              <p className="text-sm text-gray-600 mt-2">ID Solicitud:</p>
              <p className="font-medium text-red-600">
                {solicitud.request_id}
              </p>
            </div>

            {/* Advertencia */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>ℹ️ Importante:</strong> Al rechazar esta solicitud, la
                cuenta del cliente permanecerá activa y se le notificará por
                correo electrónico.
              </p>
            </div>

            {/* Motivo */}
            <div>
              <label
                htmlFor="motivo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Motivo del rechazo <span className="text-red-600">*</span>
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Indica por qué se rechaza esta solicitud (este mensaje se enviará al cliente)..."
                disabled={mutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                El cliente recibirá este motivo en su correo electrónico
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              disabled={mutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                "Rechazar Solicitud"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
