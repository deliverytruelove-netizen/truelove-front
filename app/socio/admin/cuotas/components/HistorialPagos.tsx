"use client"

import { MiPago } from "../types/pago-cuota.types"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface HistorialPagosProps {
  pagos: MiPago[]
}

export default function HistorialPagos({ pagos }: HistorialPagosProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const getEstadoBadge = (estado: string) => {
    if (estado === "aprobado") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprobado
        </span>
      )
    }
    if (estado === "rechazado") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rechazado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pendiente
      </span>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Pagos</h2>

        {pagos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No hay pagos registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pagos.map((pago) => (
              <div key={pago.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">S/ {Number(pago.monto_pagado).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(pago.fecha_pago).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {getEstadoBadge(pago.estado_pago)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Método de Pago</p>
                    <p className="font-medium text-gray-900 capitalize">{pago.metodo_pago || "-"}</p>
                  </div>

                  {pago.numero_operacion && (
                    <div>
                      <p className="text-gray-600">Núm. Operación</p>
                      <p className="font-medium text-gray-900">{pago.numero_operacion}</p>
                    </div>
                  )}
                </div>

                {pago.comprobante_pago && (
                  <button
                    onClick={() => setSelectedImage(pago.comprobante_pago || null)}
                    className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver comprobante
                  </button>
                )}

                {pago.estado_pago === "rechazado" && pago.motivo_rechazo && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800">Motivo de Rechazo:</p>
                    <p className="text-sm text-red-700 mt-1">{pago.motivo_rechazo}</p>
                  </div>
                )}

                {pago.observaciones && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-600">{pago.observaciones}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Ver Imagen */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <Image
              src={`/storage/${selectedImage}`}
              alt="Comprobante"
              width={800}
              height={600}
              className="rounded-lg object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </>
  )
}
