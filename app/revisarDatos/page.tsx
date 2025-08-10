"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import Navbar from "@/components/ui/navbar"
import StepNavigation from "@/components/ui/StepNavigation"
import { DatosSeccion } from "./components/DatosSeccion"
import { useReviewData } from "./hooks/vista-datos"
import { useToast } from "@/hooks/use-toast"
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock"
import DeliveryImage from "@/public/img/revisaDtos.jpg"
import { updateRegistrationStep, getRegistrationData } from "@/services/registrationTokenService"

function ReviewDataContent() {
  useBodyScrollLock()
  const router = useRouter()
  const { toast } = useToast()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data, loading, error, fetchData } = useReviewData()
  const currentStep = 6
  const totalSteps = 8

  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      try {
        const registrationData = await getRegistrationData()

        if (
          !registrationData ||
          (registrationData.current_step !== "/revisarDatos" && registrationData.current_step !== "/planes")
        ) {
          toast({
            title: "Error",
            description: "Por favor complete los pasos anteriores",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        if (registrationData.current_step === "/planes") {
          await updateRegistrationStep("/revisarDatos")
        }

        fetchData()
      } catch (error) {
        console.error("Error al verificar token:", error)
        toast({
          title: "Error",
          description: "Error al verificar los datos de registro",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    checkTokenAndFetchData()
  }, [fetchData, router, toast])

  const handleEdit = (section: string) => {
    const routes = {
      business: "/acercaNegocio",
      address: "/ubicar-local",
      legal: "/datosClaves",
      bank: "/datosBancarios",
      commercial: "/planes",
    }

    const route = routes[section as keyof typeof routes]
    if (route) {
      router.push(route)
    }
  }

  const handleNext = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones para continuar",
        variant: "destructive",
      })
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      await updateRegistrationStep("/firmar-contrato")
      router.push("/firmar-contrato")
    } catch (error) {
      console.error("Error en handleNext:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la revisión",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = async () => {
    try {
      await updateRegistrationStep("/planes")
      router.push("/planes")
    } catch (error) {
      console.error("Error al volver hacia atrás:", error)
      toast({
        title: "Error",
        description: "Error al volver hacia atrás",
        variant: "destructive",
      })
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
            <Button onClick={() => window.location.reload()} className="w-full max-w-[200px]">
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
          <Button onClick={() => window.location.reload()} className="mt-4">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh bg-white overflow-hidden">
      {/* Navbar fijo */}
      <div className="flex-shrink-0 bg-white">
        <Navbar />
      </div>

      {/* Contenido principal con flex-grow */}
      <div className="flex flex-grow overflow-hidden">
        {/* Imagen fija en desktop */}
        <div className="hidden md:block w-1/2 relative bg-muted flex-shrink-0">
          <div className="absolute inset-0">
            <Image
              src={DeliveryImage}
              alt="Delivery service illustration"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
        </div>

        {/* Área del formulario con scroll interno */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8 pb-32">
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Revisa tus datos
                </h1>
                <p className="text-muted-foreground">
                  Por favor verifica que la información sea correcta antes de continuar.
                </p>
              </div>

              <div className="space-y-6">
                <DatosSeccion
                  title="Datos del negocio"
                  onEdit={() => handleEdit("business")}
                  data={data.datos_negocio}
                />
                <DatosSeccion
                  title="Dirección del Negocio"
                  onEdit={() => handleEdit("address")}
                  data={data.direccion_negocio}
                />
                <DatosSeccion 
                  title="Datos legales" 
                  onEdit={() => handleEdit("legal")} 
                  data={data.datos_legales} 
                />
                <DatosSeccion 
                  title="Datos bancarios" 
                  onEdit={() => handleEdit("bank")} 
                  data={data.datos_bancarios} 
                />

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Relación comercial</h3>
                    <Button
                      variant="link"
                      className="text-pink-600 hover:text-pink-700 font-medium"
                      onClick={() => handleEdit("commercial")}
                    >
                      Cambiar
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">Logistica + Pelican Admin (Shop)</p>
                    <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg border">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                        Para finalizar el registro, te pedimos que leas y aceptes los{" "}
                        <a href="#" className="text-pink-600 hover:text-pink-700 underline font-medium">
                          términos y condiciones
                        </a>{" "}
                        con los que trabajaremos juntos.
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* StepNavigation fijo */}
      <div className="flex-shrink-0 border-t">
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onBack={handleBack}
          isNextDisabled={!acceptedTerms || isSubmitting}
        />
      </div>
    </div>
  )
}

export default function ReviewData() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <ReviewDataContent />
    </Suspense>
  )
}