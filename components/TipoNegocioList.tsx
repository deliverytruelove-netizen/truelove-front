"use client"

import type React from "react"
import { useState } from "react"
import { Search, RefreshCw, X, Trash2, Plus, Edit, Power, List } from "lucide-react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchTiposNegocio,
  deleteTipoNegocio,
  toggleTipoNegocioStatus,
} from "@/app/admin/tiposNegocio/services/TiposNegocio.service"
import type { TipoNegocio } from "@/app/admin/tiposNegocio/types/TiposNegocio.types"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import { showAlert } from "@/components/ui/DataTable/Alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import TipoNegocioModal from "./modals/TipoNegocioModal"
import DeleteConfirmDialog from "./modals/DeleteConfirmDialog"
import CategoriasModal from "./modals/CategoriasModal"

const TipoNegocioList: React.FC = () => {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTipo, setSelectedTipo] = useState<TipoNegocio | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tipoToDelete, setTipoToDelete] = useState<{ id: number; nombre: string } | null>(null)
  const [isCategoriasModalOpen, setIsCategoriasModalOpen] = useState(false)
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })

  // Consulta para obtener tipos de negocio
  const {
    data: tiposNegocio = [],
    isLoading,
    refetch,
  } = useQuery<TipoNegocio[], Error>({
    queryKey: ["tipos-negocio"],
    queryFn: fetchTiposNegocio,
  })

  // Mutación para eliminar
  const mutationDelete = useMutation({
    mutationFn: deleteTipoNegocio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tipos-negocio"] })
      showAlert({
        title: "Éxito",
        text: "Tipo de negocio eliminado correctamente.",
        icon: "success",
      })
      setIsDeleteDialogOpen(false)
      setTipoToDelete(null)
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
      setIsDeleteDialogOpen(false)
    },
  })

  // Mutación para cambiar estado
  const mutationToggleStatus = useMutation({
    mutationFn: toggleTipoNegocioStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tipos-negocio"] })
      showAlert({
        title: "Éxito",
        text: "Estado actualizado correctamente.",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const handleDelete = (id: number, nombre: string) => {
    setTipoToDelete({ id, nombre })
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (tipoToDelete) {
      mutationDelete.mutate(tipoToDelete.id)
    }
  }

  const handleEdit = (tipo: TipoNegocio) => {
    setSelectedTipo(tipo)
    setIsEditModalOpen(true)
  }

  const handleToggleStatus = (id: number) => {
    mutationToggleStatus.mutate(id)
  }

  const handleViewCategorias = (tipo: TipoNegocio) => {
    setSelectedTipo(tipo)
    setIsCategoriasModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Filtrar tipos de negocio
  const filteredTipos = tiposNegocio.filter((tipo) => {
    const searchTerm = globalFilter.toLowerCase()
    return (
      !globalFilter ||
      tipo.nombre.toLowerCase().includes(searchTerm) ||
      tipo.slug.toLowerCase().includes(searchTerm)
    )
  })

  // Paginación
  const paginatedTipos = filteredTipos.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  )

  return (
    <Section title="Gestión de Tipos de Negocio">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tipo de Negocio
          </Button>

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
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3">
                  Slug
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Categorías
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Fecha Creación
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
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : filteredTipos.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No se encontraron tipos de negocio</h3>
                    <p className="text-gray-500 mt-2">
                      {globalFilter
                        ? "Intenta con otra búsqueda."
                        : "No hay tipos de negocio registrados."}
                    </p>
                    {globalFilter && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setGlobalFilter("")}
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedTipos.map((tipo, index) => {
                  const pageSize = pagination.pageSize
                  const pageIndex = pagination.pageIndex
                  const rowNumber = pageSize * pageIndex + index + 1

                  return (
                  <tr key={tipo.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center font-medium text-gray-600">{rowNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{tipo.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{tipo.slug}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tipo.categorias_count || 0} categorías
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tipo.activo ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{formatDate(tipo.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCategorias(tipo)}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                          title="Ver categorías"
                        >
                          <List className="w-5 h-5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tipo)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(tipo.id)}
                          className={`${
                            tipo.activo
                              ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                              : "text-green-600 hover:text-green-800 hover:bg-green-50"
                          }`}
                          title={tipo.activo ? "Desactivar" : "Activar"}
                        >
                          <Power className="w-5 h-5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tipo.id, tipo.nombre)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Eliminar"
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

        {/* Paginación */}
        {filteredTipos.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Mostrando {pagination.pageIndex * pagination.pageSize + 1} a{" "}
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredTipos.length)} de{" "}
              {filteredTipos.length} registros
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Página {pagination.pageIndex + 1} de {Math.ceil(filteredTipos.length / pagination.pageSize)}
              </span>
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
                  variant="outline"
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      pageIndex: Math.min(
                        Math.ceil(filteredTipos.length / pagination.pageSize) - 1,
                        pagination.pageIndex + 1,
                      ),
                    })
                  }
                  disabled={pagination.pageIndex >= Math.ceil(filteredTipos.length / pagination.pageSize) - 1}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de crear tipo */}
      <TipoNegocioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["tipos-negocio"] })
        }}
      />

      {/* Modal de editar tipo */}
      {selectedTipo && (
        <TipoNegocioModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedTipo(null)
          }}
          tipoNegocio={selectedTipo}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["tipos-negocio"] })
            setSelectedTipo(null)
          }}
        />
      )}

      {/* Modal de categorías */}
      {selectedTipo && (
        <CategoriasModal
          isOpen={isCategoriasModalOpen}
          onClose={() => {
            setIsCategoriasModalOpen(false)
            setSelectedTipo(null)
          }}
          tipoNegocio={selectedTipo}
        />
      )}

      {/* Diálogo de confirmación de eliminación */}
      {tipoToDelete && (
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Eliminar Tipo de Negocio"
          message={`¿Estás seguro de que deseas eliminar "${tipoToDelete.nombre}"? Esta acción no se puede deshacer.`}
        />
      )}
    </Section>
  )
}

export default TipoNegocioList
