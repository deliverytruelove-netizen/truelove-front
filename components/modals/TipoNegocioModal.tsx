"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import { X, Loader2, Upload, Image as ImageIcon } from "lucide-react"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { showAlert } from "@/components/ui/DataTable/Alert"
import { createTipoNegocio, updateTipoNegocio } from "@/app/admin/tiposNegocio/services/TiposNegocio.service"
import type { TipoNegocio, TipoNegocioFormData } from "@/app/admin/tiposNegocio/types/TiposNegocio.types"
import { getTipoNegocioImageUrl } from "@/app/admin/tiposNegocio/utils/imageHelper"

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
  const [orden, setOrden] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ nombre?: string; orden?: string; image?: string }>({})
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!tipoNegocio

  useEffect(() => {
    if (tipoNegocio) {
      setNombre(tipoNegocio.nombre)
      setOrden(tipoNegocio.orden.toString())
      setImagePreview(getTipoNegocioImageUrl(tipoNegocio.image))
    } else {
      setNombre("")
      setOrden("")
      setImagePreview(null)
    }
    setImageFile(null)
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
    mutationFn: ({ id, data }: { id: number; data: TipoNegocioFormData | FormData }) =>
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
    setOrden("")
    setImageFile(null)
    setImagePreview(null)
    setErrors({})
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, image: 'Solo se permiten archivos PNG, JPG o WEBP' })
        return
      }

      // Validar tamaño inicial (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, image: 'La imagen no debe superar los 2MB' })
        return
      }

      try {
        setIsCompressing(true)

        // Comprimir la imagen
        const compressedFile = await compressImage(file)

        setImageFile(compressedFile)
        setErrors({ ...errors, image: undefined })

        // Crear preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
          setIsCompressing(false)
        }
        reader.readAsDataURL(compressedFile)
      } catch {
        setIsCompressing(false)
        setErrors({ ...errors, image: 'Error al procesar la imagen' })
      }
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Función para comprimir imagen con compresión adaptativa
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // Calcular nuevas dimensiones manteniendo aspect ratio
          let width = img.width
          let height = img.height
          const maxDimension = 800 // Máximo ancho/alto

          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width
              width = maxDimension
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height
              height = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height

          ctx?.drawImage(img, 0, 0, width, height)

          // Determinar calidad basada en el tamaño original
          // Si la imagen es muy pesada, comprimir más
          let quality = 0.85 // Calidad por defecto
          const fileSizeKB = file.size / 1024

          if (fileSizeKB > 1500) {
            quality = 0.6 // 60% para imágenes > 1.5MB
          } else if (fileSizeKB > 1000) {
            quality = 0.7 // 70% para imágenes > 1MB
          } else if (fileSizeKB > 500) {
            quality = 0.8 // 80% para imágenes > 500KB
          }

          // Convertir a blob con compresión adaptativa
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                reject(new Error('Error al comprimir la imagen'))
              }
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = () => reject(new Error('Error al cargar la imagen'))
      }
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
    })
  }

  const validate = () => {
    const newErrors: { nombre?: string; orden?: string; image?: string } = {}

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    if (!orden.trim()) {
      newErrors.orden = "El orden es requerido"
    } else if (isNaN(Number(orden)) || Number(orden) < 0) {
      newErrors.orden = "El orden debe ser un número válido mayor o igual a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const formData = new FormData()
    formData.append('nombre', nombre.trim())
    formData.append('orden', orden.trim())

    if (imageFile) {
      formData.append('image', imageFile)
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

          <div>
            <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
              Orden <span className="text-red-500">*</span>
            </label>
            <Input
              id="orden"
              type="number"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              placeholder="Ej: 1, 2, 3..."
              disabled={isLoading}
              min="0"
              className={errors.orden ? "border-red-500" : ""}
            />
            {errors.orden && <p className="text-red-500 text-xs mt-1">{errors.orden}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen
            </label>

            <div className="space-y-3">
              {isCompressing ? (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                  <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                  <p className="mt-2 text-sm text-blue-600 font-medium">
                    Comprimiendo imagen...
                  </p>
                </div>
              ) : imagePreview ? (
                <div className="relative inline-block">
                  <div className="relative h-32 w-32 rounded-lg border-2 border-gray-200 overflow-hidden">
                    <NextImage
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Haz clic para subir una imagen
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG o WEBP (máx. 2MB)
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Se comprimirá automáticamente para optimizar tamaño
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />

              {!imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar imagen
                </Button>
              )}

              {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
            </div>
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
