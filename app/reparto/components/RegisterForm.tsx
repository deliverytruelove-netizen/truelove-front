"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ArrowLeft, Loader2, Camera, Upload } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { fetchDocumentInfo } from '@/utils/api'
import { useToast } from "@/hooks/use-toast"
import WebcamModal from './WebcamModal'
import { useMediaQuery } from '../hooks/use-media-query'
import { compressImage } from '@/utils/comprimir-imagen'

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
}

export default function RegistrationForm() {
  const [step, setStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCameraOpen, setIsCameraOpen] = React.useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    departamento: "",
    vehiculo: "",
    tipoDocumento: "",
    nroDocumento: "",
    nombres: "",
    apellidos: "",
    celular: "",
    email: "",
    mayorEdad: "",
    aceptaPolitica: false,
    documentoImagen: null as string | null
  })

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const updateFormData = (field: string, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else handleSubmit()
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Split the form data into chunks if necessary
      const formDataToSend = {
        ...formData,
        departamento: formData.departamento,
        vehiculo: formData.vehiculo,
        tipo_documento: formData.tipoDocumento,
        nro_documento: formData.nroDocumento,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        celular: formData.celular,
        email: formData.email,
        mayor_edad: formData.mayorEdad === 'si',
        acepta_politica: formData.aceptaPolitica,
        documento_imagen: formData.documentoImagen,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      toast({
        title: "Registro exitoso",
        description: "Tus datos han sido guardados correctamente.",
      
      })

      console.log(data)
      router.push('/reparto/zonas')
    } catch (error) {
      console.error('Error details:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentChange = async (value: string) => {
    const numbersOnly = value.replace(/\D/g, '')
    updateFormData("nroDocumento", numbersOnly)

    if ((formData.tipoDocumento === 'DNI' && numbersOnly.length === 8) || 
        (formData.tipoDocumento === 'RUC' && numbersOnly.length === 11)) {
      setIsLoading(true)
      try {
        const data = await fetchDocumentInfo(
          formData.tipoDocumento.toLowerCase() as 'dni' | 'ruc', 
          numbersOnly
        )
        
        if ('nombres' in data) {
          updateFormData("nombres", data.nombres)
          updateFormData("apellidos", `${data.apellidoPaterno} ${data.apellidoMaterno}`.trim())
        } else if ('razonSocial' in data) {
          updateFormData("nombres", data.razonSocial)
          updateFormData("apellidos", "")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al consultar el documento",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;
          const compressedImage = await compressImage(base64Image);
          updateFormData("documentoImagen", compressedImage);
        } catch (error) {
          toast({
            title: "Error",
            description: `Error al procesar la imagen. Por favor, intenta con otra imagen.${error}` ,
            variant: "destructive"
          });
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    setIsCameraOpen(true)
  }

  const isStepComplete = () => {
    switch(step) {
      case 1: return !!formData.departamento
      case 2: return !!formData.vehiculo
      case 3: return formData.tipoDocumento && formData.nroDocumento && formData.nombres && 
               (formData.tipoDocumento === 'RUC' || formData.apellidos) && formData.celular && 
               formData.email && formData.mayorEdad && formData.aceptaPolitica &&
               (formData.tipoDocumento === 'RUC' || formData.documentoImagen)
      default: return false
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Crea tu perfil</h2>
            <p className="text-gray-500 mt-1">Es rápido y sencillo. ¡Comencemos!</p>
          </div>

          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1",
                  step === i ? "bg-red-600 text-white" : 
                  step > i ? "bg-red-400 text-white" : 
                  "bg-gray-100 text-gray-400"
                )}>
                  {i}
                </div>
                <div className="text-xs text-gray-400">
                  {i === 1 ? "Ciudad" : i === 2 ? "Vehículo" : "Datos"}
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {step === 1 && (
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-gray-900">
                    Selecciona tu ciudad
                  </Label>
                  <Select 
                    value={formData.departamento} 
                    onValueChange={(value) => updateFormData("departamento", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elige ciudad/zona de reparto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AREQUIPA">AREQUIPA</SelectItem>
                      <SelectItem value="HUACHO">HUACHO</SelectItem>
                      <SelectItem value="LIMA">LIMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-gray-900">
                    Selecciona tu vehículo
                  </Label>
                  <Select 
                    value={formData.vehiculo} 
                    onValueChange={(value) => updateFormData("vehiculo", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elige tu vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOTO">MOTO</SelectItem>
                      <SelectItem value="BICICLETA">BICICLETA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tipoDocumento">Tipo de documento</Label>
                    <Select 
                      value={formData.tipoDocumento} 
                      onValueChange={(value) => {
                        updateFormData("tipoDocumento", value)
                        updateFormData("nroDocumento", "")
                        updateFormData("nombres", "")
                        updateFormData("apellidos", "")
                        updateFormData("documentoImagen", null)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Elige tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="RUC">RUC</SelectItem>
                        <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nroDocumento">Número de documento</Label>
                    <div className="relative">
                      <Input
                        id="nroDocumento"
                        value={formData.nroDocumento}
                        onChange={(e) => handleDocumentChange(e.target.value)}
                        required
                        maxLength={formData.tipoDocumento === 'RUC' ? 11 : 8}
                        className={isLoading ? "pr-10" : ""}
                        disabled={isLoading}
                      />
                      {isLoading && (
                        <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {(formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE') && (
                    <div>
                      <Label>Imagen del documento</Label>
                      <div className="flex space-x-2 mt-2">
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                          <Upload className="mr-2 h-4 w-4" /> Subir imagen
                        </Button>
                        {isMobile && (
                          <Button onClick={handleCameraCapture} variant="outline">
                            <Camera className="mr-2 h-4 w-4" /> Usar cámara
                          </Button>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      {formData.documentoImagen && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600 mb-2">Imagen cargada</p>
                          <Image src={formData.documentoImagen} alt="Documento" width={200} height={150} className="rounded-md" />
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="nombres">{formData.tipoDocumento === 'RUC' ? 'Razón Social' : 'Nombres'}</Label>
                    <Input
                      id="nombres"
                      value={formData.nombres}
                      onChange={(e) => updateFormData("nombres", e.target.value)}
                      required
                      readOnly={formData.tipoDocumento !== 'CE'}
                    />
                  </div>

                  {formData.tipoDocumento !== 'RUC' && (
                    <div>
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <Input
                        id="apellidos"
                        value={formData.apellidos}
                        onChange={(e) => updateFormData("apellidos", e.target.value)}
                        required
                        readOnly={formData.tipoDocumento !== 'CE'}
                      />
                    </div>
                  )}

                  <div>
                    <Label>¿Tienes más de 18 años?</Label>
                    <RadioGroup
                      value={formData.mayorEdad}
                      onValueChange={(value) => updateFormData("mayorEdad", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="si" id="si" />
                        <Label htmlFor="si">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Código</Label>
                      <Select defaultValue="+51">
                        <SelectTrigger>
                          <SelectValue placeholder="+51" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+51">+51</SelectItem>
                          <SelectItem value="+54">+54</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="celular">Número de celular</Label>
                      <Input
                        id="celular"
                        type="tel"
                        value={formData.celular}
                        onChange={(e) => updateFormData("celular", e.target.value)}
                        required
                        maxLength={9}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="politica"
                      checked={formData.aceptaPolitica}
                      onCheckedChange={(checked: boolean) => updateFormData("aceptaPolitica", checked)}
                    />
                    <Label htmlFor="politica" className="text-sm text-gray-500">
                      Estoy de acuerdo con la política de privacidad y acepto ser contactado por canales de terceros.
                    </Label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <Button
            onClick={handleNext}
            disabled={!isStepComplete() || isLoading}
            className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {step === 3 ? "Enviar" : "Siguiente"}
                <ChevronRight className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      <WebcamModal 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(imageSrc) => updateFormData("documentoImagen", imageSrc)}
      />
    </div>
  )
}

