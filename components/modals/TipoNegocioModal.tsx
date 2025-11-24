"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { showAlert } from "@/components/ui/DataTable/Alert"
import { createTipoNegocio, updateTipoNegocio } from "@/app/admin/tiposNegocio/services/TiposNegocio.service"
import type { TipoNegocio, TipoNegocioFormData } from "@/app/admin/tiposNegocio/types/TiposNegocio.types"

interface TipoNegocioModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tipoNegocio?: TipoNegocio
}

const TipoNegocioModal: React.FC<TipoNegocioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tipoNegocio,
}) => {
  const [nombre, setNombre] = useState("")
  const [errors, setErrors] = useState<{ nombre?: string }>({})

  const isEditMode = !!tipoNegocio

  useEffect(() => {
    if (tipoNegocio) {
      setNombre(tipoNegocio.nombre)
    } else {
      setNombre("")
    }
    setErrors({})
  }, [tipoNegocio, isOpen])

  const createMutation = useMutation({
    mutationFn: createTipoNegocio,
    onSuccess: () => {
      showAlert({
        title: "Éxito",
        text: "Tipo de negocio creado correctamente.",
        icon: "success",
      })
      onSuccess()
      onClose()
      resetForm()
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TipoNegocioFormData }) =>
      updateTipoNegocio(id, data),
    onSuccess: () => {
      showAlert({
        title: "Éxito",
        text: "Tipo de negocio actualizado correctamente.",
        icon: "success",
      })
      onSuccess()
      onClose()
      resetForm()
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const resetForm = () => {
    setNombre("")
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

    const formData: TipoNegocioFormData = {
      nombre: nombre.trim(),
    }

    if (isEditMode && tipoNegocio) {
      updateMutation.mutate({ id: tipoNegocio.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Editar Tipo de Negocio" : "Nuevo Tipo de Negocio"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Tipo de Negocio <span className="text-red-500">*</span>
            </label>
            <Input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Restaurante, Farmacia, etc."
              disabled={isLoading}
              className={errors.nombre ? "border-red-500" : ""}
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  {isEditMode ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>{isEditMode ? "Actualizar" : "Crear"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TipoNegocioModal
