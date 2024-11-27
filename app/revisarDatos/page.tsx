'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle } from 'lucide-react'
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import { DatosSeccion } from './components/DatosSeccion'
import { useReviewData } from './hooks/vista-datos'
import { useToast } from "@/hooks/use-toast"
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock"
import DeliveryImage from "@/public/img/negocio.jpg"

export default function ReviewData() {
  useBodyScrollLock()
  const router = useRouter()
  const { toast } = useToast()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data, loading, error, fetchData } = useReviewData()
  const currentStep = 6
  const totalSteps = 7

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const negocioId = searchParams.get('negocioId')
    const establecimientoId = searchParams.get('establecimientoId')
    const datosClaveId = searchParams.get('datosClaveId')
    const datosBancariosId = searchParams.get('datosBancariosId')

    if (!negocioId || !establecimientoId || !datosClaveId || !datosBancariosId) {
      return
    }

    fetchData(negocioId, establecimientoId, datosClaveId, datosBancariosId)
  }, [fetchData])

  const handleEdit = (section: string) => {
    const searchParams = new URLSearchParams(window.location.search)
    const negocioId = searchParams.get('negocioId')
    const establecimientoId = searchParams.get('establecimientoId')

    if (!negocioId || !establecimientoId) {
      toast({
        title: "Error",
        description: "No se pueden editar los datos sin los identificadores necesarios",
        variant: "destructive"
      })
      return
    }

    const routes = {
      business: '/datos-negocio',
      address: '/direccion-negocio',
      legal: '/datos-legales',
      bank: '/datos-bancarios',
      commercial: '/relacion-comercial'
    }
    
    const route = routes[section as keyof typeof routes]
    if (route) {
      const queryParams = new URLSearchParams({
        negocioId,
        establecimientoId,
        edit: 'true'
      })
      
      router.push(`${route}?${queryParams.toString()}`)
    }
  }

  const handleNext = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones para continuar",
        variant: "destructive"
      })
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      router.push('/firmar-contrato')
    } catch (error) {
      console.error('Error en handleNext:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al guardar la revisión',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4 text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-sm text-muted-foreground text-center">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full max-w-[200px]"
            >
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No se encontraron datos</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="grid lg:grid-cols-2">
        <div className="relative hidden h-full min-h-[600px] lg:block">
          <Image
            alt="Delivery service illustration"
            src={DeliveryImage}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Revisa tus datos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Por favor verifica que la información sea correcta.
              </p>
            </CardHeader>
            <ScrollArea className="h-[60vh]">
              <CardContent className="space-y-6">
                <DatosSeccion
                  title="Datos del negocio"
                  onEdit={() => handleEdit('business')}
                  data={data.datos_negocio}
                />
                <DatosSeccion
                  title="Dirección del Negocio"
                  onEdit={() => handleEdit('address')}
                  data={data.direccion_negocio}
                />
                <DatosSeccion
                  title="Datos legales"
                  onEdit={() => handleEdit('legal')}
                  data={data.datos_legales}
                />
                <DatosSeccion
                  title="Datos bancarios"
                  onEdit={() => handleEdit('bank')}
                  data={data.datos_bancarios}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Relación comercial</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('commercial')}
                    >
                      Cambiar
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Logistica + Pelican Admin (Shop)</p>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        Para finalizar el registro, te pedimos que leas y aceptes los{' '}
                        <a href="#" className="text-pink-600 hover:text-pink-700 underline">
                          términos y condiciones
                        </a>
                        {' '}con los que trabajaremos juntos.
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        isNextDisabled={!acceptedTerms || isSubmitting}
      />
    </section>
  )
}

