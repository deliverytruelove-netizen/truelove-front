"use client"

import { Calendar, Clock, AlertTriangle } from "lucide-react"
import { CuotaActiva } from "../types/pago-cuota.types"

interface RecordatorioPagoCardProps {
  cuota: CuotaActiva
  diasRestantes?: number | null
}

export default function RecordatorioPagoCard({ cuota, diasRestantes }: RecordatorioPagoCardProps) {
  // Si no hay día de pago definido o días restantes, no mostrar nada
  if (!cuota.dia_pago || diasRestantes === null || diasRestantes === undefined) {
    return null
  }

  const getAlertaInfo = (dias: number) => {
    if (dias === 0) {
      return {
        color: "bg-green-100 border-green-400 text-green-800",
        icon: <Calendar className="w-5 h-5 text-green-600" />,
        titulo: "¡Hoy es tu día de pago!",
        mensaje: "Recuerda realizar tu pago antes de que termine el día.",
        urgencia: "alta"
      }
    }
    if (dias > 0 && dias <= 3) {
      return {
        color: "bg-yellow-100 border-yellow-400 text-yellow-800",
        icon: <Clock className="w-5 h-5 text-yellow-600" />,
        titulo: `Pago próximo en ${dias} día${dias !== 1 ? "s" : ""}`,
        mensaje: "Prepara tu comprobante de pago.",
        urgencia: "media"
      }
    }
    if (dias < 0) {
      return {
        color: "bg-red-100 border-red-400 text-red-800",
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        titulo: `Pago vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? "s" : ""}`,
        mensaje: "Realiza tu pago lo antes posible para evitar inconvenientes.",
        urgencia: "critica"
      }
    }
    // Si faltan más de 3 días, mostrar recordatorio suave
    if (dias > 3 && dias <= 7) {
      return {
        color: "bg-blue-100 border-blue-400 text-blue-800",
        icon: <Calendar className="w-5 h-5 text-blue-600" />,
        titulo: `Próximo pago en ${dias} días`,
        mensaje: `Tu día de pago es el ${cuota.dia_pago} de cada mes.`,
        urgencia: "baja"
      }
    }
    
    return null
  }

  const alertaInfo = getAlertaInfo(diasRestantes)

  // Solo mostrar alertas para casos importantes (próximo, hoy, vencido, o recordatorio semanal)
  if (!alertaInfo) {
    return null
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${alertaInfo.color} transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {alertaInfo.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">
            {alertaInfo.titulo}
          </h3>
          <p className="text-sm mb-3">
            {alertaInfo.mensaje}
          </p>
          
          {/* Información adicional del día de pago */}
          <div className="text-xs opacity-75 border-t border-current pt-2 mt-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Día de pago: {cuota.dia_pago} de cada mes</span>
            </div>
            {cuota.dia_pago_nota && (
              <div className="mt-1 text-xs">
                <span className="font-medium">Nota:</span> {cuota.dia_pago_nota}
              </div>
            )}
          </div>

          {/* Botón de acción según la urgencia */}
          {(alertaInfo.urgencia === "alta" || alertaInfo.urgencia === "critica") && (
            <div className="mt-3">
              <button
                onClick={() => {
                  // Scroll al formulario de pago si existe
                  const formulario = document.getElementById("formulario-pago")
                  if (formulario) {
                    formulario.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  alertaInfo.urgencia === "critica"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {alertaInfo.urgencia === "critica" ? "Pagar Ahora" : "Realizar Pago"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}