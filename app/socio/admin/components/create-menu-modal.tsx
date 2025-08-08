"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Upload, Tag, FileText, X, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { menuService, type Category } from "../services/menu.service"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Imagen por defecto para cuando no se carga una imagen
const DEFAULT_IMAGE = "https://via.placeholder.com/300x300.png?text=Imagen+del+producto"

// Tipos de archivo permitidos
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"]

interface CreateMenuModalProps {
  categories: Category[]
  onSubmit: (formData: FormData) => Promise<void>
  trigger?: React.ReactNode
  defaultCategoryId?: string
}

export function CreateMenuModal({ categories, onSubmit, trigger, defaultCategoryId }: CreateMenuModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategoryId || "")
  const [status, setStatus] = useState<string>("active") // Valor predeterminado: active
  const [error, setError] = useState<string | null>(null)
  const imageRequired = true // La imagen es obligatoria por defecto
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null) // Referencia al formulario

  useEffect(() => {
    if (defaultCategoryId) {
      setSelectedCategory(defaultCategoryId)
    }
  }, [defaultCategoryId])

  // Función para validar el tipo de archivo
  const isValidImageType = (file: File): boolean => {
    // Verificar por MIME type
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return true
    }

    // Verificar por extensión como respaldo
    const fileName = file.name.toLowerCase()
    return ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validar que se haya seleccionado una imagen
    if (!fileInputRef.current?.files?.length) {
      setError("La imagen es obligatoria. Por favor, selecciona una imagen para el producto.")
      return
    }

    // Verificar que el archivo sea una imagen válida
    const file = fileInputRef.current.files[0]
    if (file && !isValidImageType(file)) {
      setError("Formato de imagen no válido. Solo se permiten archivos JPG, PNG y GIF.")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Añadir el status al FormData
      formData.append("status", status)

      // Si hay una categoría seleccionada por defecto, usarla
      if (selectedCategory) {
        formData.set("categoria_id", selectedCategory)
      }

      // Obtener el ID de empresa dinámicamente
      const empresaId = await menuService.getEmpresaId()
      formData.append("empresa_id", empresaId)

      await onSubmit(formData)
      setOpen(false)
      setPreviewImage(null)

      // Usar la referencia al formulario para hacer reset
      if (formRef.current) {
        formRef.current.reset()
      }

      setStatus("active") // Resetear el estado
    } catch (error) {
      console.error("Error al crear producto:", error)
      setError("Error al crear producto. Por favor, intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null) // Limpiar errores previos

    if (file) {
      // Verificar si es una imagen válida PRIMERO
      if (!isValidImageType(file)) {
        setError("Formato de imagen no válido. Solo se permiten archivos JPG, PNG y GIF.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        setPreviewImage(null)
        return
      }

      // Verificar tamaño del archivo (3MB = 3 * 1024 * 1024 bytes)
      const maxSize = 3 * 1024 * 1024 // 3MB
      if (file.size > maxSize) {
        setError("La imagen es demasiado grande. El tamaño máximo permitido es 3MB.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        setPreviewImage(null)
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewImage(null)
    }
  }

  const clearImage = () => {
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Función para resetear el formulario cuando se cierra el modal
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setPreviewImage(null)
      setStatus("active")
      setError(null)
      // No intentamos resetear el formulario aquí
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-red-600 hover:bg-red-700 text-white transition-colors gap-2">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full h-full rounded-none p-4 flex flex-col overflow-y-auto sm:max-w-[550px] sm:rounded-lg sm:h-auto sm:max-h-[90vh] sm:p-6 dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Plus className="h-5 w-5 text-red-600" />
            Crear nuevo producto
          </DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-5">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-sm font-medium flex items-center gap-1">
                <FileText className="h-4 w-4 text-gray-500" />
                Nombre del producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ej: Hamburguesa clásica"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:focus:border-none dark:border-0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria_id" className="text-sm font-medium flex items-center gap-1">
                <Tag className="h-4 w-4 text-gray-500" />
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select name="categoria_id" required value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:focus:border-none dark:border-0">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500  ">No hay categorías disponibles</div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()} 
                  >
                        {category.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Describe los ingredientes o características del producto"
              className="min-h-[80px] border-gray-300 focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:focus:border-none dark:border-0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio" className="text-sm font-medium flex items-center gap-1">
                <span className="text-gray-600 font-bold text-sm mr-1">S/</span>
                Precio <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8 border-gray-300 focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:focus:border-none dark:border-0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto" className="text-sm font-medium flex items-center gap-1">
                <Upload className="h-4 w-4 text-gray-500 " />
                Foto del producto <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="foto"
                  name="foto"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className={cn(
                    "border-gray-300 focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:focus:border-none dark:border-0",
                    previewImage ? "hidden" : "block",
                  )}
                  required={imageRequired}
                />
                {previewImage && (
                  <div className="relative h-[100px] rounded-md overflow-hidden">
                    <Image src={previewImage || DEFAULT_IMAGE} alt="Vista previa" fill className="object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={clearImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  La imagen es obligatoria. Tamaño máximo: 3MB. Formatos permitidos: JPG, PNG, GIF únicamente.
                </p>
              </div>
            </div>
          </div>

          {/* Estado del producto */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estado del producto</Label>
            <RadioGroup value={status} onValueChange={setStatus} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="flex items-center cursor-pointer">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span>Activo</span>
                  <span className="text-xs text-gray-500 ml-2">(Disponible para compra)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive" className="flex items-center cursor-pointer">
                  <XCircle className="h-4 w-4 text-gray-500 mr-2" />
                  <span>Inactivo</span>
                  <span className="text-xs text-gray-500 ml-2">(No visible para clientes)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50">
                <RadioGroupItem value="out-of-stock" id="out-of-stock" />
                <Label htmlFor="out-of-stock" className="flex items-center cursor-pointer">
                  <Clock className="h-4 w-4 text-amber-500 mr-2" />
                  <span>Agotado</span>
                  <span className="text-xs text-gray-500 ml-2">(Visible pero no disponible)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-300"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear producto
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
