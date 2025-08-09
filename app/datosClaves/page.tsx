// app\datosClaves\page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { SkipForward, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import StepNavigation from "@/components/ui/StepNavigation"
import Persona from "@/public/img/datosClaves.jpg"
import { useToast } from "@/hooks/use-toast"
import { updateRegistrationStep, getRegistrationData } from "@/services/registrationTokenService"
import { saveBusinessKeyData, fetchExistingBusinessData } from "./services/serviciosDatosNegocio"
import FormularioDatosClave from "./components/FormularioDatosClave"

export default function DatosClaveNegocio() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    ruc: "",
    razonSocial: "",
  })

  const isFormValid = formData.ruc.trim() !== "" && formData.razonSocial.trim() !== ""

  // Cargar datos existentes al iniciar
  useEffect(() => {
    const checkToken = async () => {
      const data = await getRegistrationData()
      if (!data || (data.current_step !== "/datosClaves" && data.current_step !== "/ubicar-local")) {
        toast({
          title: "Error",
          description: "Por favor complete los pasos anteriores",
          variant: "destructive",
        })
        router.push("/")
        return
      }
      if (data.registration_id) {
        const existingData = await fetchExistingBusinessData(data.registration_id)
        if (existingData) {
          setFormData({
            ruc: existingData.ruc || "",
            razonSocial: existingData.razon_social || "",
          })
        }
      }
    }

    checkToken()
  }, [router, toast])

  // Guardar datos y avanzar al siguiente paso
  const handleNext = async () => {
    if (!isFormValid) return

    setIsSaving(true)
    try {
      const registrationData = await getRegistrationData()
      if (!registrationData) {
        throw new Error("Datos de registro no encontrados")
      }

      await saveBusinessKeyData(registrationData.registration_id, formData.ruc, formData.razonSocial)

      // Actualizar el paso del registro
      await updateRegistrationStep("/datosBancarios")

      router.push("/datosBancarios")
    } catch (error: unknown) {
      console.error("Error completo:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Volver al paso anterior
  const handleBack = async () => {
    try {
      await updateRegistrationStep("/ubicar-local")
      router.push("/ubicar-local")
    } catch (error) {
      console.error("Error al navegar hacia atrás:", error)
      toast({
        title: "Error",
        description: "Error al navegar hacia atrás",
        variant: "destructive",
      })
    }
  }

  // Omitir este paso
  const handleSkip = async () => {
    try {
      await updateRegistrationStep("/datosBancarios")
      router.push("/datosBancarios")
    } catch (error) {
      console.error("Error al omitir paso:", error)
      toast({
        title: "Error",
        description: "Error al omitir este paso",
        variant: "destructive",
      })
    }
  }

  return (
    <section className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-140px)]">
        <div className="relative hidden h-full lg:block overflow-hidden">
          <Image
            alt="Persona de negocios trabajando en una laptop"
            className="absolute inset-0 h-full w-full object-cover"
            height={1080}
            src={Persona || "/placeholder.svg"}
            style={{
              objectFit: "cover",
            }}
            width={1920}
          />
        </div>
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 relative min-h-[calc(100vh-140px)]">
          {/* Botón de saltar paso mejorado */}
          <div className="flex flex-col items-end mb-4 lg:absolute lg:top-8 lg:right-8 lg:mb-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-100 rounded-full px-3 py-2 sm:px-4 transition-all shadow-sm text-sm"
            >
              <SkipForward className="h-4 w-4" />
              <span>Saltar este paso</span>
            </Button>
            <p className="text-xs text-gray-500 mt-2 max-w-[200px] sm:max-w-[180px] text-right lg:text-right ">
              Puede saltar este paso y completarlo más tarde
            </p>
          </div>

          {/* Contenedor principal del formulario */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <FormularioDatosClave
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              isSaving={isSaving}
            />

            {/* Texto informativo mejorado */}
            <div className="mt-6 flex items-start gap-3 w-full max-w-md text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p>
                Puede ingresar algunos datos clave de su negocio en este paso. Esta información nos ayudará a personalizar
                su experiencia, pero puede completarla más adelante si lo prefiere.
              </p>
            </div>
          </div>
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