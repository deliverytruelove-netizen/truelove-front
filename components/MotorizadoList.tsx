// components\MotorizadoList.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Eye, Check, Search, RefreshCw, X, Filter } from "lucide-react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchMotorizados,
  fetchMotorizadoDetails,
  aprobarMotorizado,
} from "@/app/admin/motorizado/services/motorizado.service"
import type { Motorizado, DetallesMotorizado } from "@/app/admin/motorizado/types/motorizado.types"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import { DetallesMotorizadoModal } from "./modals/DetallesMotorizadoModal"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MotorizadoList: React.FC = () => {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [selectedMotorizadoId, setSelectedMotorizadoId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })
  const [statusFilter, setStatusFilter] = useState<"todos" | "aprobados" | "pendientes">("todos")

  const {
    data: motorizados = [],
    isLoading,
    refetch,
  } = useQuery<Motorizado[], Error>({
    queryKey: ["motorizados"],
    queryFn: fetchMotorizados,
  })

  const { data: detallesMotorizado } = useQuery<DetallesMotorizado | null>({
    queryKey: ["motorizado-details", selectedMotorizadoId],
    queryFn: async () => {
      if (!selectedMotorizadoId) return null
      const data = await fetchMotorizadoDetails(selectedMotorizadoId)
      return data
    },
    enabled: !!selectedMotorizadoId,
  })

  const mutationAprobar = useMutation({
    mutationFn: aprobarMotorizado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motorizados"] })
    },
    onError: (error: Error) => {
      console.error("Error al aprobar motorizado:", error)

      // Verificar si es un error de correo duplicado
      if (error.message && error.message.includes("Duplicate entry") && error.message.includes("email_unique")) {
        toast.error("Error al aprobar motorizado", {
          description: "El correo electrónico ya está registrado en el sistema.",
        })
      } else {
        toast.error("Error al aprobar motorizado", {
          description: error.message || "No se pudo aprobar el motorizado o enviar las credenciales.",
        })
      }
    },
  })

  const handleAprobar = async (id: number) => {
    try {
      await mutationAprobar.mutateAsync(id)
      toast.success("Motorizado aprobado correctamente", {
        description: "Se han enviado las credenciales por correo electrónico.",
      })
    } catch (error) {
      console.error("Error al aprobar motorizado:", error)
      // El error ya se maneja en onError del mutation
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

  // Aplicar filtros de estado y búsqueda
  const filteredMotorizados = motorizados
    .filter((motorizado) => {
      // Filtrar por estado
      if (statusFilter === "aprobados") return motorizado.aprobado
      if (statusFilter === "pendientes") return !motorizado.aprobado
      return true // "todos"
    })
    .filter((motorizado) => {
      // Filtrar por término de búsqueda
      if (!globalFilter) return true

      const searchTerm = globalFilter.toLowerCase()
      return (
        motorizado.nombres?.toLowerCase().includes(searchTerm) ||
        motorizado.apellidos?.toLowerCase().includes(searchTerm) ||
        motorizado.celular?.toLowerCase().includes(searchTerm) ||
        motorizado.email?.toLowerCase().includes(searchTerm) ||
        motorizado.nro_documento?.toLowerCase().includes(searchTerm)
      )
    })

  const paginatedMotorizados = filteredMotorizados.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  )

  return (
    <Section title="Listado de Motorizados">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select
              value={statusFilter}
              onValueChange={(value: "todos" | "aprobados" | "pendientes") => {
                setStatusFilter(value)
                setPagination({ ...pagination, pageIndex: 0 }) // Resetear a la primera página
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="aprobados">Aprobados</SelectItem>
                <SelectItem value="pendientes">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full sm:w-64 pl-9 py-2 h-10 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={18} />
            </button>
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
                <th scope="col" className="px-4 py-3">
                  Apellidos
                </th>
                <th scope="col" className="px-4 py-3">
                  Teléfono
                </th>
                <th scope="col" className="px-4 py-3">
                  Correo
                </th>
                <th scope="col" className="px-4 py-3">
                  Documento
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Fecha de Registro
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Aprobado
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
              ) : filteredMotorizados.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No se encontraron motorizados</h3>
                    <p className="text-gray-500 mt-2">
                      {globalFilter || statusFilter !== "todos"
                        ? "Intenta con otra búsqueda o elimina los filtros aplicados."
                        : "No hay motorizados registrados en el sistema."}
                    </p>
                    {(globalFilter || statusFilter !== "todos") && (
                      <button
                        className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setGlobalFilter("")
                          setStatusFilter("todos")
                        }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedMotorizados.map((motorizado, index) => {
                  const pageSize = pagination.pageSize
                  const pageIndex = pagination.pageIndex
                  const rowNumber = pageSize * pageIndex + index + 1

                  return (
                    <tr key={motorizado.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center font-medium text-gray-600">{rowNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{motorizado.nombres}</td>
                      <td className="px-4 py-3 text-gray-600">{motorizado.apellidos}</td>
                      <td className="px-4 py-3 text-gray-600">{motorizado.celular}</td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]">{motorizado.email}</td>
                      <td className="px-4 py-3 text-gray-600">{`${motorizado.tipo_documento}: ${motorizado.nro_documento}`}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{formatDate(motorizado.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        {motorizado.aprobado ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Aprobado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {/* Estructura de tabla con dos columnas para alineación consistente */}
                        <table className="w-full">
                          <tbody>
                            <tr>
                              {/* Columna 1: Siempre contiene el icono del ojo */}
                              <td className="w-10 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedMotorizadoId(motorizado.id)
                                    setIsModalOpen(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </td>

                              {/* Columna 2: Contiene el botón Aprobar (o nada) */}
                              <td>
                                {!motorizado.aprobado && (
                                  <button
                                    onClick={() => handleAprobar(motorizado.id)}
                                    className="ml-2 px-4 py-1 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                  >
                                    Aprobar
                                  </button>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredMotorizados.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {pagination.pageIndex + 1} de {Math.ceil(filteredMotorizados.length / pagination.pageSize)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, pageIndex: Math.max(0, pagination.pageIndex - 1) })}
                disabled={pagination.pageIndex === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    pageIndex: Math.min(
                      Math.ceil(filteredMotorizados.length / pagination.pageSize) - 1,
                      pagination.pageIndex + 1,
                    ),
                  })
                }
                disabled={pagination.pageIndex >= Math.ceil(filteredMotorizados.length / pagination.pageSize) - 1}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <DetallesMotorizadoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMotorizadoId(null)
        }}
        data={detallesMotorizado}
        onAprobar={handleAprobar}
      />
    </Section>
  )
}

export default MotorizadoList

