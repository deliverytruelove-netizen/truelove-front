"use client"

import { Calendar, Clock, AlertTriangle } from "lucide-react"
import { CuotaActiva, Periodo } from "../types/pago-cuota.types"
import { formatearFechaSafe } from "../utils/fecha-pago.utils"

interface RecordatorioPagoCardProps {
  cuota: CuotaActiva
  diasRestantes?: number | null
  periodoActual?: Periodo | null
}

export default function RecordatorioPagoCard({ cuota, diasRestantes, periodoActual }: RecordatorioPagoCardProps) {
  if (diasRestantes === null || diasRestantes === undefined) {
    return null
  }

  const esPorcentaje = cuota.tipo_cuota === "porcentaje"

  const getVencimientoLabel = () => {
    // Para porcentaje: mostrar fecha de vencimiento del período
    if (esPorcentaje && periodoActual?.fecha_vencimiento) {
      return `Vence: ${formatearFechaSafe(periodoActual.fecha_vencimiento, { day: "2-digit", month: "short" })}`
    }
    // Para monto fijo: mostrar día de la semana/mes
    if (!cuota.dia_pago) return ""
    switch (cuota.periodicidad) {
      case "semanal": {
        const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        return `${diasSemana[cuota.dia_pago!] || cuota.dia_pago} de cada semana`
      }
      case "quincenal":
        return `${cuota.dia_pago} de cada quincena`
      default:
        return `${cuota.dia_pago} de cada mes`
    }
  }

  const getAlertaInfo = (dias: number) => {
    if (dias === 0) {
      return {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-300 dark:border-yellow-800",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/40",
        icon: <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
        titulo: esPorcentaje ? "¡Tu pago vence hoy!" : "¡Hoy es tu día de pago!",
        tituloColor: "text-yellow-800 dark:text-yellow-300",
        mensaje: "Recuerda realizar tu pago antes de que termine el día.",
        urgencia: "alta"
      }
    }
    if (dias > 0 && dias <= 3) {
      return {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-300 dark:border-yellow-800",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/40",
        icon: <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
        titulo: `Pago próximo en ${dias} día${dias !== 1 ? "s" : ""}`,
        tituloColor: "text-yellow-800 dark:text-yellow-300",
        mensaje: "Prepara tu comprobante de pago.",
        urgencia: "media"
      }
    }
    if (dias < 0) {
      return {
        bg: "bg-brand-50 dark:bg-brand-900/20",
        border: "border-brand-300 dark:border-brand-800",
        iconBg: "bg-brand-100 dark:bg-brand-900/40",
        icon: <AlertTriangle className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
        titulo: `Pago vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? "s" : ""}`,
        tituloColor: "text-brand-800 dark:text-brand-300",
        mensaje: "Realiza tu pago lo antes posible.",
        urgencia: "critica"
      }
    }
    if (dias > 3 && dias <= 7) {
      return {
        bg: "bg-gray-50 dark:bg-gray-800",
        border: "border-gray-300 dark:border-gray-700",
        iconBg: "bg-gray-100 dark:bg-gray-700",
        icon: <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
        titulo: `Próximo pago en ${dias} días`,
        tituloColor: "text-gray-800 dark:text-gray-200",
        mensaje: esPorcentaje
          ? `Tu pago vence el ${formatearFechaSafe(periodoActual?.fecha_vencimiento, { day: "2-digit", month: "short" })}.`
          : cuota.periodicidad === "semanal"
            ? `Tu día de pago es cada ${["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][cuota.dia_pago!] || `día ${cuota.dia_pago}`}.`
            : `Tu día de pago es el ${cuota.dia_pago} de cada ${cuota.periodicidad === "quincenal" ? "quincena" : "mes"}.`,
        urgencia: "baja"
      }
    }

    return null
  }

  const alertaInfo = getAlertaInfo(diasRestantes)

  if (!alertaInfo) {
    return null
  }

  return (
    <div className={`${alertaInfo.bg} border ${alertaInfo.border} rounded-lg px-3 py-2.5 transition-all duration-300`}>
      <div className="flex items-center gap-2.5">
        <div className={`${alertaInfo.iconBg} rounded-full p-1.5 flex-shrink-0`}>
          {alertaInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`font-semibold text-sm ${alertaInfo.tituloColor}`}>
              {alertaInfo.titulo}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {getVencimientoLabel()}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {alertaInfo.mensaje}
          </p>
        </div>

        {/* Botón de acción para urgencia alta/critica */}
        {(alertaInfo.urgencia === "alta" || alertaInfo.urgencia === "critica") && (
          <button
            onClick={() => {
              const formulario = document.getElementById("formulario-pago")
              if (formulario) {
                formulario.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              alertaInfo.urgencia === "critica"
                ? "bg-brand-600 hover:bg-brand-700 text-white"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
          >
            Pagar
          </button>
        )}
      </div>
    </div>
  )
}
