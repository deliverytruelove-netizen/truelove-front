"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserCircle, ArrowRight, RefreshCw } from "lucide-react"
import { createRepartoToken, removeRepartoToken } from "@/services/repartoTokenService"

export default function RepartoStatusForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registrationId = searchParams.get("registration_id")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [lastStep, setLastStep] = useState<string | null>(null)
  const [isStartingNew, setIsStartingNew] = useState(false)

  // Obtener el estado del registro cuando el componente se monta
  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      if (!registrationId) return

      setIsLoading(true)
      setError(null)

      try {
        // Llamada directa a la API sin pasar por el middleware
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/${registrationId}/status`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Error al obtener el estado del registro")
        }

        const data = await response.json()
        console.log("Estado del registro:", data)

        setCurrentStep(data.current_step || "/reparto/zonas")
        setLastStep(data.last_completed_step || "/reparto")
      } catch (error) {
        console.error("Error al obtener el estado del registro:", error)
        setError("No se pudo obtener la información del registro")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegistrationStatus()
  }, [registrationId])

  const handleContinueRegistration = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!registrationId || !currentStep) {
        setError("No se encontró la información necesaria para continuar")
        return
      }

      // Guardar el ID en sessionStorage para usarlo en las siguientes páginas
      sessionStorage.setItem("repartoRegistroId", registrationId)

      // Crear token con el paso actual
      const token = await createRepartoToken(registrationId, currentStep)
      console.log("Token creado:", token)
      console.log("Redirigiendo a:", currentStep)

      // Asegurarse de que la redirección ocurra después de que el token se haya guardado
      setTimeout(() => {
        router.push(currentStep)
      }, 100)
    } catch (error) {
      console.error("Error al continuar el registro:", error)
      setError("Hubo un problema al continuar con el registro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewRegistration = async () => {
    setIsStartingNew(true)
    try {
      // Eliminar el token de registro actual
      removeRepartoToken()

      // Opcional: Notificar al backend que el usuario está iniciando un nuevo registro
      if (registrationId) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/${registrationId}/abandon`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
        } catch (error) {
          // No bloqueamos el flujo si esta llamada falla
          console.error("Error al notificar abandono de registro:", error)
        }
      }

      // Redirigir al usuario a la página principal de registro
      router.push("/reparto")
    } catch (error) {
      console.error("Error al iniciar nuevo registro:", error)
      setError("Hubo un problema al iniciar un nuevo registro")
    } finally {
      setIsStartingNew(false)
    }
  }

  // Mostrar pantalla de carga mientras se obtiene el estado
  if (isLoading && !currentStep) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-[#f34739] mb-4" />
            <h1 className="text-2xl font-bold mb-4">Cargando información</h1>
            <p className="text-gray-600">Estamos obteniendo el estado de tu registro...</p>
          </div>
        </Card>
      </div>
    )
  }

  // Si no hay ID de registro o paso actual después de cargar, mostrar error
  if (!isLoading && (!registrationId || !currentStep)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">No se encontró la información necesaria para continuar el registro</p>
            <Button onClick={() => router.push("/reparto")} className="w-full bg-red-500 hover:bg-red-600">
              Volver al inicio
            </Button>
          </div>
        </Card>
      </div>
    )
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
            <UserCircle className="w-14 h-14 text-white" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold">¡Bienvenido nuevamente!</h1>
            <p className="text-gray-700 text-lg">Notamos que ya tienes un registro en proceso</p>
            {lastStep && lastStep !== "/reparto" && (
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
            disabled={isLoading || isStartingNew}
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
            className="w-full h-12 border-2 shadow-md bg-slate-200 border-white/10 hover:bg-white/5 font-medium text-lg transition-all duration-300 flex items-center justify-center gap-2"
            onClick={handleNewRegistration}
            disabled={isLoading || isStartingNew}
          >
            {isStartingNew ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              "Empezar otro registro"
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

