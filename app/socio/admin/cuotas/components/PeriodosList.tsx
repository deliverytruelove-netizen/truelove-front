"use client"

import { Periodo } from "../types/pago-cuota.types"
import { CheckCircle, Clock, XCircle, Calendar, AlertTriangle } from "lucide-react"

interface PeriodosListProps {
  periodos: Periodo[]
  periodoActualId?: number
}

export default function PeriodosList({ periodos, periodoActualId }: PeriodosListProps) {
  const getEstadoInfo = (periodo: Periodo) => {
    if (periodo.estado === "pagado") {
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        color: "bg-green-100 border-green-300 text-green-800",
        iconColor: "text-green-600",
        label: "Pagado",
      }
    }
    if (periodo.estado === "vencido") {
      return {
        icon: <XCircle className="w-5 h-5" />,
        color: "bg-red-100 border-red-300 text-red-800",
        iconColor: "text-red-600",
        label: "Vencido",
      }
    }
    if (periodo.dias_para_vencer !== undefined && periodo.dias_para_vencer <= 5) {
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        color: "bg-yellow-100 border-yellow-300 text-yellow-800",
        iconColor: "text-yellow-600",
        label: `Vence en ${periodo.dias_para_vencer} días`,
      }
    }
    return {
      icon: <Clock className="w-5 h-5" />,
      color: "bg-blue-100 border-blue-300 text-blue-800",
      iconColor: "text-blue-600",
      label: "Pendiente",
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const sortedPeriodos = [...periodos].sort((a, b) => a.numero_periodo - b.numero_periodo)

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Mis Períodos de Pago
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPeriodos.map((periodo) => {
          const estadoInfo = getEstadoInfo(periodo)
          const isActual = periodo.id === periodoActualId

          return (
            <div
              key={periodo.id}
              className={`border-2 rounded-lg p-4 transition-all ${estadoInfo.color} ${
                isActual ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">Período {periodo.numero_periodo}</h3>
                  {isActual && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      Actual
                    </span>
                  )}
                </div>
                <div className={estadoInfo.iconColor}>{estadoInfo.icon}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs opacity-75">Período</p>
                  <p className="font-medium">
                    {formatFecha(periodo.periodo_inicio)} - {formatFecha(periodo.periodo_fin)}
                  </p>
                </div>

                <div>
                  <p className="text-xs opacity-75">Vencimiento</p>
                  <p className="font-semibold">{formatFecha(periodo.fecha_vencimiento)}</p>
                </div>

                <div>
                  <p className="text-xs opacity-75">Monto</p>
                  <p className="font-bold text-lg">S/ {Number(periodo.monto_esperado).toFixed(2)}</p>
                </div>

                <div className="pt-2 border-t border-current opacity-50">
                  <p className="font-semibold text-center">{estadoInfo.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sortedPeriodos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No hay períodos registrados</p>
        </div>
      )}
    </div>
  )
}
