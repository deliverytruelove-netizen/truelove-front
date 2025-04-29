"use client"

import type React from "react"

import { useState } from "react"
import { Eye, Check, Search, RefreshCw, X, Filter, Trash2 } from "lucide-react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchSocios,
  // changeStateSocio,
  fetchSocioDetails,
  aprobarSocio,
  deleteSocio,
} from "@/app/admin/socios/services/Socios.service"
import type { DetallesSocio, Socio } from "@/app/admin/socios/types/Socios.types"
// import type { ColumnSort } from "@tanstack/react-table"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import { showAlert } from "@/components/ui/DataTable/Alert"
import { DetallesSocioModal } from "./modals/DetallesSocioModal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DeleteSocioDialog } from "@/components/DeleteSocioDialog"

// Definir los tipos de filtro
type FilterType = "todos" | "completos" | "incompletos" | "aprobados" | "pendientes"

const SocioList: React.FC = () => {
  const queryClient = useQueryClient()
  // const [sorting, setSorting] = useState<ColumnSort[]>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [selectedSocioId, setSelectedSocioId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>("todos")
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [socioToDelete, setSocioToDelete] = useState<{ id: number; name: string } | null>(null)

  // Consulta para obtener los socios y sus detalles
  const {
    data: sociosConDetalles = [],
    isLoading,
    refetch,
  } = useQuery<DetallesSocio[], Error>({
    queryKey: ["socios-detalles"],
    queryFn: async () => {
      const socios = await fetchSocios()
      console.log("Socios (antes de detalles):", socios)

      const detallesPromises = socios.map((socio) => fetchSocioDetails(socio.id))
      const detalles = await Promise.all(detallesPromises)
      console.log("Socios con detalles (antes del filtro):", detalles)

      // Mapear los valores de aprobado desde los socios originales a los detalles
      const detallesConAprobado = detalles.map((detalle, index) => {
        // Asegurarse de que el detalle tenga la propiedad aprobado del socio original
        if (detalle && socios[index]) {
          const socioOriginal = socios[index] as Socio
          return {
            ...detalle,
            aprobado: socioOriginal.aprobado,
            // Añadir documentType y documentNumber a los detalles
            documentType: socioOriginal.documentType,
            documentNumber: socioOriginal.documentNumber,
          }
        }
        return detalle
      })

      console.log("Detalles con aprobado mapeado:", detallesConAprobado)

      // Mostrar todos los registros, no solo los completos
      return detallesConAprobado
    },
  })

  const { data: detallesSocio } = useQuery<DetallesSocio | null>({
    queryKey: ["socio-details", selectedSocioId],
    queryFn: async () => {
      if (!selectedSocioId) return null
      const detalle = await fetchSocioDetails(selectedSocioId)

      // Buscar el socio original para obtener el estado de aprobación
      const socios = await fetchSocios()
      const socioOriginal = socios.find((s) => s.id === selectedSocioId)

      if (socioOriginal && detalle) {
        return {
          ...detalle,
          documentType: socioOriginal.documentType,
          documentNumber: socioOriginal.documentNumber,
          aprobado: socioOriginal.aprobado, // Asegurarse de incluir el estado de aprobación
        }
      }

      return detalle
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
      queryClient.invalidateQueries({
        queryKey: ["socio-details", selectedSocioId],
      })
      showAlert({
        title: "Éxito",
        text: "Se aprobó el socio correctamente.",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      // Verificar si es un error de correo duplicado
      if (error.message && error.message.includes("correo electrónico ya está registrado")) {
        showAlert({
          title: "Error de registro",
          text: "El correo electrónico ya está registrado en el sistema. No se puede crear un usuario duplicado.",
          icon: "error",
        })
      } else {
        showAlert({ title: "Error", text: error.message, icon: "error" })
      }
    },
  })

  // mutación para eliminar un socio
  const mutationDelete = useMutation({
    mutationFn: deleteSocio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socios-detalles"] })
      showAlert({
        title: "Éxito",
        text: "Se eliminó el socio correctamente.",
        icon: "success",
      })
      setIsDeleteDialogOpen(false)
      setSocioToDelete(null)
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
      setIsDeleteDialogOpen(false)
    },
  })

  // const handleDeactivate = (id: number) => {
  //   mutationChangeState.mutate(id)
  // }

  const handleAprobar = (id: number) => {
    setSelectedSocioId(id)
    mutationAprobar.mutate(id)
  }

  const handleDelete = (id: number, name: string) => {
    setSocioToDelete({ id, name })
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (socioToDelete) {
      mutationDelete.mutate(socioToDelete.id)
    }
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

  // Verificar si un socio tiene todos los datos completos
  const isSocioCompleto = (socio: DetallesSocio): boolean => {
    return !!(socio.business && socio.businessData && socio.establishment && socio.bankData && socio.cuentaBancaria)
  }

  // Aplicar filtros a los socios
  const filteredSocios = sociosConDetalles.filter((socio) => {
    // Primero aplicar el filtro de búsqueda global
    const searchTerm = globalFilter.toLowerCase()
    const matchesSearch =
      !globalFilter ||
      socio.personal?.name?.toLowerCase().includes(searchTerm) ||
      socio.personal?.lastName?.toLowerCase().includes(searchTerm) ||
      socio.personal?.businessType?.toLowerCase().includes(searchTerm) ||
      socio.personal?.phone?.toLowerCase().includes(searchTerm) ||
      socio.personal?.email?.toLowerCase().includes(searchTerm)

    // Luego aplicar el filtro de tipo
    switch (filterType) {
      case "completos":
        return matchesSearch && isSocioCompleto(socio)
      case "incompletos":
        return matchesSearch && !isSocioCompleto(socio)
      case "aprobados":
        return matchesSearch && socio.aprobado === true
      case "pendientes":
        return matchesSearch && socio.aprobado !== true
      case "todos":
      default:
        return matchesSearch
    }
  })

  const paginatedSocios = filteredSocios.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  )

  return (
    <Section title="Listado de Socios">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <div className="w-full sm:w-auto">
            {/* Filtro personalizado con mejor diseño */}
            <div className="relative inline-block">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  const dropdown = document.getElementById("filter-dropdown")
                  if (dropdown) {
                    dropdown.classList.toggle("hidden")
                  }
                }}
              >
                <Filter className="h-4 w-4" />
                <span>
                  {filterType === "todos" && "Todos los registros"}
                  {filterType === "completos" && "Registros completos"}
                  {filterType === "incompletos" && "Registros incompletos"}
                  {filterType === "aprobados" && "Aprobados"}
                  {filterType === "pendientes" && "Pendientes"}
                </span>
              </Button>
              <div
                id="filter-dropdown"
                className="hidden absolute z-10 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg"
              >
                <div className="py-1">
                  {[
                    { value: "todos", label: "Todos los registros" },
                    { value: "completos", label: "Registros completos" },
                    { value: "incompletos", label: "Registros incompletos" },
                    { value: "aprobados", label: "Aprobados" },
                    { value: "pendientes", label: "Pendientes" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        filterType === option.value
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setFilterType(option.value as FilterType)
                        document.getElementById("filter-dropdown")?.classList.add("hidden")
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Buscar..."
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
                      {globalFilter || filterType !== "todos"
                        ? "Intenta con otra búsqueda o elimina los filtros aplicados."
                        : "No hay socios registrados en el sistema."}
                    </p>
                    {(globalFilter || filterType !== "todos") && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setGlobalFilter("")
                          setFilterType("todos")
                        }}
                      >
                        Limpiar filtros
                      </Button>
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
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {socio.personal?.name || "No especificado"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{socio.personal?.lastName || "No especificado"}</td>
                      <td className="px-4 py-3 text-gray-600">{socio.personal?.businessType || "No especificado"}</td>
                      <td className="px-4 py-3 text-gray-600">{socio.personal?.phone || "No especificado"}</td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]">
                        {socio.personal?.email || "No especificado"}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{formatDate(socio.personal?.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        {socio.aprobado === true ? (
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
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedSocioId(socio.id)
                              setIsModalOpen(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>

                          {!socio.aprobado && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAprobar(socio.id)}
                              className="text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100"
                            >
                              Aprobar
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(socio.id, socio.personal?.name || "este socio")}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Eliminar socio"
                          >
                            <Trash2 className="w-5 h-5" />
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

        {filteredSocios.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {pagination.pageIndex + 1} de {Math.ceil(filteredSocios.length / pagination.pageSize)}
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
                      Math.ceil(filteredSocios.length / pagination.pageSize) - 1,
                      pagination.pageIndex + 1,
                    ),
                  })
                }
                disabled={pagination.pageIndex >= Math.ceil(filteredSocios.length / pagination.pageSize) - 1}
              >
                Siguiente
              </Button>
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

      {/* Diálogo de confirmación para eliminar */}
      {socioToDelete && (
        <DeleteSocioDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          socioName={socioToDelete.name}
        />
      )}

      {/* Script para cerrar el dropdown cuando se hace clic fuera de él */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('click', function(event) {
              const dropdown = document.getElementById('filter-dropdown');
              const filterButton = event.target.closest('button');
              
              if (dropdown && !dropdown.classList.contains('hidden') && 
                  !dropdown.contains(event.target) && 
                  (!filterButton || !filterButton.contains(document.querySelector('.filter-icon')))) {
                dropdown.classList.add('hidden');
              }
            });
          `,
        }}
      />
    </Section>
  )
}

export default SocioList
