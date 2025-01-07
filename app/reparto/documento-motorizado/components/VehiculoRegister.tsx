'use client'

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"
import { Camera, Upload } from 'lucide-react'
import { CameraCapture } from "./CapturarCamara"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  placa: z.string().min(6, "La placa debe tener al menos 6 caracteres"),
  licenciaConducir: z.string().min(8, "El número de licencia debe tener al menos 8 caracteres"),
  seguro: z.string().min(8, "El número de seguro debe tener al menos 8 caracteres"),
  tarjetaPropiedad: z.string().min(8, "El número de tarjeta debe tener al menos 8 caracteres"),
})

export function VehicleRegistrationForm() {
  const router = useRouter()
  const [repartoRegistroId, setRepartoRegistroId] = useState<string | null>(null)
  const [images, setImages] = useState<{ [key: string]: string }>({})
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [currentField, setCurrentField] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const id = sessionStorage.getItem('repartoRegistroId')
    if (!id) {
      toast({
        title: "Error",
        description: "No se encontró el ID del registro",
        variant: "destructive",
      })
      router.push('/reparto/registro')
    } else {
      setRepartoRegistroId(id)
    }
  }, [router, toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placa: "",
      licenciaConducir: "",
      seguro: "",
      tarjetaPropiedad: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!repartoRegistroId) {
      toast({
        title: "Error",
        description: "No se encontró el ID del registro",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()

      // Append reparto_registro_id
      formData.append('reparto_registro_id', repartoRegistroId)

      // Append text fields
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value)
      })

      // Append image fields
      Object.entries(images).forEach(([key, value]) => {
        const imageFile = dataURLtoFile(value, `${key}.jpg`)
        formData.append(`${key}_imagen`, imageFile)
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/registro-vehiculo`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.mensaje || 'Error al enviar el formulario')
      }

      const data = await response.json()
      toast({
        title: "Registro exitoso",
        description: "El vehículo ha sido registrado correctamente.",
      })
      console.log(data)
      
      // Mantener el ID en sessionStorage
      sessionStorage.setItem('repartoRegistroId', repartoRegistroId)
      router.push('/reparto/registro-exitoso')
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al registrar el vehículo. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCapture = (field: string) => {
    setCurrentField(field)
    setIsCameraOpen(true)
  }

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [field]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  if (!repartoRegistroId) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="placa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa del Vehículo</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese la placa" {...field} />
              </FormControl>
              <FormDescription>
                Ingrese la placa de su vehículo sin espacios
              </FormDescription>
              <FormMessage />
              <div className="flex gap-2 mt-2">
                <DocumentUpload
                  field="placa"
                  image={images.placa}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenciaConducir"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Licencia de Conducir</FormLabel>
              <FormControl>
                <Input placeholder="Número de licencia" {...field} maxLength={8} />
              </FormControl>
              <FormDescription>
                Ingrese el número de su licencia de conducir
              </FormDescription>
              <FormMessage />
              <div className="flex gap-2 mt-2">
                <DocumentUpload
                  field="licenciaConducir"
                  image={images.licenciaConducir}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seguro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seguro del Vehículo</FormLabel>
              <FormControl>
                <Input placeholder="Número de póliza" {...field} />
              </FormControl>
              <FormDescription>
                Ingrese el número de póliza del seguro
              </FormDescription>
              <FormMessage />
              <div className="flex gap-2 mt-2">
                <DocumentUpload
                  field="seguro"
                  image={images.seguro}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tarjetaPropiedad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarjeta de Propiedad</FormLabel>
              <FormControl>
                <Input placeholder="Número de tarjeta" {...field} />
              </FormControl>
              <FormDescription>
                Ingrese el número de la tarjeta de propiedad
              </FormDescription>
              <FormMessage />
              <div className="flex gap-2 mt-2">
                <DocumentUpload
                  field="tarjetaPropiedad"
                  image={images.tarjetaPropiedad}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-[#f34739] hover:bg-[#d63c30] text-white" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Información'}
        </Button>
      </form>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tomar Foto</DialogTitle>
          </DialogHeader>
          <CameraCapture
            onCapture={(imageSrc) => {
              setImages(prev => ({ ...prev, [currentField]: imageSrc }))
              setIsCameraOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </Form>
  )
}

function DocumentUpload({
  field,
  image,
  onCapture,
  onFileUpload,
}: {
  field: string
  image?: string
  onCapture: (field: string) => void
  onFileUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCapture(field)}
      >
        <Camera className="w-4 h-4 mr-2" />
        Tomar Foto
      </Button>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="relative"
        >
          <Upload className="w-4 h-4 mr-2" />
          Subir Archivo
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept="image/*"
            onChange={(e) => onFileUpload(field, e)}
          />
        </Button>
      </div>
      {image && (
        <Card className="mt-2">
          <CardContent className="p-2">
            <Image 
              src={image} 
              alt="Documento" 
              width={200} 
              height={200} 
              className="max-h-32 object-contain" 
            />
          </CardContent>
        </Card>
      )}
    </>
  )
}

