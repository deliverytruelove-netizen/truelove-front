"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { X, Plus, Edit, Trash2, Power, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { showAlert } from "@/components/ui/DataTable/Alert"
import {
  fetchCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  toggleCategoriaStatus,
} from "@/app/admin/tiposNegocio/services/TiposNegocio.service"
import type { TipoNegocio, Categoria, CategoriaFormData } from "@/app/admin/tiposNegocio/types/TiposNegocio.types"
import DeleteConfirmDialog from "./DeleteConfirmDialog"

interface CategoriasModalProps {
  isOpen: boolean
  onClose: () => void
  tipoNegocio: TipoNegocio
}

const CategoriasModal: React.FC<CategoriasModalProps> = ({ isOpen, onClose, tipoNegocio }) => {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nombre, setNombre] = useState("")
  const [errors, setErrors] = useState<{ nombre?: string }>({})
  const [categoriaToDelete, setCategoriaToDelete] = useState<{ id: number; nombre: string } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Obtener categorías
  const { data: categorias = [], isLoading } = useQuery<Categoria[], Error>({
    queryKey: ["categorias", tipoNegocio.id],
    queryFn: () => fetchCategorias(tipoNegocio.id),
    enabled: isOpen,
  })

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias", tipoNegocio.id] })
      queryClient.invalidateQueries({ queryKey: ["tipos-negocio"] })
      showAlert({
        title: "Éxito",
        text: "Categoría creada correctamente.",
        icon: "success",
      })
      resetForm()
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<CategoriaFormData, 'tipo_negocio_id'> }) =>
      updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias", tipoNegocio.id] })
      showAlert({
        title: "Éxito",
        text: "Categoría actualizada correctamente.",
        icon: "success",
      })
      resetForm()
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias", tipoNegocio.id] })
      queryClient.invalidateQueries({ queryKey: ["tipos-negocio"] })
      showAlert({
        title: "Éxito",
        text: "Categoría eliminada correctamente.",
        icon: "success",
      })
      setIsDeleteDialogOpen(false)
      setCategoriaToDelete(null)
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
      setIsDeleteDialogOpen(false)
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: toggleCategoriaStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias", tipoNegocio.id] })
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

  const resetForm = () => {
    setNombre("")
    setIsCreating(false)
    setEditingId(null)
    setErrors({})
  }

  const validate = () => {
    const newErrors: { nombre?: string } = {}

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (editingId) {
      // Actualizar
      updateMutation.mutate({
        id: editingId,
        data: { nombre: nombre.trim() },
      })
    } else {
      // Crear
      const formData: CategoriaFormData = {
        nombre: nombre.trim(),
        tipo_negocio_id: tipoNegocio.id,
      }
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.id)
    setNombre(categoria.nombre)
    setIsCreating(false)
    setErrors({})
  }

  const handleDelete = (id: number, nombre: string) => {
    setCategoriaToDelete({ id, nombre })
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (categoriaToDelete) {
      deleteMutation.mutate(categoriaToDelete.id)
    }
  }

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id)
  }

  const isProcessing =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Categorías de {tipoNegocio.nombre}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {categorias.length} categoría{categorias.length !== 1 ? "s" : ""} registrada{categorias.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Formulario de creación/edición */}
            {(isCreating || editingId) && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {editingId ? "Editar Categoría" : "Nueva Categoría"}
                </h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre de la categoría"
                      disabled={isProcessing}
                      className={errors.nombre ? "border-red-500" : ""}
                    />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : editingId ? (
                      "Actualizar"
                    ) : (
                      "Crear"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isProcessing}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            {/* Botón para crear nueva categoría */}
            {!isCreating && !editingId && (
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-red-600 hover:bg-red-700 text-white mb-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            )}

            {/* Lista de categorías */}
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">Cargando categorías...</p>
              </div>
            ) : categorias.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay categorías registradas</p>
                <p className="text-sm text-gray-400 mt-1">
                  Crea la primera categoría para este tipo de negocio
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {categorias.map((categoria) => (
                  <div
                    key={categoria.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{categoria.nombre}</h4>
                      <p className="text-xs text-gray-500">{categoria.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {categoria.activo ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactivo
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(categoria)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(categoria.id)}
                        className={`${
                          categoria.activo
                            ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                            : "text-green-600 hover:text-green-800 hover:bg-green-50"
                        }`}
                        title={categoria.activo ? "Desactivar" : "Activar"}
                      >
                        <Power className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(categoria.id, categoria.nombre)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end p-6 border-t border-gray-200">
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      {categoriaToDelete && (
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Eliminar Categoría"
          message={`¿Estás seguro de que deseas eliminar "${categoriaToDelete.nombre}"? Esta acción no se puede deshacer.`}
        />
      )}
    </>
  )
}

export default CategoriasModal
