"use client"

import { Periodo } from "../types/pago-cuota.types"
import { CheckCircle, Clock, XCircle, Calendar, AlertTriangle, TrendingUp, ShoppingBag, Percent } from "lucide-react"

interface PeriodosListProps {
  periodos: Periodo[]
  periodoActualId?: number
  tipoCuota?: "monto_fijo" | "porcentaje"
}

export default function PeriodosList({ periodos, periodoActualId, tipoCuota }: PeriodosListProps) {
  const esPorcentaje = tipoCuota === "porcentaje"

  const getEstadoInfo = (periodo: Periodo) => {
    if (periodo.estado === "pagado") {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        badgeBg: "bg-green-100 dark:bg-green-900/40",
        badgeText: "text-green-700 dark:text-green-400",
        iconColor: "text-green-600",
        label: "Pagado",
      }
    }
    if (periodo.estado === "vencido") {
      return {
        icon: <XCircle className="w-4 h-4" />,
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800",
        badgeBg: "bg-red-100 dark:bg-red-900/40",
        badgeText: "text-red-700 dark:text-red-400",
        iconColor: "text-red-600",
        label: "Vencido",
      }
    }
    if (periodo.estado === "en_revision") {
      return {
        icon: <Clock className="w-4 h-4" />,
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border: "border-orange-200 dark:border-orange-800",
        badgeBg: "bg-orange-100 dark:bg-orange-900/40",
        badgeText: "text-orange-700 dark:text-orange-400",
        iconColor: "text-orange-600",
        label: "En revisión",
      }
    }
    if (periodo.dias_para_vencer !== undefined && periodo.dias_para_vencer <= 5) {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200 dark:border-yellow-800",
        badgeBg: "bg-yellow-100 dark:bg-yellow-900/40",
        badgeText: "text-yellow-700 dark:text-yellow-400",
        iconColor: "text-yellow-600",
        label: `Vence en ${periodo.dias_para_vencer} día${periodo.dias_para_vencer !== 1 ? "s" : ""}`,
      }
    }
    return {
      icon: <Clock className="w-4 h-4" />,
      bg: "bg-white dark:bg-gray-800",
      border: "border-gray-200 dark:border-gray-700",
      badgeBg: "bg-gray-100 dark:bg-gray-700",
      badgeText: "text-gray-600 dark:text-gray-300",
      iconColor: "text-gray-500",
      label: "Pendiente",
    }
  }

  const formatFecha = (fecha: string) => {
    const [year, month, day] = fecha.split('T')[0].split('-')
    const dateLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return dateLocal.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const sortedPeriodos = [...periodos]
    .filter((periodo) => {
      if (esPorcentaje) {
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
        const inicio = new Date(periodo.periodo_inicio); inicio.setHours(0, 0, 0, 0)
        const tieneActividad = periodo.estado !== "pendiente" || periodo.fecha_calculo || Number(periodo.total_ventas || 0) > 0 || Number(periodo.monto_esperado || 0) > 0
        return inicio <= hoy || tieneActividad
      }
      return true
    })
    .sort((a, b) => a.numero_periodo - b.numero_periodo)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        {sortedPeriodos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedPeriodos.map((periodo) => {
              const estadoInfo = getEstadoInfo(periodo)
              const isActual = periodo.id === periodoActualId

              return (
                <div
                  key={periodo.id}
                  className={`${estadoInfo.bg} border ${estadoInfo.border} rounded-lg p-3.5 transition-all hover:shadow-md ${
                    isActual ? "ring-2 ring-brand-500 ring-offset-1" : ""
                  }`}
                >
                  {/* Top: Período + Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        #{periodo.numero_periodo}
                      </span>
                      {isActual && (
                        <span className="px-1.5 py-0.5 bg-brand-600 text-white text-[10px] rounded font-medium">
                          ACTUAL
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${estadoInfo.badgeBg} ${estadoInfo.badgeText}`}>
                      {estadoInfo.icon}
                      {estadoInfo.label}
                    </span>
                  </div>

                  {/* Fechas */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <p>{formatFecha(periodo.periodo_inicio)} — {formatFecha(periodo.periodo_fin)}</p>
                    <p className="mt-0.5">Vence: <span className="font-medium text-gray-700 dark:text-gray-300">{formatFecha(periodo.fecha_vencimiento)}</span></p>
                  </div>

                  {/* Monto */}
                  <div className="flex items-baseline justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{esPorcentaje ? "Comisión" : "Monto"}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">S/ {Number(periodo.monto_esperado).toFixed(2)}</span>
                  </div>

                  {/* Desglose porcentaje */}
                  {esPorcentaje && (Number(periodo.total_ventas || 0) > 0 || periodo.fecha_calculo) && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <TrendingUp className="w-3 h-3" /> Ventas
                        </span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">S/ {Number(periodo.total_ventas || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <ShoppingBag className="w-3 h-3" /> Pedidos
                        </span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{periodo.cantidad_pedidos || 0}</span>
                      </div>
                      {periodo.cuota?.porcentaje_comision && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Percent className="w-3 h-3" /> Comisión
                          </span>
                          <span className="font-semibold text-brand-600">{periodo.cuota.porcentaje_comision}%</span>
                        </div>
                      )}
                      {periodo.fecha_calculo && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-right mt-1">
                          Calculado: {new Date(periodo.fecha_calculo).toLocaleDateString("es-PE")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3" />
            <p className="font-medium text-gray-500 dark:text-gray-400">{esPorcentaje ? "Sin períodos activos aún" : "No hay períodos registrados"}</p>
            {esPorcentaje && (
              <p className="text-xs mt-1 dark:text-gray-500">Las comisiones aparecerán conforme avancen los períodos de cobro</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
