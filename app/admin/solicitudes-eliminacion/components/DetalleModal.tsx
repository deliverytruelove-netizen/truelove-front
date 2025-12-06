"use client";

import React from "react";
import { X, User, Mail, FileText, Calendar, Hash } from "lucide-react";
import { SolicitudEliminacion } from "../types/solicitud-eliminacion.types";

interface DetalleModalProps {
  solicitud: SolicitudEliminacion;
  onClose: () => void;
}

export default function DetalleModal({ solicitud, onClose }: DetalleModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Detalles de la Solicitud
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* ID de Solicitud */}
          <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600">ID de Solicitud</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              {solicitud.request_id}
            </p>
          </div>

          {/* Layout de dos columnas en PC */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              {/* Información del Cliente */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  Información del Cliente
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nombre completo</p>
                    <p className="font-medium text-gray-900">
                      {solicitud.cliente.nombre} {solicitud.cliente.apellido}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Documento</p>
                    <p className="font-medium text-gray-900">
                      {solicitud.cliente.documento}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Celular</p>
                    <p className="font-medium text-gray-900">
                      {solicitud.cliente.celular || "No registrado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Correo electrónico
                    </p>
                    <p className="font-medium text-gray-900">
                      {solicitud.cliente.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Información de Fechas
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fecha de solicitud:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(solicitud.requested_at)}
                    </span>
                  </div>
                  {solicitud.code_verified_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Código verificado:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(solicitud.code_verified_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              {/* Motivo */}
              {solicitud.motivo && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Motivo de Eliminación
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {solicitud.motivo}
                    </p>
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">
                  Estado: Pendiente de revisión
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
