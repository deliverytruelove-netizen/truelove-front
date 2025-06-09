// app\admin\coutas-drivers\components\EstadisticasCuotasModal.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { X, Calendar,  Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchEstadisticasCuotas } from "../services/cuota.service"
import { EstadisticasCuotasCard } from "./EstadisticasCuotasCard"

interface EstadisticasCuotasModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EstadisticasCuotasModal: React.FC<EstadisticasCuotasModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [dateFilters, setDateFilters] = useState({
    fecha_inicio: "",
    fecha_fin: "",
  })

  // Query para obtener estadísticas
  const { data: estadisticas, isLoading, refetch } = useQuery({
    queryKey: ["estadisticas-cuotas", dateFilters],
    queryFn: () => fetchEstadisticasCuotas(dateFilters),
    enabled: isOpen,
  })

  const handleApplyFilters = () => {
    refetch()
  }

  const handleResetFilters = () => {
    setDateFilters({
      fecha_inicio: "",
      fecha_fin: "",
    })
  }

  // Obtener fechas por defecto (mes actual)
  const getCurrentMonthDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return {
      inicio: firstDay.toISOString().split("T")[0],
      fin: lastDay.toISOString().split("T")[0],
    }
  }

  const setCurrentMonth = () => {
    const dates = getCurrentMonthDates()
    setDateFilters({
      fecha_inicio: dates.inicio,
      fecha_fin: dates.fin,
    })
  }

  const setCurrentWeek = () => {
    const now = new Date()
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    
    setDateFilters({
      fecha_inicio: firstDay.toISOString().split("T")[0],
      fecha_fin: lastDay.toISOString().split("T")[0],
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Estadísticas de Cuotas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          {/* Filtros */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <Label htmlFor="fecha_inicio" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha Inicio
                  </Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={dateFilters.fecha_inicio}
                    onChange={(e) =>
                      setDateFilters({ ...dateFilters, fecha_inicio: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="fecha_fin" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha Fin
                  </Label>
                  <Input
                    id="fecha_fin"
                    type="date"
                    value={dateFilters.fecha_fin}
                    onChange={(e) =>
                      setDateFilters({ ...dateFilters, fecha_fin: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setCurrentWeek}
                >
                  Esta Semana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setCurrentMonth}
                >
                  Este Mes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  Limpiar
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Aplicar Filtros"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
              </div>
            ) : estadisticas ? (
              <div className="space-y-6">
                <EstadisticasCuotasCard estadisticas={estadisticas} />
                
                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Período</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Período:</span>
                        <span className="font-medium">
                          {dateFilters.fecha_inicio && dateFilters.fecha_fin
                            ? `${dateFilters.fecha_inicio} al ${dateFilters.fecha_fin}`
                            : "Todos los registros"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Promedio por cuota:</span>
                        <span className="font-medium">
                          {estadisticas.total_cuotas > 0
                            ? `S/ ${(estadisticas.monto_total / estadisticas.total_cuotas).toFixed(2)}`
                            : "S/ 0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tasa de cobro:</span>
                        <span className="font-medium text-green-600">
                          {estadisticas.total_cuotas > 0
                            ? `${((estadisticas.cuotas_pagadas / estadisticas.total_cuotas) * 100).toFixed(1)}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Cuotas</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Pagadas</span>
                        </div>
                        <span className="font-medium">{estadisticas.cuotas_pagadas}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Pendientes</span>
                        </div>
                        <span className="font-medium">{estadisticas.cuotas_pendientes}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Vencidas</span>
                        </div>
                        <span className="font-medium">{estadisticas.cuotas_vencidas}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay datos disponibles para mostrar</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {estadisticas && (
                <>
                  Última actualización: {new Date().toLocaleString("es-ES")}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              {/* Aquí podrías agregar un botón para exportar las estadísticas */}
              {/* <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}