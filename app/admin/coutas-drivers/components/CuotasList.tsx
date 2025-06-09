// app\admin\coutas-drivers\components\CuotasList.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DollarSign, Filter, Plus, RefreshCw, Search, X, CheckCircle, Clock, AlertTriangle, Trash2, Undo2, BarChart3 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Section from "@/components/layout/Section"
import { showAlert, confirmAlert } from "@/components/ui/DataTable/Alert"
import {
  fetchCuotas,
  revertirPagoCuota,
  eliminarCuota,
} from "../services/cuota.service"
import type { CuotaMotorizado } from "../types/cuota.types"
import { GenerarCuotasModal } from "./GenerarCuotasModal"
import { MarcarPagadaModal } from "./MarcarPagadaModal"
import { EstadisticasCuotasModal } from "./EstadisticasCuotasModal" // Nuevo modal

const CuotasList: React.FC = () => {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [showGenerarModal, setShowGenerarModal] = useState(false)
  const [showPagarModal, setShowPagarModal] = useState(false)
  const [showEstadisticasModal, setShowEstadisticasModal] = useState(false) // Nuevo estado
  const [selectedCuota, setSelectedCuota] = useState<CuotaMotorizado | null>(null)
  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageIndex: 0,
  })

  // Queries
  const {
    data: cuotas = [],
    isLoading,
    refetch,
  } = useQuery<CuotaMotorizado[], Error>({
    queryKey: ["cuotas", statusFilter],
    queryFn: () =>
      fetchCuotas({
        estado_pago: statusFilter === "todos" ? undefined : statusFilter,
      }),
  })

  // Mutations
  const mutationRevertir = useMutation({
    mutationFn: revertirPagoCuota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuotas"] })
      showAlert({
        title: "Éxito",
        text: "Pago revertido correctamente",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message,
        icon: "error",
      })
    },
  })

  const mutationEliminar = useMutation({
    mutationFn: eliminarCuota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuotas"] })
      showAlert({
        title: "Éxito",
        text: "Cuota eliminada correctamente",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message,
        icon: "error",
      })
    },
  })

  // Funciones
  const handleRevertirPago = (cuota: CuotaMotorizado) => {
    confirmAlert({
      title: "¿Revertir pago?",
      text: `¿Estás seguro de revertir el pago de ${cuota.motorizado.nombres} ${cuota.motorizado.apellidos}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, revertir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        mutationRevertir.mutate(cuota.id)
      }
    })
  }

  const handleEliminarCuota = (cuota: CuotaMotorizado) => {
    confirmAlert({
      title: "¿Eliminar cuota?",
      text: `¿Estás seguro de eliminar la cuota de ${cuota.motorizado.nombres} ${cuota.motorizado.apellidos}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        mutationEliminar.mutate(cuota.id)
      }
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount)
  }

  const getEstadoBadge = (cuota: CuotaMotorizado) => {
    const isVencida = cuota.estado_pago === "pendiente" && new Date(cuota.fecha_vencimiento) < new Date()

    if (cuota.estado_pago === "pagado") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Pagado
        </span>
      )
    }

    if (isVencida) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Vencido
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

  // Filtrar cuotas
  const filteredCuotas = cuotas.filter((cuota) => {
    if (!globalFilter) return true
    const searchTerm = globalFilter.toLowerCase()
    return (
      cuota.motorizado.nombres.toLowerCase().includes(searchTerm) ||
      cuota.motorizado.apellidos.toLowerCase().includes(searchTerm) ||
      cuota.motorizado.email.toLowerCase().includes(searchTerm) ||
      cuota.motorizado.celular.includes(searchTerm)
    )
  })

  const paginatedCuotas = filteredCuotas.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  )

  return (
    <Section title="Gestión de Cuotas de Motorizados">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header con filtros y acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="pagado">Pagados</SelectItem>
                  <SelectItem value="vencidas">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar motorizado..."
                className="w-64 pl-9"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEstadisticasModal(true)}
              className="text-purple-700 bg-purple-50 border-purple-100 hover:bg-purple-100"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Estadísticas
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetch()} title="Actualizar">
              <RefreshCw size={18} />
            </Button>
            <Button onClick={() => setShowGenerarModal(true)} className="bg-brand-600 hover:bg-brand-700">
              <Plus className="w-4 h-4 mr-2" />
              Generar Cuotas
            </Button>
          </div>
        </div>

        {/* Resto del código de la tabla permanece igual... */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Motorizado
                </th>
                <th scope="col" className="px-4 py-3">
                  Semana
                </th>
                <th scope="col" className="px-4 py-3">
                  Monto
                </th>
                <th scope="col" className="px-4 py-3">
                  Vencimiento
                </th>
                <th scope="col" className="px-4 py-3">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3">
                  Fecha Pago
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="animate-pulse flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : filteredCuotas.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <DollarSign className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No se encontraron cuotas</h3>
                    <p className="text-gray-500 mt-2">
                      {globalFilter || statusFilter !== "todos"
                        ? "Intenta con otra búsqueda o elimina los filtros aplicados."
                        : "No hay cuotas registradas en el sistema."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCuotas.map((cuota) => (
                  <tr key={cuota.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-800">
                          {cuota.motorizado.nombres} {cuota.motorizado.apellidos}
                        </div>
                        <div className="text-xs text-gray-500">{cuota.motorizado.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{formatDate(cuota.semana_inicio)}</div>
                        <div className="text-gray-500">al {formatDate(cuota.semana_fin)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(cuota.monto_cuota)}</td>
                    <td className="px-4 py-3">{formatDate(cuota.fecha_vencimiento)}</td>
                    <td className="px-4 py-3">{getEstadoBadge(cuota)}</td>
                    <td className="px-4 py-3">
                      {cuota.fecha_pago ? (
                        <div className="text-sm">
                          <div>{formatDate(cuota.fecha_pago)}</div>
                          {cuota.metodo_pago && <div className="text-gray-500 text-xs">{cuota.metodo_pago}</div>}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {cuota.estado_pago === "pendiente" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCuota(cuota)
                              setShowPagarModal(true)
                            }}
                            className="text-green-700 bg-green-50 border-green-100 hover:bg-green-100"
                          >
                            Marcar Pagado
                          </Button>
                        )}

                        {cuota.estado_pago === "pagado" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevertirPago(cuota)}
                            className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                            title="Revertir pago"
                          >
                            <Undo2 className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEliminarCuota(cuota)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Eliminar cuota"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredCuotas.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {pagination.pageIndex + 1} de {Math.ceil(filteredCuotas.length / pagination.pageSize)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setPagination({
                    ...pagination,
                    pageIndex: Math.max(0, pagination.pageIndex - 1),
                  })
                }
                disabled={pagination.pageIndex === 0}
              >
                Anterior
              </Button>
              <Button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    pageIndex: Math.min(
                      Math.ceil(filteredCuotas.length / pagination.pageSize) - 1,
                      pagination.pageIndex + 1,
                    ),
                  })
                }
                disabled={pagination.pageIndex >= Math.ceil(filteredCuotas.length / pagination.pageSize) - 1}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <GenerarCuotasModal
        isOpen={showGenerarModal}
        onClose={() => setShowGenerarModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["cuotas"] })
        }}
      />

      {selectedCuota && (
        <MarcarPagadaModal
          isOpen={showPagarModal}
          onClose={() => {
            setShowPagarModal(false)
            setSelectedCuota(null)
          }}
          cuota={selectedCuota}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["cuotas"] })
            setShowPagarModal(false)
            setSelectedCuota(null)
          }}
        />
      )}

      {/* Nuevo Modal de Estadísticas */}
      <EstadisticasCuotasModal
        isOpen={showEstadisticasModal}
        onClose={() => setShowEstadisticasModal(false)}
      />
    </Section>
  )
}

export default CuotasList