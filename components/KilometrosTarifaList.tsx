"use client"

import type React from "react"
import { useState } from "react"
import { Search, Plus, RefreshCw, Edit, Trash2, Check, X, Settings } from "lucide-react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchKilometrosTarifas,
  createKilometrosTarifa,
  updateKilometrosTarifa,
  deleteKilometrosTarifa,
  activarKilometrosTarifa,
} from "@/app/admin/kilometros-tarifa/services/KilometrosTarifa.service"
import type { KilometrosTarifa } from "@/app/admin/kilometros-tarifa/types/KilometrosTarifa.types"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import { showAlert, confirmAlert } from "@/components/ui/DataTable/Alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { KilometrosTarifaModal } from "@/components/modals/KilometrosTarifaModal"

const KilometrosTarifaList: React.FC = () => {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarifa, setEditingTarifa] = useState<KilometrosTarifa | null>(null)
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })

  const {
    data: tarifas = [],
    isLoading,
    refetch,
  } = useQuery<KilometrosTarifa[], Error>({
    queryKey: ["kilometros-tarifas"],
    queryFn: fetchKilometrosTarifas,
  })

  const createMutation = useMutation({
    mutationFn: createKilometrosTarifa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kilometros-tarifas"] })
      showAlert({
        title: "Éxito",
        text: "Configuración de tarifa creada exitosamente.",
        icon: "success",
      })
      setIsModalOpen(false)
      setEditingTarifa(null)
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateKilometrosTarifa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kilometros-tarifas"] })
      showAlert({
        title: "Éxito",
        text: "Configuración actualizada exitosamente.",
        icon: "success",
      })
      setIsModalOpen(false)
      setEditingTarifa(null)
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteKilometrosTarifa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kilometros-tarifas"] })
      showAlert({
        title: "Éxito",
        text: "Configuración eliminada exitosamente.",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const activarMutation = useMutation({
    mutationFn: activarKilometrosTarifa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kilometros-tarifas"] })
      showAlert({
        title: "Éxito",
        text: "Configuración activada exitosamente.",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const handleCreate = () => {
    setEditingTarifa(null)
    setIsModalOpen(true)
  }

  const handleEdit = (tarifa: KilometrosTarifa) => {
    setEditingTarifa(tarifa)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number, nombre: string) => {
    confirmAlert({
      title: "¿Eliminar configuración?",
      text: `Esta acción eliminará la configuración "${nombre}" y no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id)
      }
    })
  }

  const handleActivar = (id: number, nombre: string) => {
    confirmAlert({
      title: "¿Activar configuración?",
      text: `Esta acción activará la configuración "${nombre}" y desactivará las demás.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, activar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        activarMutation.mutate(id)
      }
    })
  }

  const handleSubmit = (data: Partial<KilometrosTarifa>) => {
    if (editingTarifa) {
      updateMutation.mutate({ id: editingTarifa.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) {
      return 'S/ 0.00'
    }
    return `S/ ${numValue.toFixed(2)}`
  }

  const formatNumber = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) {
      return '0.00'
    }
    return numValue.toFixed(2)
  }

  // Filtrar tarifas
  const filteredTarifas = tarifas.filter((tarifa) => {
    const searchTerm = globalFilter.toLowerCase()
    return (
      !globalFilter ||
      tarifa.nombre.toLowerCase().includes(searchTerm) ||
      tarifa.descripcion?.toLowerCase().includes(searchTerm)
    )
  })

  const paginatedTarifas = filteredTarifas.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  )

  return (
    <Section title="Gestión de Tarifas por Kilómetros">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <div className="w-full sm:w-auto">
            <p className="text-sm text-gray-600">
              Configuraciones de tarifas para el cálculo de precios de delivery
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Buscar configuraciones..."
                className="w-full sm:w-64 pl-9 h-10"
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
            <Button variant="ghost" size="icon" onClick={() => refetch()} title="Actualizar">
              <RefreshCw size={18} />
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-[#1abc9c] hover:bg-[#16a085] text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Configuración</span>
            </Button>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3 text-center w-12">
                  #
                </th>
                <th scope="col" className="px-4 py-3">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Precio Diurno
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Precio Nocturno
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Precio Máximo
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Distancias
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Fecha
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
                      <td colSpan={9} className="px-4 py-3">
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
              ) : filteredTarifas.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No se encontraron configuraciones</h3>
                    <p className="text-gray-500 mt-2">
                      {globalFilter
                        ? "Intenta con otra búsqueda."
                        : "No hay configuraciones de tarifa en el sistema."}
                    </p>
                    {globalFilter && (
                      <Button variant="outline" className="mt-4" onClick={() => setGlobalFilter("")}>
                        Limpiar búsqueda
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedTarifas.map((tarifa, index) => {
                  const pageSize = pagination.pageSize
                  const pageIndex = pagination.pageIndex
                  const rowNumber = pageSize * pageIndex + index + 1

                  return (
                    <tr key={tarifa.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center font-medium text-gray-600">{rowNumber}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-800">{tarifa.nombre}</div>
                          {tarifa.descripcion && (
                            <div className="text-xs text-gray-600 truncate max-w-[200px]">
                              {tarifa.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {formatCurrency(tarifa.precio_base_diurno)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {formatCurrency(tarifa.precio_base_nocturno)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {formatCurrency(tarifa.precio_maximo)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        <div className="text-xs">
                          <div>Min: {formatNumber(tarifa.distancia_minima)} km</div>
                          <div>Máx: {formatNumber(tarifa.distancia_maxima)} km</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tarifa.activo ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactiva
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">
                        {formatDate(tarifa.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(tarifa)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title="Editar configuración"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {!tarifa.activo && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivar(tarifa.id, tarifa.nombre)}
                              className="text-green-700 bg-green-50 border-green-100 hover:bg-green-100 text-xs"
                            >
                              Activar
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tarifa.id, tarifa.nombre)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Eliminar configuración"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredTarifas.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {pagination.pageIndex + 1} de {Math.ceil(filteredTarifas.length / pagination.pageSize)}
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
                      Math.ceil(filteredTarifas.length / pagination.pageSize) - 1,
                      pagination.pageIndex + 1,
                    ),
                  })
                }
                disabled={pagination.pageIndex >= Math.ceil(filteredTarifas.length / pagination.pageSize) - 1}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <KilometrosTarifaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTarifa(null)
        }}
        onSubmit={handleSubmit}
        editingTarifa={editingTarifa}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </Section>
  )
}

export default KilometrosTarifaList