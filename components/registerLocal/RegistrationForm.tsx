// components\registerLocal\RegistrationForm.tsx 
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react"
import { EmailAlert } from "./email-alert"
import { DocumentAlert } from "./document-alert"
import { ValidationAlert } from "@/components/ValidationAlert"
import { createRegistrationToken } from "@/services/registrationTokenService"
import type { FormData, BusinessType } from "./types"
import { useFormHandlers } from "./useFormHandlers"
import { FormFields } from "./FormFields"
import { EmailChangeAlert } from "./email-change-alert"

export default function RegistrationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    documentType: "DNI",
    documentNumber: "",
    name: "",
    lastName: "",
    businessType: "",
    phone: "+51",
    email: "",
    posToDriver: 0,
    entrega_documento_venta: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [isFieldsLocked, setIsFieldsLocked] = useState(false)
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [originalEmail, setOriginalEmail] = useState<string | null>(null)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false)

  const { handleInputChange, handlePhoneChange } = useFormHandlers(
    formData,
    setFormData,
    setIsFieldsLocked,
    setError,
    setIsLoading,
  )

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/tipos-negocio`)
        const data = await response.json()
        setBusinessTypes(data)
      } catch (error) {
        console.error("Error fetching business types:", error)
        setError("Error al cargar los tipos de negocio")
      }
    }

    fetchBusinessTypes()
  }, [])

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos requeridos del primer paso
    if (
      !formData.documentNumber ||
      !formData.name ||
      !formData.lastName ||
      !formData.businessType ||
      !formData.phone ||
      !formData.email
    ) {
      setError("Todos los campos son obligatorios")
      return
    }

    setCurrentStep(2)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formDataToSend = new FormData()

      // Agregar campos básicos
      formDataToSend.append("documentType", formData.documentType)
      formDataToSend.append("documentNumber", formData.documentNumber)
      formDataToSend.append("name", formData.name)
      formDataToSend.append("lastName", formData.lastName)
      formDataToSend.append("businessType", formData.businessType)
      formDataToSend.append("phone", formData.phone.replace(/\D/g, ""))
      formDataToSend.append("email", formData.email)
      formDataToSend.append("posToDriver", formData.posToDriver.toString())
      formDataToSend.append("entrega_documento_venta", formData.entrega_documento_venta.toString())

      // Agregar documentos si es Carnet de Extranjería
      if (formData.documentType === "CARNET_EXTRANJERIA") {
        if (!formData.antecedentesPenales || !formData.antecedentesPoliciales) {
          setError("Debe subir ambos documentos")
          setIsLoading(false)
          return
        }

        formDataToSend.append("antecedentesPenales", formData.antecedentesPenales)
        formDataToSend.append("antecedentesPoliciales", formData.antecedentesPoliciales)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/register`, {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok && data.error !== "different_email") {
        handleRegistrationError(data.error, data.message)
        return
      }

      // Manejar el caso de correo diferente
      if (data.error === "different_email") {
        setOriginalEmail(data.original_email)
        setRegistrationId(data.registration_id)
        setShowEmailChangeModal(true)
        setIsLoading(false)
        return
      }

      if (data.error === "incomplete_registration") {
        router.push(`/registration-status?registration_id=${data.registration_id}`)
        return
      }

      if (data.registration_id) {
        await createRegistrationToken(data.registration_id.toString(), "/email")
        router.push(`/email?email=${encodeURIComponent(formData.email)}`)
      } else {
        setError("No se recibió un ID de registro válido del servidor.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Hubo un problema al registrar el negocio. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = async (useNewEmail: boolean) => {
    if (!registrationId) return

    setIsLoading(true)
    setShowEmailChangeModal(false)

    try {
      if (useNewEmail) {
        // Actualizar el correo en el registro existente
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/register/${registrationId}/update-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.message || "Error al actualizar el correo electrónico")
          setOriginalEmail(null)
          return
        }
      }

      // Redirigir a la página de estado de registro
      router.push(`/registration-status?registration_id=${registrationId}`)
    } catch (error) {
      console.error("Error al procesar el cambio de correo:", error)
      setError("Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
      setOriginalEmail(null)
    }
  }

  const handleRegistrationError = (error: string, message: string) => {
    if (error === "dni_registered") {
      setError("dni_registered")
    } else if (error === "duplicate_in_reparto") {
      setError(message)
    } else if (
      error?.toLowerCase().includes("email") ||
      error?.toLowerCase().includes("correo") ||
      error?.toLowerCase().includes("duplicado")
    ) {
      setError("email_taken")
    } else {
      setError("Hubo un problema al registrar el negocio. Por favor, intente nuevamente.")
    }
  }

  const isMultiStep = formData.documentType === "CARNET_EXTRANJERIA"
  const isFirstStep = currentStep === 1
  const showNextButton = isMultiStep && isFirstStep
  const showSubmitButton = !isMultiStep || currentStep === 2

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">¡Registra tu local ahora!</h2>

      {/* Modal de cambio de correo */}
      {originalEmail && (
        <EmailChangeAlert
          originalEmail={originalEmail}
          isOpen={showEmailChangeModal}
          onConfirm={() => handleEmailChange(true)}
          onCancel={() => handleEmailChange(false)}
        />
      )}

      <form
        onSubmit={showNextButton ? handleNext : handleSubmit}
      className="space-y-4 sm:space-y-6"
      >
        <FormFields
          formData={formData}
          setFormData={setFormData}
          businessTypes={businessTypes}
          isFieldsLocked={isFieldsLocked}
          handleInputChange={handleInputChange}
          handlePhoneChange={handlePhoneChange}
          currentStep={currentStep}
        />

        {error &&
          (error === "email_taken" ? (
            <EmailAlert onClose={() => setError(null)} />
          ) : error === "dni_registered" ? (
            <DocumentAlert onClose={() => setError(null)} />
          ) : error.includes("registrado como repartidor") ? (
            <ValidationAlert message={error} onClose={() => setError(null)} />
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          ))}

        <div className="space-y-3">
          {showSubmitButton && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-red-500 text-white font-semibold 
                       focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 
                       hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 
                       transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Procesando...</span>
                </>
              ) : (
                "Registrar Negocio"
              )}
            </button>
          )}

          {showNextButton && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-blue-500 text-white font-semibold 
                       focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 
                       hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 
                       transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <span>Continuar</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          )}

          {isMultiStep && currentStep === 2 && (
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold 
                       hover:bg-gray-50 transition-colors duration-200 
                       flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}