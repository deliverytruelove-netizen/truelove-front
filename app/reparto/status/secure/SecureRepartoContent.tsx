// app\reparto\status\secure\SecureRepartoContent.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { processEncodedToken } from "@/services/repartoTokenService"
import RepartoStatusForm from "../RepartoStatusForm"
import { Card } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export function SecureRepartoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const encodedToken = searchParams.get("t")

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registrationId, setRegistrationId] = useState<string | null>(null)

  // Efecto para procesar el token
  useEffect(() => {
    const validateAndSetToken = async () => {
      if (!encodedToken) {
        setError("Token no proporcionado")
        setTimeout(() => router.push("/reparto"), 3000)
        return
      }

      try {
        // Procesar el token codificado
        const tokenData = await processEncodedToken(encodedToken)

        if (!tokenData || !tokenData.registration_id) {
          setError("Token inválido o expirado")
          setTimeout(() => router.push("/reparto"), 3000)
          return
        }

        // Guardar el ID de registro
        setRegistrationId(tokenData.registration_id)

        // Verificar que podemos obtener los datos del registro
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/${tokenData.registration_id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) {
            throw new Error("No se pudo verificar el registro")
          }

          const userData = await response.json()
          console.log("Datos del registro verificados:", userData)

          // Si todo está bien, redirigir directamente al formulario de estado
          setIsLoading(false)
        } catch (verifyError) {
          console.error("Error al verificar el registro:", verifyError)
          setError("Error al verificar el registro")
          setTimeout(() => router.push("/reparto"), 3000)
        }
      } catch (error) {
        console.error("Error al validar el token:", error)
        setError("Error al procesar el token")
        setTimeout(() => router.push("/reparto"), 3000)
      }
    }

    validateAndSetToken()
  }, [encodedToken, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-100">
        <Card className="max-w-md w-full p-8 border-none shadow-xl">
          <div className="text-center">
            <RefreshCw className="w-16 h-16 animate-spin mx-auto text-[#f34739] mb-6" />
            <h1 className="text-2xl font-bold mb-4">Validando sesión</h1>
            <p className="text-gray-600">Estamos verificando tu información...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-100">
        <Card className="max-w-md w-full p-8 border-none shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-gray-500 text-sm">Redirigiendo al inicio...</p>
          </div>
        </Card>
      </div>
    )
  }

  // Si tenemos un ID de registro válido y no hay errores, mostrar el formulario
  if (registrationId) {
    return <RepartoStatusForm initialRegistrationId={registrationId} />
  }

  // Si no hay ID de registro ni error, redirigir al inicio
  router.push("/reparto")
  return null
}