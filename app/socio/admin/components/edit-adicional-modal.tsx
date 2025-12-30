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
import { Edit, Upload, DollarSign, Tag, FileText, X, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Adicional, CategoriaAdicional } from "../services/adicional.service"
import Image from "next/image"

interface EditAdicionalModalProps {
  adicional: Adicional
  categorias: CategoriaAdicional[]
  onSubmit: (id: number, formData: FormData) => Promise<void>
  trigger?: React.ReactNode
}

export function EditAdicionalModal({ adicional, categorias, onSubmit, trigger }: EditAdicionalModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<string>("")
  const [status, setStatus] = useState<string>("active")
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB en bytes

  useEffect(() => {
    if (adicional) {
      setSelectedCategoria(adicional.categoria_adicional_id.toString())
      setStatus(adicional.status)
      if (adicional.foto) {
        setPreviewImage(adicional.foto)
      }
    }
  }, [adicional, open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Añadir el status al FormData
      formData.append("status", status)

      // Si hay una categoría seleccionada, usarla
      if (selectedCategoria) {
        formData.set("categoria_adicional_id", selectedCategoria)
      }

      await onSubmit(adicional.id, formData)
      setOpen(false)
    } catch (error) {
      console.error("Error al actualizar adicional:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError(null) // Limpiar error previo

    if (file) {
      // Validar tamaño del archivo (5MB máximo)
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`La imagen es demasiado grande. Tamaño máximo: 5MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setImageError('Formato no válido. Solo se permiten imágenes JPG, PNG, GIF o WEBP')
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setPreviewImage(null)
    setImageError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          // Resetear el estado si se cierra el modal sin guardar
          if (adicional.foto) {
            setPreviewImage(adicional.foto)
          } else {
            setPreviewImage(null)
          }
          setImageError(null)
          setStatus(adicional.status)
          setSelectedCategoria(adicional.categoria_adicional_id.toString())
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Edit className="h-5 w-5 text-red-600" />
            Editar adicional
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-sm font-medium flex items-center gap-1">
                <FileText className="h-4 w-4 text-gray-500" />
                Nombre del adicional
              </Label>
              <Input
                id="titulo"
                name="titulo"
                defaultValue={adicional.titulo}
                placeholder="Ej: Papas fritas, Ensalada"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria_adicional_id" className="text-sm font-medium flex items-center gap-1">
                <Tag className="h-4 w-4 text-gray-500" />
                Categoría
              </Label>
              <Select name="categoria_adicional_id" value={selectedCategoria} onValueChange={setSelectedCategoria}>
                <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No hay categorías disponibles</div>
                  ) : (
                    categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id.toString()}>
                        {categoria.nombre}
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
              defaultValue={adicional.descripcion}
              placeholder="Describe las características del adicional"
              className="min-h-[80px] border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio" className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Precio
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={typeof adicional.precio === "string" ? adicional.precio : adicional.precio.toFixed(2)}
                  placeholder="0.00"
                  className="pl-8 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto" className="text-sm font-medium flex items-center gap-1">
                <Upload className="h-4 w-4 text-gray-500" />
                Foto del adicional
              </Label>
              <div className="relative">
                <Input
                  id="foto"
                  name="foto"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className={cn(
                    "border-gray-300 focus:border-red-500 focus:ring-red-500",
                    previewImage ? "hidden" : "block",
                    imageError ? "border-red-500" : ""
                  )}
                />
                {imageError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {imageError}
                  </p>
                )}
                {previewImage && (
                  <div className="relative h-[100px] rounded-md overflow-hidden">
                    <Image src={previewImage || "/placeholder.svg"} alt="Vista previa" fill className="object-cover" />
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
              </div>
              <p className="text-xs text-gray-500">Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF, WEBP</p>
            </div>
          </div>

          {/* Estado del adicional */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estado del adicional</Label>
            <RadioGroup value={status} onValueChange={setStatus} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50">
                <RadioGroupItem value="active" id="active-edit" />
                <Label htmlFor="active-edit" className="flex items-center cursor-pointer">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span>Activo</span>
                  <span className="text-xs text-gray-500 ml-2">(Disponible para compra)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50">
                <RadioGroupItem value="inactive" id="inactive-edit" />
                <Label htmlFor="inactive-edit" className="flex items-center cursor-pointer">
                  <XCircle className="h-4 w-4 text-gray-500 mr-2" />
                  <span>Inactivo</span>
                  <span className="text-xs text-gray-500 ml-2">(No visible para clientes)</span>
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
              disabled={isSubmitting || !!imageError}
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
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Guardar cambios
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

