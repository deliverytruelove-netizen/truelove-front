"use client"

import { MiPago } from "../types/pago-cuota.types"
import { CheckCircle, XCircle, Clock, Eye, Receipt, CreditCard } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface HistorialPagosProps {
  pagos: MiPago[]
}

export default function HistorialPagos({ pagos }: HistorialPagosProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Aprobado
          </span>
        )
      case "rechazado":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rechazado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" />
            En revisión
          </span>
        )
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          {pagos.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-3" />
              <p className="font-medium text-gray-500 dark:text-gray-400">No hay pagos registrados</p>
              <p className="text-xs mt-1 dark:text-gray-500">Tus comprobantes de pago aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pagos.map((pago) => (
                <div key={pago.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">S/ {Number(pago.monto_pagado).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatFecha(pago.fecha_pago)}</p>
                    </div>
                    {getEstadoBadge(pago.estado_pago)}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {pago.metodo_pago && (
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="capitalize">{pago.metodo_pago}</span>
                      </div>
                    )}
                    {pago.numero_operacion && (
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        Op: <span className="font-mono font-medium">{pago.numero_operacion}</span>
                      </div>
                    )}
                  </div>

                  {pago.comprobante_pago && (
                    <button
                      onClick={() => setSelectedImage(pago.comprobante_pago || null)}
                      className="mt-2 flex items-center gap-1.5 text-brand-600 hover:text-brand-800 text-xs font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver comprobante
                    </button>
                  )}

                  {pago.estado_pago === "rechazado" && pago.motivo_rechazo && (
                    <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-xs font-medium text-red-800 dark:text-red-300">Motivo de rechazo:</p>
                      <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{pago.motivo_rechazo}</p>
                    </div>
                  )}

                  {pago.observaciones && (
                    <div className="mt-2 p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{pago.observaciones}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Ver Imagen */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
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
