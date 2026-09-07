// components\registerLocal\RegistrationForm.tsx 
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { EmailAlert } from "./email-alert"
import { DocumentAlert } from "./document-alert"
import { ValidationAlert } from "@/components/ValidationAlert"
import { createRegistrationToken, startNewRegistration } from "@/services/registrationTokenService"
import type { FormData, BusinessType } from "./types"
import { useFormHandlers } from "./useFormHandlers"
import { FormFields } from "./FormFields"
import { EmailChangeAlert } from "./email-change-alert"

export default function RegistrationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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
    omitir_pago_adelantado: false,
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
    // Limpiar datos anteriores al montar el componente
    startNewRegistration()
    
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
      // Si es RUC, el apellido va vacío porque se usa razón social en el campo name
      formDataToSend.append("lastName", formData.documentType === "RUC" ? "" : formData.lastName)
      formDataToSend.append("businessType", formData.businessType)
      
      // Limpiar el teléfono: eliminar caracteres no numéricos y el prefijo 51 si existe
      let cleanPhone = formData.phone.replace(/\D/g, "")
      if (cleanPhone.startsWith("51") && cleanPhone.length === 11) {
        cleanPhone = cleanPhone.substring(2) // Eliminar el prefijo "51"
      }
      formDataToSend.append("phone", cleanPhone)
      
      formDataToSend.append("email", formData.email)
      formDataToSend.append("posToDriver", formData.posToDriver.toString())
      formDataToSend.append("entrega_documento_venta", formData.entrega_documento_venta.toString())
      formDataToSend.append("omitir_pago_adelantado", formData.omitir_pago_adelantado ? "1" : "0")

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
        // Guardar teléfono para usarlo en acercaNegocio
        localStorage.setItem("registrationPhone", formData.phone)
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

  return (
    <div className="w-full bg-white/95 backdrop-blur-xl p-6 sm:p-7 rounded-2xl shadow-2xl border border-white/40">
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 rounded-full bg-[#D9043D]/10 text-[#D9043D] text-xs font-bold uppercase tracking-wider mb-2">
          Comienza Hoy
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">¡Registra tu local ahora!</h2>
        <p className="text-xs text-slate-500 mt-1">Completa los datos en menos de 2 minutos</p>
      </div>

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
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
      >
        <FormFields
          formData={formData}
          setFormData={setFormData}
          businessTypes={businessTypes}
          isFieldsLocked={isFieldsLocked}
          handleInputChange={handleInputChange}
          handlePhoneChange={handlePhoneChange}
        />

        {error &&
          (error === "email_taken" ? (
            <EmailAlert onClose={() => setError(null)} />
          ) : error === "dni_registered" ? (
            <DocumentAlert onClose={() => setError(null)} />
          ) : error.includes("registrado como repartidor") ? (
            <ValidationAlert message={error} onClose={() => setError(null)} />
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          ))}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#D9043D] via-[#e21b50] to-[#b8032f] hover:from-[#c20336] hover:to-[#9c0228] text-white font-bold text-base
                     shadow-lg shadow-[#D9043D]/25 hover:shadow-xl hover:shadow-[#D9043D]/35
                     disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none
                     transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Procesando solicitud...</span>
              </>
            ) : (
              "Registrar Negocio"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}