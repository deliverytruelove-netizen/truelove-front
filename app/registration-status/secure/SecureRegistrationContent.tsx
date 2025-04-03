// proteger ruta
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getRegistrationData } from "@/services/registrationTokenService"
import RegistrationStatusForm from "../RegistroForm"
import { Card } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export function SecureRegistrationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const encodedToken = searchParams.get("t")

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validateAndSetToken = async () => {
      if (!encodedToken) {
        setError("Token no proporcionado")
        setTimeout(() => router.push("/"), 3000)
        return
      }

      try {
        // Decodificar el token de la URL (está codificado en base64)
        const decodedToken = Buffer.from(encodedToken, "base64").toString()

        // Establecer el token en las cookies
        document.cookie = `registrationToken=${decodedToken}; path=/; max-age=3600; SameSite=Strict; Secure`

        // Obtener los datos del registro
        const data = await getRegistrationData()

        if (!data || !data.registration_id) {
          setError("Token inválido o expirado")
          setTimeout(() => router.push("/"), 3000)
          return
        }
      } catch (error) {
        console.error("Error al validar el token:", error)
        setError("Error al procesar el token")
        setTimeout(() => router.push("/"), 3000)
      } finally {
        setIsLoading(false)
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

  return <RegistrationStatusForm />
}

