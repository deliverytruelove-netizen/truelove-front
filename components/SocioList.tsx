"use client"

import type React from "react"

import { useState } from "react"
import { Eye, Check, Search, RefreshCw, X } from "lucide-react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchSocios,
  // changeStateSocio,
  fetchSocioDetails,
  aprobarSocio,
} from "@/app/admin/socios/services/Socios.service"
import type { DetallesSocio } from "@/app/admin/socios/types/Socios.types"
// import type { ColumnSort } from "@tanstack/react-table"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import { showAlert } from "@/components/ui/DataTable/Alert"
import { DetallesSocioModal } from "./modals/DetallesSocioModal"

const SocioList: React.FC = () => {
  const queryClient = useQueryClient()
  // const [sorting, setSorting] = useState<ColumnSort[]>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [selectedSocioId, setSelectedSocioId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })

  // Consulta para obtener los socios y sus detalles
  const {
    data: sociosConDetalles = [],
    isLoading,
    refetch,
  } = useQuery<DetallesSocio[], Error>({
    queryKey: ["socios-detalles"],
    queryFn: async () => {
      const socios = await fetchSocios()
      const detallesPromises = socios.map((socio) => fetchSocioDetails(socio.id))
      const detalles = await Promise.all(detallesPromises)
      return detalles.filter(
        (detalle) =>
          detalle.business !== null &&
          detalle.businessData !== null &&
          detalle.establishment !== null &&
          detalle.bankData !== null &&
          detalle.cuentaBancaria !== null,
      )
    },
  })

  const { data: detallesSocio } = useQuery<DetallesSocio | null>({
    queryKey: ["socio-details", selectedSocioId],
    queryFn: async () => {
      if (!selectedSocioId) return null
      return await fetchSocioDetails(selectedSocioId)
    },
    enabled: !!selectedSocioId,
  })

  // const mutationChangeState = useMutation({
  //   mutationFn: changeStateSocio,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["socios-detalles"] })
  //     showAlert({ title: "Éxito", text: "Se cambió el estado del socio.", icon: "success" })
  //   },
  //   onError: (error: Error) => {
  //     showAlert({ title: "Error", text: error.message, icon: "error" })
  //   },
  // })

  const mutationAprobar = useMutation({
    mutationFn: aprobarSocio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socios-detalles"] })
      showAlert({ title: "Éxito", text: "Se aprobó el socio.", icon: "success" })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  // const handleDeactivate = (id: number) => {
  //   mutationChangeState.mutate(id)
  // }

  const handleAprobar = (id: number) => {
    mutationAprobar.mutate(id)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const filteredSocios = globalFilter
    ? sociosConDetalles.filter((socio) => {
        const searchTerm = globalFilter.toLowerCase()
        return (
          socio.personal?.name?.toLowerCase().includes(searchTerm) ||
          socio.personal?.lastName?.toLowerCase().includes(searchTerm) ||
          socio.personal?.businessType?.toLowerCase().includes(searchTerm) ||
          socio.personal?.phone?.toLowerCase().includes(searchTerm) ||
          socio.personal?.email?.toLowerCase().includes(searchTerm)
        )
      })
    : sociosConDetalles

  const paginatedSocios = filteredSocios.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  )

  return (
    <Section title="Listado de Socios">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <div className="w-full sm:w-auto"></div>

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
                  Usuario
                </th>
                <th scope="col" className="px-4 py-3">
                  Apellidos
                </th>
                <th scope="col" className="px-4 py-3">
                  Tipo de Negocio
                </th>
                <th scope="col" className="px-4 py-3">
                  Teléfono
                </th>
                <th scope="col" className="px-4 py-3">
                  Correo
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Fecha de Creación
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
              ) : filteredSocios.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No se encontraron socios</h3>
                    <p className="text-gray-500 mt-2">
                      {globalFilter
                        ? "Intenta con otra búsqueda o elimina los filtros aplicados."
                        : "No hay socios registrados en el sistema."}
                    </p>
                    {globalFilter && (
                      <button
                        className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        onClick={() => setGlobalFilter("")}
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedSocios.map((socio, index) => {
                  const pageSize = pagination.pageSize
                  const pageIndex = pagination.pageIndex
                  const rowNumber = pageSize * pageIndex + index + 1

                  return (
                    <tr key={socio.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center font-medium text-gray-600">{rowNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{socio.personal?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{socio.personal?.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{socio.personal?.businessType}</td>
                      <td className="px-4 py-3 text-gray-600">{socio.personal?.phone}</td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]">{socio.personal?.email}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{formatDate(socio.personal?.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        {socio.aprobado ? (
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
                      <td className="px-4 py-3">
                        {/* Estructura de tabla con dos columnas para alineación consistente */}
                        <table className="w-full">
                          <tbody>
                            <tr>
                              {/* Columna 1: Siempre contiene el icono del ojo */}
                              <td className="w-10 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedSocioId(socio.id)
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
                                {!socio.aprobado && (
                                  <button
                                    onClick={() => handleAprobar(socio.id)}
                                    className="px-4 py-1 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                  >
                                    Aprobar
                                  </button>
                                )}

                                {/* Botón de Activar/Desactivar - Comentado */}
                                {/* <button
                                  onClick={() => handleDeactivate(socio.id)}
                                  className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                >
                                  Desactivar
                                </button> */}
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

        {filteredSocios.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {pagination.pageIndex + 1} de {Math.ceil(filteredSocios.length / pagination.pageSize)}
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
                      Math.ceil(filteredSocios.length / pagination.pageSize) - 1,
                      pagination.pageIndex + 1,
                    ),
                  })
                }
                disabled={pagination.pageIndex >= Math.ceil(filteredSocios.length / pagination.pageSize) - 1}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <DetallesSocioModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSocioId(null)
        }}
        data={detallesSocio}
        onAprobar={handleAprobar}
      />
    </Section>
  )
}

export default SocioList

