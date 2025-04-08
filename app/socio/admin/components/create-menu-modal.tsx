// app\socio\admin\components\create-menu-modal.tsx
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
import { Plus, Upload, DollarSign, Tag, FileText, X, CheckCircle2, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { menuService, type Category } from "../services/menu.service"
import Image from "next/image"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (defaultCategoryId) {
      setSelectedCategory(defaultCategoryId)
    }
  }, [defaultCategoryId])
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
      e.currentTarget.reset()
      setStatus("active") // Resetear el estado
    } catch (error) {
      console.error("Error al crear producto:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setPreviewImage(null)
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
          setPreviewImage(null)
          setStatus("active") // Resetear el estado al cerrar
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-red-600 hover:bg-red-700 text-white transition-colors gap-2">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="h-5 w-5 text-red-600" />
            Crear nuevo producto
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-sm font-medium flex items-center gap-1">
                <FileText className="h-4 w-4 text-gray-500" />
                Nombre del producto
              </Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ej: Hamburguesa clásica"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria_id" className="text-sm font-medium flex items-center gap-1">
                <Tag className="h-4 w-4 text-gray-500" />
                Categoría
              </Label>
              <Select name="categoria_id" required value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No hay categorías disponibles</div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
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
                  placeholder="0.00"
                  className="pl-8 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto" className="text-sm font-medium flex items-center gap-1">
                <Upload className="h-4 w-4 text-gray-500" />
                Foto del producto
              </Label>
              <div className="relative">
                <Input
                  id="foto"
                  name="foto"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className={cn(
                    "border-gray-300 focus:border-red-500 focus:ring-red-500",
                    previewImage ? "hidden" : "block",
                  )}
                />
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


