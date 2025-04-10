// app\reparto\status\RepartoStatusForm.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserCircle, ArrowRight, RefreshCw, CheckCircle, Calendar, AlertTriangle } from "lucide-react"
import { createRepartoToken, removeRepartoToken } from "@/services/repartoTokenService"
import { motion } from "framer-motion"

// Interfaz para las props del componente
interface RepartoStatusFormProps {
  initialRegistrationId?: string
}

export default function RepartoStatusForm({ initialRegistrationId }: RepartoStatusFormProps) {
  // Hooks para manejo de rutas y parámetros
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Obtener ID de registro de las props o URL
  const registrationId = initialRegistrationId || searchParams.get("registration_id")

  // Estados para manejar la interfaz y datos
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [lastStep, setLastStep] = useState<string | null>(null)
  interface UserData {
    nombres: string;
    email: string;
    nro_documento: string;
  }

  const [userData, setUserData] = useState<UserData | null>(null)
  const [isStartingNew, setIsStartingNew] = useState(false)

  // Efecto para cargar los datos del registro
  useEffect(() => {
    const fetchRegistrationData = async () => {
      if (!registrationId) {
        setIsLoading(false)
        setError("No se encontró ID de registro")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // 1. Obtener los datos del usuario
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/${registrationId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!userResponse.ok) {
          throw new Error("Error al obtener datos del usuario")
        }

        const userDataResponse = await userResponse.json()
        setUserData(userDataResponse)

        // 2. Obtener el estado actual del registro
        const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/${registrationId}/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!statusResponse.ok) {
          throw new Error("Error al obtener el estado del registro")
        }

        const statusData = await statusResponse.json()
        setCurrentStep(statusData.current_step || "/reparto/zonas")
        setLastStep(statusData.last_completed_step || "/reparto")
      } catch (error) {
        console.error("Error al obtener datos del registro:", error)
        setError("No se pudo obtener la información del registro")
      } finally {
        setIsLoading(false)
      }
    }

    if (registrationId) {
      fetchRegistrationData()
    } else {
      setIsLoading(false)
      setError("No se encontró ID de registro")
    }
  }, [registrationId])

  // Función para continuar con el registro
  const handleContinueRegistration = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!registrationId || !currentStep) {
        setError("No se encontró la información necesaria para continuar")
        return
      }

      // Guardar ID en sessionStorage para uso posterior
      sessionStorage.setItem("repartoRegistroId", registrationId)

      // Crear nuevo token con el paso actual
      await createRepartoToken(registrationId, currentStep)

      // Redirigir al siguiente paso
      router.push(currentStep)
    } catch (error) {
      console.error("Error al continuar el registro:", error)
      setError("Hubo un problema al continuar con el registro")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para iniciar un nuevo registro
  const handleNewRegistration = async () => {
    setIsStartingNew(true)
    try {
      // Eliminar token actual
      removeRepartoToken()

      // Notificar al backend del abandono del registro actual
      if (registrationId) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/${registrationId}/abandon`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }).catch((err) => console.log("Error al notificar abandono, continuando:", err))
        } catch (error) {
          console.error("Error al notificar abandono de registro:", error)
        }
      }

      // Redirigir al inicio del registro
      router.push("/reparto")
    } catch (error) {
      console.error("Error al iniciar nuevo registro:", error)
      setError("Hubo un problema al iniciar un nuevo registro")
    } finally {
      setIsStartingNew(false)
    }
  }

  // Función para obtener el nombre del paso actual
  const getStepName = (step: string) => {
    const stepNames: Record<string, string> = {
      "/reparto/zonas": "Datos Personales",
      "/reparto/documentos": "Datos Bancarios",
      "/reparto/documento-motorizado": "Documentos de Motorizado",
      "/reparto/entrega-material": "Entrega de material",
      "/reparto/confirmacion-entrega": "Confirmación de entrega",
    }
    return stepNames[step] || step
  }

  // Formatear nombre para mostrar
  const displayName = userData?.nombres || ""

  // Renderizar pantalla de carga
  if (isLoading) {
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

  // Mostrar error si no hay datos de usuario
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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

  // Renderizar interfaz principal
  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#ffff] rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#ffff] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full backdrop-blur-lg border-0 shadow-2xl p-8 relative overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#f34739] to-[#ff6b61] rounded-full flex items-center justify-center shadow-lg shadow-[#f34739]/20">
              <UserCircle className="w-14 h-14 text-white" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold">
                {displayName ? `¡Bienvenido nuevamente, ${displayName.split(" ")[0]}!` : "¡Bienvenido nuevamente!"}
              </h1>
              <p className="text-gray-700 text-lg">Notamos que ya tienes un registro en proceso</p>

              {currentStep && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-[#f34739]" />
                    <h3 className="font-medium text-gray-700">Próximo paso:</h3>
                  </div>
                  <p className="text-[#f34739] font-semibold text-lg">{getStepName(currentStep)}</p>
                </div>
              )}

              {lastStep && lastStep !== "/reparto" && (
                <div className="mt-4 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-medium text-gray-700">Último paso completado:</h3>
                  </div>
                  <p className="text-green-600 font-semibold">{getStepName(lastStep)}</p>
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

          {userData && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Correo electrónico:</span>
                  <span className="text-sm font-medium">{userData.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Documento:</span>
                  <span className="text-sm font-medium">{userData.nro_documento}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}