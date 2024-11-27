'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Camera, Upload } from 'lucide-react'
import { CameraCapture } from "./CapturarCamara"
import Image from 'next/image'
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
  licensePlate: z.string().min(6, "La placa debe tener al menos 6 caracteres"),
  driverLicense: z.string().min(8, "El número de licencia debe tener al menos 8 caracteres"),
  insurance: z.string().min(8, "El número de seguro debe tener al menos 8 caracteres"),
  propertyCard: z.string().min(8, "El número de tarjeta debe tener al menos 8 caracteres"),
})

export function VehicleRegistrationForm() {
  const [images, setImages] = useState<{ [key: string]: string }>({})
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [currentField, setCurrentField] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: "",
      driverLicense: "",
      insurance: "",
      propertyCard: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    console.log(images)
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="licensePlate"
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
                  field="licensePlate"
                  image={images.licensePlate}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="driverLicense"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Licencia de Conducir</FormLabel>
              <FormControl>
                <Input placeholder="Número de licencia" {...field} />
              </FormControl>
              <FormDescription>
                Ingrese el número de su licencia de conducir
              </FormDescription>
              <FormMessage />
              <div className="flex gap-2 mt-2">
                <DocumentUpload
                  field="driverLicense"
                  image={images.driverLicense}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="insurance"
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
                  field="insurance"
                  image={images.insurance}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="propertyCard"
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
                  field="propertyCard"
                  image={images.propertyCard}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-red-500 hover:bg-red-600">Guardar Información</Button>
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
            <Image src={image} alt="Documento" className="max-h-32 object-contain" />
          </CardContent>
        </Card>
      )}
    </>
  )
}

