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
import { Plus, Upload, DollarSign, Package, FileText, X, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Menu } from "../services/adicional.service"
import Image from "next/image"

interface CreateAdicionalModalProps {
  menus: Menu[]
  onSubmit: (formData: FormData) => Promise<void>
  trigger?: React.ReactNode
  defaultMenuId?: string
}

export function CreateAdicionalModal({ menus, onSubmit, trigger, defaultMenuId }: CreateAdicionalModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedMenu, setSelectedMenu] = useState<string>(defaultMenuId || "")
  const [status, setStatus] = useState<string>("active")
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_FILE_SIZE = 5 * 1024 * 1024

  useEffect(() => {
    if (defaultMenuId) {
      setSelectedMenu(defaultMenuId)
    }
  }, [defaultMenuId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("status", status)

      if (selectedMenu) {
        formData.set("menu_id", selectedMenu)
      }

      await onSubmit(formData)
      setOpen(false)
      setPreviewImage(null)
      e.currentTarget.reset()
      setStatus("active")
      setSelectedMenu(defaultMenuId || "")
    } catch (error) {
      console.error("Error al crear adicional:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError(null)

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`La imagen es demasiado grande. Tamaño máximo: 5MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

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
          setPreviewImage(null)
          setImageError(null)
          setStatus("active")
          setSelectedMenu(defaultMenuId || "")
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-red-600 hover:bg-red-700 text-white transition-colors gap-2">
            <Plus className="h-4 w-4" />
            Nuevo adicional
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[550px] p-0 flex flex-col overflow-hidden rounded-lg fixed top-[5vh] left-[50%] translate-x-[-50%] translate-y-0 h-[90vh] sm:top-[50%] sm:translate-y-[-50%] sm:h-auto sm:max-h-[85vh]">
        {/* Header fijo */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <DialogHeader className="space-y-0">
            <DialogTitle className="text-base sm:text-xl font-semibold text-gray-800 flex items-center gap-2 pr-8">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              Crear nuevo adicional
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Contenido scrolleable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {/* Nombre del adicional */}
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-sm font-medium flex items-center gap-1">
                <FileText className="h-4 w-4 text-gray-500" />
                Nombre del adicional <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ej: Extra queso, Salsa especial"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>

            {/* Producto asociado */}
            <div className="space-y-2">
              <Label htmlFor="menu_id" className="text-sm font-medium flex items-center gap-1">
                <Package className="h-4 w-4 text-gray-500" />
                Producto asociado <span className="text-red-500">*</span>
              </Label>
              <Select
                name="menu_id"
                required
                value={selectedMenu}
                onValueChange={setSelectedMenu}
              >
                <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {menus.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No hay productos disponibles</div>
                  ) : (
                    menus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id.toString()}>
                        {menu.titulo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Este adicional estará disponible solo para el producto seleccionado
              </p>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                placeholder="Describe el adicional (opcional)"
                className="min-h-[60px] border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="precio" className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Precio <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S/</span>
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

            {/* Foto del adicional */}
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
                    "border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm",
                    previewImage ? "hidden" : "block",
                    imageError ? "border-red-500" : ""
                  )}
                />
                {imageError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{imageError}</span>
                  </p>
                )}
                {previewImage && (
                  <div className="relative w-full h-20 rounded-md overflow-hidden border border-gray-200">
                    <Image
                      src={previewImage}
                      alt="Vista previa"
                      fill
                      className="object-contain bg-gray-50"
                    />
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
              <p className="text-xs text-gray-500">
                Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF, WEBP. (Opcional)
              </p>
            </div>

            {/* Estado del adicional */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estado del adicional</Label>
              <RadioGroup value={status} onValueChange={setStatus} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="flex items-center cursor-pointer flex-1 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="font-medium">Activo</span>
                    <span className="text-xs text-gray-500 ml-1">(Disponible)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="flex items-center cursor-pointer flex-1 text-sm">
                    <XCircle className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span className="font-medium">Inactivo</span>
                    <span className="text-xs text-gray-500 ml-1">(No visible)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 flex-shrink-0">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gray-300 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white transition-colors w-full sm:w-auto"
                disabled={isSubmitting || !!imageError || !selectedMenu}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
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
                  <span className="flex items-center justify-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear adicional
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

CreateAdicionalModal.PlusIcon = Plus
