"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserCircle, ArrowRight, RefreshCw } from "lucide-react"
import { createRegistrationToken } from "@/services/registrationTokenService"

export default function RegistrationStatusForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registrationId = searchParams.get("registration_id")
  const currentStep = searchParams.get("current_step") || "/email"
  const lastStep = searchParams.get("last_step")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinueRegistration = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!registrationId) {
        setError("No se encontró el ID de registro")
        return
      }

      const nextStep = currentStep.startsWith("/") ? currentStep : `/${currentStep}`
      await createRegistrationToken(registrationId, nextStep)
      router.push(nextStep)
    } catch (error) {
      console.error("Error continuing registration:", error)
      setError("Hubo un problema al continuar con el registro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewRegistration = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#ffff] rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#ffff] rounded-full blur-3xl" />
      </div>

      <Card className="max-w-md w-full backdrop-blur-lg border-0 shadow-2xl p-8 relative overflow-hidden">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#f34739] to-[#ff6b61] rounded-full flex items-center justify-center shadow-lg shadow-[#f34739]/20">
            <UserCircle className="w-14 h-14" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold">¡Bienvenido nuevamente!</h1>
            <p className="text-gray-700 text-lg">Notamos que ya tienes un registro en proceso</p>
            {lastStep && lastStep !== "/" && (
              <div className="mt-4 p-4 rounded-lg border border-white/10">
                <p className="text-sm text-gray-800">
                  Tu último paso completado fue: <span className="text-[#f34739] font-semibold">{lastStep}</span>
                </p>
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            className="w-full h-12 bg-[#f34739] hover:bg-[#d33729] text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 rounded-lg"
            onClick={handleContinueRegistration}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                Continuar registro
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full h-12 border-2 shadow-md bg-slate-200 border-white/10 hover:bg-white/5 font-medium text-lg transition-all duration-300"
            onClick={handleNewRegistration}
            disabled={isLoading}
          >
            Empezar otro registro
          </Button>
        </div>
      </Card>
    </div>
  )
}

