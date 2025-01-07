'use client'

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import Persona from "@/public/img/person.jpg"
import { useToast } from "@/hooks/use-toast"
import { getRegistrationToken, updateRegistrationStep, getRegistrationData } from '@/services/registrationTokenService'

export default function DatosClaveNegocio() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    ruc: '',
    razonSocial: '',
  })

  const isFormValid = formData.ruc.trim() !== '' && formData.razonSocial.trim() !== ''

  useEffect(() => {
    const checkToken = async () => {
      const data = await getRegistrationData();
      if (!data || data.current_step !== '/datosClaves') {
        toast({
          title: "Error",
          description: "Por favor complete los pasos anteriores",
          variant: "destructive",
        });
        router.push('/');
      }
    };

    checkToken();
  }, [router, toast]);

  const fetchRucData = async (ruc: string) => {
    if (ruc.length !== 11) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://dniruc.apisperu.com/api/v1/ruc/${ruc}?token=${process.env.NEXT_PUBLIC_API_TOKEN}`
      )
      
      if (!response.ok) {
        throw new Error('Error al consultar el RUC')
      }

      const data = await response.json()
      
      if (data.razonSocial) {
        setFormData(prev => ({
          ...prev,
          razonSocial: data.razonSocial
        }))
      } else {
        toast({
          title: "RUC no encontrado",
          description: "No se encontró información para el RUC ingresado",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al consultar el RUC",
        variant: "destructive"
      })
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))

    if (id === 'ruc' && value.length === 11) {
      await fetchRucData(value)
    }
  }

  const handleNext = async () => {
    if (!isFormValid) return

    setIsSaving(true)
    try {
      const registrationData = await getRegistrationData();
      if (!registrationData) {
        throw new Error('Datos de registro no encontrados');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/datos-clave-negocio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${getRegistrationToken()}`
        },
        body: JSON.stringify({
          ruc: formData.ruc,
          razon_social: formData.razonSocial,
          business_registration_id: registrationData.registration_id
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al guardar los datos')
      }

      // Actualizar el paso del registro
      await updateRegistrationStep('/datosBancarios');

      toast({
        title: "Éxito",
        description: "Los datos se han guardado correctamente"
      })
      
      router.push('/datosBancarios')
    } catch (error: unknown) {
      console.error('Error completo:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <section className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="grid lg:grid-cols-2">
        <div className="relative hidden h-full min-h-[600px] lg:block">
          <Image
            alt="Persona de negocios trabajando en una laptop"
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
              <CardTitle className="text-2xl font-bold">Algunos datos clave</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                handleNext()
              }}>
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC</Label>
                  <div className="relative">
                    <Input 
                      id="ruc" 
                      placeholder="Ingrese su RUC" 
                      required 
                      type="text"
                      maxLength={11}
                      value={formData.ruc}
                      onChange={handleInputChange}
                      className={isLoading ? "pr-10" : ""}
                      disabled={isLoading || isSaving}
                    />
                    {isLoading && (
                      <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input 
                    id="razonSocial" 
                    placeholder="Ingrese su Razón Social" 
                    required 
                    type="text"
                    value={formData.razonSocial}
                    onChange={handleInputChange}
                    readOnly={isLoading}
                    disabled={isLoading || isSaving}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <StepNavigation
        currentStep={4}
        totalSteps={6}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isFormValid || isLoading || isSaving}
      />
    </section>
  )
}

