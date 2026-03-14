"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Calendar, Coins, X } from "lucide-react"
import { Periodo } from "../types/pago-cuota.types"

interface AdvertenciaVencimientoModalProps {
  periodo: Periodo | null
  onClose: () => void
  onPagar?: () => void
}

export default function AdvertenciaVencimientoModal({ periodo, onClose, onPagar }: AdvertenciaVencimientoModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (periodo && periodo.estado === "pendiente" && periodo.dias_para_vencer !== undefined && periodo.dias_para_vencer <= 5) {
      setIsOpen(true)
    }
  }, [periodo])

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  if (!isOpen || !periodo) return null

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const getColorClass = () => {
    if (!periodo.dias_para_vencer) return "bg-yellow-600"
    if (periodo.dias_para_vencer <= 2) return "bg-red-600"
    if (periodo.dias_para_vencer <= 5) return "bg-yellow-600"
    return "bg-blue-600"
  }

  const getMensaje = () => {
    if (!periodo.dias_para_vencer) return "Tu período está próximo a vencer"
    if (periodo.dias_para_vencer === 0) return "¡Tu período vence HOY!"
    if (periodo.dias_para_vencer === 1) return "¡Tu período vence MAÑANA!"
    return `Tu período vence en ${periodo.dias_para_vencer} días`
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className={`${getColorClass()} text-white px-6 py-4 rounded-t-lg flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold">Recordatorio de Pago</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-2">{getMensaje()}</p>
              <p className="text-gray-600">No olvides realizar tu pago para mantener tu acceso activo</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                  <p className="font-semibold text-gray-900">{formatFecha(periodo.fecha_vencimiento)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Coins className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Monto a Pagar</p>
                  <p className="font-bold text-lg text-gray-900">S/ {Number(periodo.monto_esperado).toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                <p className="text-sm text-gray-600 mb-1">Período de Pago</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatFecha(periodo.periodo_inicio)} - {formatFecha(periodo.periodo_fin)}
                </p>
              </div>
            </div>

            {periodo.dias_para_vencer !== undefined && periodo.dias_para_vencer <= 2 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium text-center">
                  ⚠️ Recuerda que si no pagas a tiempo, tu acceso al sistema será bloqueado
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Recordar más tarde
            </button>
            <button
              onClick={() => {
                handleClose()
                if (onPagar) {
                  onPagar()
                } else {
                  // Scroll to the payment form (cuando se usa dentro de la página de cuotas)
                  const paymentForm = document.querySelector('[class*="SubirComprobante"]')
                  if (paymentForm) {
                    paymentForm.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                }
              }}
              className={`flex-1 px-4 py-2 ${getColorClass()} text-white font-medium rounded-lg hover:opacity-90 transition-opacity`}
            >
              Pagar Ahora
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
