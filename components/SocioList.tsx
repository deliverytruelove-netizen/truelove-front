"use client"

import type React from "react"

import { useState } from "react"
import { Eye, Check, Search, RefreshCw, X, Filter, Trash2, Coins, Clock } from "lucide-react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchSocios,
  // changeStateSocio,
  fetchSocioDetails,
  aprobarSocio,
  deleteSocio,
} from "@/app/admin/socios/services/Socios.service"
import type { DetallesSocio } from "@/app/admin/socios/types/Socios.types"
import { obtenerDetalleCuota, type CuotaSocio } from "@/app/admin/cuotas-socios/services/cuota-admin.service"
// import type { ColumnSort } from "@tanstack/react-table"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import { showAlert } from "@/components/ui/DataTable/Alert"
import { DetallesSocioModal } from "./modals/DetallesSocioModal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DeleteSocioDialog } from "@/components/DeleteSocioDialog"
import AsignarCuotaModal from "./modals/AsignarCuotaModal"
import EditarDiaPagoModal from "./modals/EditarDiaPagoModal"
import { Pagination } from "@/components/ui/pagination"

// Definir los tipos de filtro
type FilterType = "todos" | "completos" | "incompletos"

// Extender DetallesSocio con información de cuota
interface DetallesSocioConCuota extends DetallesSocio {
  cuotaDetalle?: CuotaSocio
}

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
  const [isAsignarCuotaModalOpen, setIsAsignarCuotaModalOpen] = useState(false)
  const [socioParaCuota, setSocioParaCuota] = useState<{ id: number; nombre: string } | null>(null)
  const [isEditarDiaPagoModalOpen, setIsEditarDiaPagoModalOpen] = useState(false)
  const [socioParaEditarDiaPago, setSocioParaEditarDiaPago] = useState<{ socio: DetallesSocioConCuota; cuota: CuotaSocio } | null>(null)
  const [activeTab, setActiveTab] = useState<"aprobados" | "pendientes">("aprobados")

  // Consulta para obtener los socios y sus detalles
  const {
    data: sociosConDetalles = [],
    isLoading,
    refetch,
  } = useQuery<DetallesSocioConCuota[], Error>({
    queryKey: ["socios-lista"],
    queryFn: async () => {
      const socios = await fetchSocios()
      console.log("Socios obtenidos:", socios)

      // Mapear socios básicos con información de cuota (sin fetchSocioDetails)
      const sociosConCuotas = await Promise.all(
        socios.map(async (socio) => {
          // Crear objeto base con los datos del socio en la estructura que espera la tabla
          const socioBase: DetallesSocioConCuota = {
            ...socio,
            personal: {
              name: socio.name,
              lastName: socio.lastName,
              businessType: socio.businessType,
              phone: socio.phone,
              email: socio.email,
              cuota_socio_id: socio.cuota_socio_id || null,
              created_at: socio.created_at,
            },
          } as unknown as DetallesSocioConCuota

          // Si tiene cuota asignada, obtener solo los detalles de la cuota
          if (socio.cuota_socio_id) {
            try {
              const cuotaDetalle = await obtenerDetalleCuota(socio.cuota_socio_id)
              socioBase.cuotaDetalle = cuotaDetalle
            } catch (error) {
              console.error(`Error al obtener cuota ${socio.cuota_socio_id}:`, error)
            }
          }

          return socioBase
        })
      )

      console.log("Socios con cuotas mapeados:", sociosConCuotas)
      return sociosConCuotas
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
      queryClient.invalidateQueries({ queryKey: ["socios-lista"] })
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
      queryClient.invalidateQueries({ queryKey: ["socios-lista"] })
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

  // Contar socios pendientes para el badge
  const pendientesCount = sociosConDetalles.filter((s) => !s.aprobado).length

  // Aplicar filtros de estado y búsqueda
  const filteredSocios = sociosConDetalles
    .filter((socio) => {
      // Filtrar por tab activo
      if (activeTab === "aprobados") return socio.aprobado === true
      if (activeTab === "pendientes") return socio.aprobado !== true
      return true
    })
    .filter((socio) => {
      // Filtrar por término de búsqueda
      if (!globalFilter) return true

      const searchTerm = globalFilter.toLowerCase()
      return (
        (socio.personal?.name?.toLowerCase() + " " + socio.personal?.lastName?.toLowerCase()).includes(searchTerm) ||
        socio.personal?.lastName?.toLowerCase().includes(searchTerm) ||
        socio.personal?.businessType?.toLowerCase().includes(searchTerm) ||
        socio.personal?.phone?.toLowerCase().includes(searchTerm) ||
        socio.personal?.email?.toLowerCase().includes(searchTerm)
      )
    })
    .filter((socio) => {
      // Aplicar filtros adicionales (completos/incompletos)
      switch (filterType) {
        case "completos":
          return isSocioCompleto(socio)
        case "incompletos":
          return !isSocioCompleto(socio)
        case "todos":
        default:
          return true
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
          <div className="w-full sm:w-auto flex flex-wrap gap-2">
            {/* Tabs de Aprobados/Pendientes */}
            <button
              onClick={() => {
                setActiveTab("aprobados")
                setPagination({ ...pagination, pageIndex: 0 })
              }}
              className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                activeTab === "aprobados"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Check size={16} />
              <span>Aprobados</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("pendientes")
                setPagination({ ...pagination, pageIndex: 0 })
              }}
              className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm relative ${
                activeTab === "pendientes"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Clock size={16} />
              <span>Pendientes</span>
              {pendientesCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full ml-1">
                  {pendientesCount}
                </span>
              )}
            </button>

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
                  {filterType === "todos" && "Todos"}
                  {filterType === "completos" && "Completos"}
                  {filterType === "incompletos" && "Incompletos"}
                </span>
              </Button>
              <div
                id="filter-dropdown"
                className="hidden absolute z-10 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg"
              >
                <div className="py-1">
                  {[
                    { value: "todos", label: "Todos" },
                    { value: "completos", label: "Registros completos" },
                    { value: "incompletos", label: "Registros incompletos" },
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
              
                <th scope="col" className="px-4 py-3"> Datos </th>
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
                  Cuota Asignada
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
                      <td colSpan={10} className="px-4 py-3">
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
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No se encontraron socios</h3>
                    <p className="text-gray-500 mt-2">
                      {globalFilter
                        ? "Intenta con otra búsqueda."
                        : activeTab === "aprobados"
                        ? "No hay socios aprobados."
                        : "No hay socios pendientes de aprobación."}
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

                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-800">
                            {socio.personal?.name || "No especificado"} {socio.personal?.lastName || ""}
                          </div>
                          {socio.documentType && socio.documentNumber && (
                            <div className="text-xs text-gray-600">
                              {socio.documentType} : {socio.documentNumber}
                            </div>
                          )}
                        </div>
                      </td>


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
                      <td className="px-4 py-3 text-center">
                        {socio.personal?.cuota_socio_id && socio.cuotaDetalle ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              <Coins className="w-3 h-3 mr-1" />
                              {socio.cuotaDetalle.periodicidad}
                            </span>
                            <span className={`text-xs font-medium ${
                              socio.cuotaDetalle.tipo_cuota === "porcentaje" 
                                ? "text-purple-600" 
                                : "text-gray-500"
                            }`}>
                              {socio.cuotaDetalle.tipo_cuota === "porcentaje" ? (
                                <>
                                  {Number(socio.cuotaDetalle.porcentaje_comision || 0).toFixed(2)}% comisión
                                  {socio.cuotaDetalle.minimo_pedidos && (
                                    <span className="block text-gray-500 font-normal">
                                      Mín. {socio.cuotaDetalle.minimo_pedidos} pedidos
                                    </span>
                                  )}
                                </>
                              ) : (
                                `S/ ${Number(socio.cuotaDetalle.monto_cuota).toFixed(2)}`
                              )}
                            </span>
                            {socio.cuotaDetalle.dia_pago && (
                              <span className="text-xs text-blue-600 font-medium">
                                Día {socio.cuotaDetalle.dia_pago}
                              </span>
                            )}
                          </div>
                        ) : socio.personal?.cuota_socio_id ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            <Coins className="w-3 h-3 mr-1" />
                            Asignada
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSocioParaCuota({
                                id: socio.id,
                                nombre: `${socio.personal?.name || ""} ${socio.personal?.lastName || ""}`.trim(),
                              })
                              setIsAsignarCuotaModalOpen(true)
                            }}
                            className="bg-red-600 hover:bg-red-700 text-xs"
                          >
                            Asignar Cuota
                          </Button>
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
          <Pagination
            currentPage={pagination.pageIndex + 1}
            totalPages={Math.ceil(filteredSocios.length / pagination.pageSize)}
            totalItems={filteredSocios.length}
            perPage={pagination.pageSize}
            onPageChange={(page) => setPagination({ ...pagination, pageIndex: page - 1 })}
            onPerPageChange={(perPage) => setPagination({ pageSize: perPage, pageIndex: 0 })}
            itemsInCurrentPage={paginatedSocios.length}
          />
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

      {/* Modal de asignar cuota */}
      {socioParaCuota && (
        <AsignarCuotaModal
          isOpen={isAsignarCuotaModalOpen}
          socioId={socioParaCuota.id}
          socioNombre={socioParaCuota.nombre}
          onClose={() => {
            setIsAsignarCuotaModalOpen(false)
            setSocioParaCuota(null)
          }}
          onSuccess={() => {
            refetch()
          }}
        />
      )}

      {/* Modal de editar día de pago */}
      {socioParaEditarDiaPago && (
        <EditarDiaPagoModal
          isOpen={isEditarDiaPagoModalOpen}
          cuota={socioParaEditarDiaPago.cuota}
          socioNombre={`${socioParaEditarDiaPago.socio.personal?.name || ""} ${socioParaEditarDiaPago.socio.personal?.lastName || ""}`.trim()}
          onClose={() => {
            setIsEditarDiaPagoModalOpen(false)
            setSocioParaEditarDiaPago(null)
          }}
          onSuccess={() => {
            refetch()
          }}
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
