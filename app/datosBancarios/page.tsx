'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { CircleHelp, Loader2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import Persona from "@/public/img/person.jpg"
import { useToast } from "../../hooks/use-toast"
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";


// Definición de la interfaz para la dirección del establecimiento
interface EstablecimientoDireccion {
  calle: string
  numero: string
  codigo_postal: string
  provincia: string
  ciudad: string
  referencia: string | null
  direccion_completa: string
}

export default function DatosBancarios() {
  useBodyScrollLock()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentStep] = useState(4)
  const totalSteps = 6
  const [establecimientoDireccion, setEstablecimientoDireccion] = useState<EstablecimientoDireccion | null>(null)
  const [formData, setFormData] = useState({
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    accountType: '',
    documentNumber: '',
    cci: '',
    useBusinessAddress: true
  })
  const [isFormValid, setIsFormValid] = useState(false)

  // Efecto para validar el formulario
  useEffect(() => {
    const isValid = Object.values(formData).every(value => 
      typeof value === 'boolean' ? true : value.trim() !== ''
    )
    setIsFormValid(isValid)
  }, [formData])

  // Función para obtener la dirección del establecimiento, ahora envuelta en useCallback
  const fetchEstablecimientoDireccion = useCallback(async () => {
    try {
      setIsLoading(true)
      const establecimientoId = 1 // Reemplazar con el ID real de tu estado de la aplicación
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/establecimiento/${establecimientoId}/direccion`)
      
      if (!response.ok) {
        throw new Error('Error al obtener la dirección del establecimiento')
      }

      const data = await response.json()
      if (data && data.direccion) {
        setEstablecimientoDireccion(data.direccion)
      } else {
        throw new Error('No se encontró la dirección del establecimiento')
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo obtener la dirección del establecimiento",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast]) // Agregamos toast como dependencia

  // Efecto para obtener la dirección del establecimiento cuando se usa la dirección del negocio
  useEffect(() => {
    if (formData.useBusinessAddress) {
      fetchEstablecimientoDireccion()
    }
  }, [formData.useBusinessAddress, fetchEstablecimientoDireccion])

  // Manejador para cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  // Manejador para cambios en los selects
  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  // Manejador para cambios en el checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, useBusinessAddress: checked }))
  }

  // Función para manejar el envío del formulario
  const handleNext = async () => {
    if (!isFormValid) return

    setIsSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/datos-bancarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titular_cuenta: formData.accountHolder,
          numero_cuenta: formData.accountNumber,
          nombre_banco: formData.bankName,
          tipo_cuenta: formData.accountType,
          documento_titular: formData.documentNumber,
          codigo_cci: formData.cci,
          usar_direccion_negocio: formData.useBusinessAddress,
          establecimiento_id: 1 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.mensaje || 'Error al guardar los datos bancarios')
      }

      const result = await response.json()
      console.log(result)
      toast({
        title: "Éxito",
        description: "Los datos bancarios se han guardado correctamente"
      })
      
      // Redirigir a la siguiente página después de un breve retraso
      setTimeout(() => {
        router.push('/planes')
      }, 1000)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error al guardar los datos bancarios",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Función para manejar el botón de retroceso
  const handleBack = () => {
    router.back()
  }

  return (
    <section className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="grid lg:grid-cols-2">
        <div className="relative hidden h-full min-h-[600px] lg:block">
          <Image
            alt="Business person working on a laptop"
            className="absolute inset-0 h-full w-full object-cover"
            height={1080}
            src={Persona}
            style={{
              aspectRatio: "16/9",
              objectFit: "cover",
            }}
            width={1920}
          />
        </div>
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Datos Bancarios</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[60vh]">
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">
                      Titular de Cuenta bancaria <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="accountHolder"
                        placeholder="titular"
                        required
                        value={formData.accountHolder}
                        onChange={handleInputChange}
                        className="pr-10"
                        disabled={isLoading || isSaving}
                      />
                      <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">
                      Número de cuenta bancaria <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="accountNumber"
                        required
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className="pr-10"
                        disabled={isLoading || isSaving}
                      />
                      <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">
                      Nombre del banco <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange('bankName', value)}
                      disabled={isLoading || isSaving}
                    >
                      <SelectTrigger id="bankName">
                        <SelectValue placeholder="Seleccionar banco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bcp">BCP</SelectItem>
                        <SelectItem value="bbva">BBVA</SelectItem>
                        <SelectItem value="interbank">Interbank</SelectItem>
                        <SelectItem value="scotiabank">Scotiabank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType">
                      Tipo de Cuenta Bancaria <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange('accountType', value)}
                      disabled={isLoading || isSaving}
                    >
                      <SelectTrigger id="accountType">
                        <SelectValue placeholder="Seleccionar tipo de cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Cuenta de Ahorros</SelectItem>
                        <SelectItem value="checking">Cuenta Corriente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">
                      Documento del titular (RUC) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="documentNumber"
                        required
                        value={formData.documentNumber}
                        onChange={handleInputChange}
                        className="pr-10"
                        disabled={isLoading || isSaving}
                      />
                      <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cci">
                      Código de Cuenta Interbancaria (CCI) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="cci"
                        required
                        value={formData.cci}
                        onChange={handleInputChange}
                        className="pr-10"
                        disabled={isLoading || isSaving}
                      />
                      <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 pt-4">
                    <Checkbox
                      id="useBusinessAddress"
                      checked={formData.useBusinessAddress}
                      onCheckedChange={handleCheckboxChange}
                      disabled={isLoading || isSaving}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="useBusinessAddress"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Mi dirección de facturación es la misma que la dirección del negocio
                      </label>
                      {formData.useBusinessAddress && establecimientoDireccion && (
                        <p className="text-sm text-muted-foreground">
                          {establecimientoDireccion.direccion_completa}
                        </p>
                      )}
                      {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cargando dirección...
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isFormValid || isLoading || isSaving}
      />
    </section>
  )
}