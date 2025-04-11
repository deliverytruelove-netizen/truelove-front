// app\datosClaves\page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { SkipForward, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import StepNavigation from "@/components/ui/StepNavigation"
import Persona from "@/public/img/person.jpg"
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
      <div className="grid lg:grid-cols-2">
        <div className="relative hidden h-full min-h-[600px] lg:block">
          <Image
            alt="Persona de negocios trabajando en una laptop"
            className="absolute inset-0 h-full w-full object-cover"
            height={1080}
            src={Persona || "/placeholder.svg"}
            style={{
              aspectRatio: "16/9",
              objectFit: "cover",
            }}
            width={1920}
          />
        </div>
        <div className="flex flex-col items-center justify-center p-6 lg:p-8 relative">
          {/* Botón de omitir fuera del formulario */}
          <div className="absolute top-8 right-8 flex flex-col items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <SkipForward className="h-4 w-4" />
              <span>Omitir</span>
            </Button>
            <p className="text-xs text-gray-400 mt-1 max-w-[150px] text-right">
              Puede omitir este paso y completarlo más tarde
            </p>
          </div>

          <FormularioDatosClave
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isSaving={isSaving}
          />

          {/* Texto informativo fuera del formulario */}
          <div className="mt-4 flex items-start gap-2 max-w-md text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p>
              Puede ingresar algunos datos clave de su negocio en este paso. Esta información nos ayudará a personalizar
              su experiencia, pero puede completarla más adelante si lo prefiere.
            </p>
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
