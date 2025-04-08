"use client"

import * as React from "react"
import { useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { WebcamModal } from "./WebcamModal"
import { useMediaQuery } from "../hooks/use-media-query"
import { VisualCaptcha } from "./VisualCapcha"
import { ValidationAlert } from "@/components/ValidationAlert"
import type { FormData, DocumentInfo } from "../types/form-types"
import { StepOne } from "./form-steps/StepOne"
import { StepTwo } from "./form-steps/StepTwo"
import { StepThree } from "./form-steps/StepThree"
import { fetchDocumentInfo } from "@/utils/api"
import { EstadoVerificacion } from "./EstadoVerificacion"
import { IndicadorPasos } from "./IndicadorPasos"

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
}

export default function RegisterForm() {
  const [step, setStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = React.useState(false)
  const [showCaptcha, setShowCaptcha] = React.useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>({
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
    documentoImagenFrente: null,
    documentoImagenReverso: null,
  })
  const [isCameraOpenFrente, setIsCameraOpenFrente] = React.useState(false)
  const [isCameraOpenReverso, setIsCameraOpenReverso] = React.useState(false)
  const [previewImageFrente, setPreviewImageFrente] = React.useState<string | null>(null)
  const [previewImageReverso, setPreviewImageReverso] = React.useState<string | null>(null)
  const [validationError, setValidationError] = React.useState<string | null>(null)

  const fileInputRefFrente = React.useRef<HTMLInputElement>(null)
  const fileInputRefReverso = React.useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Verificar si hay un registro existente al cargar el componente
  useEffect(() => {
    const checkExistingRegistration = async () => {
      const document = searchParams.get("document")
      const email = searchParams.get("email")

      if (document || email) {
        setIsCheckingStatus(true)
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/check-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nroDocumento: document,
              email: email,
            }),
          })

          if (!response.ok) {
            throw new Error("Error al verificar el estado del registro")
          }

          const data = await response.json()

          if (data.status === "incomplete" && data.registration_id) {
            router.push(`/reparto/status?registration_id=${data.registration_id}`)
            return
          }
        } catch (error) {
          console.error("Error al verificar registro existente:", error)
        } finally {
          setIsCheckingStatus(false)
        }
      }
    }

    checkExistingRegistration()
  }, [router, searchParams])

  const updateFormData = (field: keyof FormData, value: FormData[keyof FormData]): void => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNextStep = (): void => {
    if (step < 3) {
      setStep(step + 1)
    } else if (isStepComplete()) {
      setShowCaptcha(true)
    }
  }

  const handleCaptchaClose = useCallback(() => {
    setShowCaptcha(false)
  }, [])

  const handleBack = (): void => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setValidationError(null) // Clear any previous errors
    try {
      const requestData = {
        departamento: formData.departamento,
        vehiculo: formData.vehiculo,
        tipo_documento: formData.tipoDocumento,
        nro_documento: formData.nroDocumento,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        celular: formData.celular,
        email: formData.email,
        mayor_edad: formData.mayorEdad === "si",
        acepta_politica: formData.aceptaPolitica,
        documento_imagen_frente: formData.documentoImagenFrente?.split(",")[1] || null,
        documento_imagen_reverso: formData.documentoImagenReverso?.split(",")[1] || null,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 422 && data.errors?.duplicate) {
          setValidationError(data.errors.duplicate[0])
          return
        }

        // Si el registro está incompleto, redirigir a la página de estado
        if (data.status === "incomplete" && data.registration_id) {
          router.push(`/reparto/status?registration_id=${data.registration_id}`)
          return
        }

        throw new Error(data?.message || `Error ${response.status}: ${response.statusText}`)
      }

      // Si es un registro incompleto, redirigir a la página de estado
      if (data.status === "incomplete" && data.registration_id) {
        router.push(`/reparto/status?registration_id=${data.registration_id}`)
        return
      }

      // Si es un registro nuevo exitoso
      if (data.data && data.data.id) {
        sessionStorage.setItem("repartoRegistroId", data.data.id.toString())
        router.push("/reparto/zonas")
        return
      }

      // Si llegamos aquí, algo salió mal con la estructura de la respuesta
      console.error("Estructura de respuesta inesperada:", data)
      throw new Error("La respuesta del servidor no tiene el formato esperado")
    } catch (error) {
      console.error("Detalles del error:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [formData, router, toast])

  const handleCaptchaVerify = useCallback(
    async (success: boolean) => {
      if (success) {
        setShowCaptcha(false) // Primero cerramos el captcha
        await handleSubmit() // Luego ejecutamos el submit
      } else {
        toast({
          title: "Error de verificación",
          description: "Por favor, intenta la verificación nuevamente.",
          variant: "destructive",
        })
        setShowCaptcha(false)
      }
    },
    [handleSubmit, toast],
  )

  const handleDocumentChange = async (value: string): Promise<void> => {
    const numbersOnly = value.replace(/\D/g, "")
    updateFormData("nroDocumento", numbersOnly)

    if (
      (formData.tipoDocumento === "DNI" && numbersOnly.length === 8) ||
      (formData.tipoDocumento === "RUC" && numbersOnly.length === 11)
    ) {
      setIsLoading(true)
      try {
        const data = (await fetchDocumentInfo(
          formData.tipoDocumento.toLowerCase() as "dni" | "ruc",
          numbersOnly,
        )) as DocumentInfo

        if ("nombres" in data) {
          updateFormData("nombres", data.nombres || "")
          updateFormData("apellidos", `${data.apellidoPaterno || ""} ${data.apellidoMaterno || ""}`.trim())
        } else if ("razonSocial" in data) {
          updateFormData("nombres", data.razonSocial || "")
          updateFormData("apellidos", "")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al consultar el documento",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    side: "frente" | "reverso",
  ): Promise<void> => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result)
            } else {
              reject(new Error("Failed to read file as base64"))
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        if (side === "frente") {
          setPreviewImageFrente(base64)
          updateFormData("documentoImagenFrente", base64)
        } else {
          setPreviewImageReverso(base64)
          updateFormData("documentoImagenReverso", base64)
        }
      } catch (error) {
        console.error("Error al procesar la imagen:", error)
        toast({
          title: "Error",
          description: "No se pudo procesar la imagen",
          variant: "destructive",
        })
      }
    }
  }

  const handleCameraCapture = (imageData: { imageSrc: string; text: string }, side: "frente" | "reverso"): void => {
    if (side === "frente") {
      setPreviewImageFrente(imageData.imageSrc)
      updateFormData("documentoImagenFrente", imageData.imageSrc)
    } else {
      setPreviewImageReverso(imageData.imageSrc)
      updateFormData("documentoImagenReverso", imageData.imageSrc)
    }
    console.log(`OCR Text (${side}):`, imageData.text)
  }

  const isStepComplete = (): boolean => {
    switch (step) {
      case 1:
        return !!formData.departamento
      case 2:
        return !!formData.vehiculo
      case 3:
        return (
          formData.tipoDocumento !== "" &&
          formData.nroDocumento !== "" &&
          formData.nombres !== "" &&
          (formData.tipoDocumento === "RUC" || formData.apellidos !== "") &&
          formData.celular !== "" &&
          formData.email !== "" &&
          formData.mayorEdad !== "" &&
          formData.aceptaPolitica &&
          (formData.tipoDocumento === "RUC" ||
            (formData.documentoImagenFrente !== null && formData.documentoImagenReverso !== null))
        )
      default:
        return false
    }
  }

  if (isCheckingStatus) {
    return <EstadoVerificacion />
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
          {step > 1 && (
            <button onClick={handleBack} className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Crea tu perfil</h2>
            <p className="text-gray-500 mt-1">Es rápido y sencillo. ¡Comencemos!</p>
          </div>

          <IndicadorPasos pasoActual={step} />

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
                <StepOne
                  departamento={formData.departamento}
                  onDepartamentoChange={(value) => updateFormData("departamento", value)}
                />
              )}

              {step === 2 && (
                <StepTwo vehiculo={formData.vehiculo} onVehiculoChange={(value) => updateFormData("vehiculo", value)} />
              )}

              {step === 3 && (
                <StepThree
                  formData={formData}
                  updateFormData={updateFormData}
                  isLoading={isLoading}
                  handleDocumentChange={handleDocumentChange}
                  handleFileUpload={handleFileUpload}
                  previewImageFrente={previewImageFrente}
                  previewImageReverso={previewImageReverso}
                  fileInputRefFrente={fileInputRefFrente}
                  fileInputRefReverso={fileInputRefReverso}
                  isMobile={isMobile}
                  setIsCameraOpenFrente={setIsCameraOpenFrente}
                  setIsCameraOpenReverso={setIsCameraOpenReverso}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {validationError && <ValidationAlert message={validationError} onClose={() => setValidationError(null)} />}

          <Button
            onClick={handleNextStep}
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
        isOpen={isCameraOpenFrente}
        onClose={() => setIsCameraOpenFrente(false)}
        onCapture={(imageData) => handleCameraCapture(imageData, "frente")}
        title="Capturar frente del DNI"
      />
      <WebcamModal
        isOpen={isCameraOpenReverso}
        onClose={() => setIsCameraOpenReverso(false)}
        onCapture={(imageData) => handleCameraCapture(imageData, "reverso")}
        title="Capturar reverso del DNI"
      />
      <VisualCaptcha isOpen={showCaptcha} onVerify={handleCaptchaVerify} onClose={handleCaptchaClose} />
    </div>
  )
}

