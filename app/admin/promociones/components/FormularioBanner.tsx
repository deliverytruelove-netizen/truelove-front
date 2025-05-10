// app/admin/promociones/components/FormularioBanner.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useBannerMutations, useImageFormatter } from "../hooks/useBannersQuery"
import type { Banner } from "../types/banner.types"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormularioBannerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  banner: Banner | null
  onClose: () => void
}

const initialBannerState: Banner = {
  titulo: "",
  subtitulo: "",
  color_fondo: "#FF1493",
  texto_boton: "Ver más",
  url_boton: "https://",
  estado: true,
}

const MAX_FILE_SIZE = 2048 // 2MB en KB

export function FormularioBanner({ isOpen, onOpenChange, banner, onClose }: FormularioBannerProps) {
  const { createBanner, updateBanner, isCreating, isUpdating } = useBannerMutations()
  const formatImageUrl = useImageFormatter()
  
  const isLoading = isCreating || isUpdating

  const [formData, setFormData] = useState<Banner>({...initialBannerState})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  // Reiniciar el formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      if (banner) {
        // Asegurarse de que todos los campos tengan valores válidos, nunca null
        setFormData({
          id: banner.id,
          titulo: banner.titulo || "",
          subtitulo: banner.subtitulo || "",
          color_fondo: banner.color_fondo || "#ffffff",
          texto_boton: banner.texto_boton || "",
          url_boton: banner.url_boton || "https://",
          estado: banner.estado !== undefined ? banner.estado : true,
        })
        if (typeof banner.url_imagen === "string" && banner.url_imagen) {
          setImagePreview(formatImageUrl(banner.url_imagen))
        } else {
          setImagePreview(null)
        }
      } else {
        setFormData({...initialBannerState})
        setImagePreview(null)
      }
      setImageError(null)
    }
  }, [banner, isOpen, formatImageUrl])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, estado: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const fileSizeKB = file.size / 1024 // Convertir a KB

      if (fileSizeKB > MAX_FILE_SIZE) {
        setImageError(`La imagen no debe superar los ${MAX_FILE_SIZE / 1024}MB`)
        e.target.value = '' // Limpiar el input
        return
      }

      setFormData((prev) => ({ ...prev, url_imagen: file }))
      setImageError(null)

      // Crear preview de la imagen
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (imageError) {
      return
    }

    try {
      // Crear FormData para enviar la imagen
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "url_imagen" && value instanceof File) {
          formDataToSend.append(key, value)
        } else if (key === "estado") {
          formDataToSend.append(key, value ? "1" : "0")
        } else if (key !== "url_imagen" || (key === "url_imagen" && typeof value === "string")) {
          formDataToSend.append(key, String(value))
        }
      })

      // Si es edición y no se seleccionó nueva imagen, asegurarse de no enviar null
      if (banner?.id && !formDataToSend.has('url_imagen') && typeof banner.url_imagen === "string") {
        // No es necesario hacer nada, la API mantendrá la imagen existente
      }

      if (banner?.id) {
        await updateBanner({ id: banner.id, formData: formDataToSend })
      } else {
        await createBanner(formDataToSend)
      }

      onClose()
    } catch (error) {
      console.error("Error al guardar banner:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{banner ? "Editar Banner" : "Crear Nuevo Banner"}</DialogTitle>
          <DialogDescription>
            {banner 
              ? "Modifica los detalles del banner existente" 
              : "Completa el formulario para crear un nuevo banner promocional"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input 
                id="titulo" 
                name="titulo" 
                value={formData.titulo} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitulo">Subtítulo</Label>
              <Input 
                id="subtitulo" 
                name="subtitulo" 
                value={formData.subtitulo} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color_fondo">Color de Fondo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="color_fondo"
                  name="color_fondo"
                  value={formData.color_fondo}
                  onChange={handleInputChange}
                  className="w-12 h-10 p-1"
                  required
                />
                <Input
                  type="text"
                  value={formData.color_fondo}
                  onChange={handleInputChange}
                  name="color_fondo"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="texto_boton">Texto del Botón</Label>
              <Input
                id="texto_boton"
                name="texto_boton"
                value={formData.texto_boton}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_boton">URL del Botón</Label>
            <Input 
              id="url_boton" 
              name="url_boton" 
              value={formData.url_boton} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_imagen">Imagen</Label>
            <Alert variant="default" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El tamaño máximo permitido es {MAX_FILE_SIZE / 1024}MB
              </AlertDescription>
            </Alert>
            {imageError && (
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{imageError}</AlertDescription>
              </Alert>
            )}
            <Input 
              id="url_imagen" 
              name="url_imagen" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
            />

            {imagePreview && (
              <div className="mt-2 border rounded-md overflow-hidden">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Vista previa"
                  width={500}
                  height={300}
                  className="max-h-40 w-auto h-auto object-contain mx-auto"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="estado" checked={formData.estado} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="estado">Activo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !!imageError} className="bg-red-500 hover:bg-red-600">
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}