// app\registration-status\RegistroForm.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserCircle, ArrowRight, RefreshCw, CheckCircle, Calendar } from "lucide-react"
import { createRegistrationToken, getRegistrationData, setLocalStorageData } from "@/services/registrationTokenService"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// Definir interfaces para los tipos de datos
interface RegistrationStatus {
  current_step: string
  last_completed_step: string
  steps?: Record<string, boolean>
}

interface UserData {
  id: string | number
  email: string
  name: string
  lastName: string
  documentType: string
  documentNumber: string
}

export default function RegistrationStatusForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [lastStep, setLastStep] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const [showNewRegistrationDialog, setShowNewRegistrationDialog] = useState(false)
  const [isResettingRegistration, setIsResettingRegistration] = useState(false)

  // Obtener el estado del registro y los datos del usuario cuando el componente se monta
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Obtener los datos del token
        const tokenData = await getRegistrationData()
        if (!tokenData || !tokenData.registration_id) {
          throw new Error("No se encontró información del registro")
        }

        const id = tokenData.registration_id
        setRegistrationId(id)

        // Obtener el estado del registro
        const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/register/${id}/status`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!statusResponse.ok) {
          throw new Error("Error al obtener el estado del registro")
        }

        const statusData = (await statusResponse.json()) as RegistrationStatus
        console.log("Estado del registro:", statusData)

        // Si current_step es "/" o no existe, establecerlo a "/email" que es el primer paso real
        setCurrentStep(statusData.current_step && statusData.current_step !== "/" ? statusData.current_step : "/email")
        setLastStep(statusData.last_completed_step || "/")

        // Obtener los datos del usuario
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/register/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!userResponse.ok) {
          throw new Error("Error al obtener la información del usuario")
        }

        const userDataResponse = (await userResponse.json()) as UserData
        console.log("Datos del usuario:", userDataResponse)
        setUserData(userDataResponse)
      } catch (error) {
        console.error("Error al obtener datos:", error)
        setError("No se pudo obtener la información del registro")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleContinueRegistration = async () => {
    if (!registrationId) return

    setIsLoading(true)
    setError(null)

    try {
      if (!currentStep) {
        setError("No se encontró la información necesaria para continuar")
        return
      }

      // Asegurarse de que currentStep no sea "/"
      const stepToUse = currentStep === "/" ? "/email" : currentStep

      // Si el paso es /email, necesitamos reenviar el código de verificación
      if (stepToUse === "/email" && userData) {
        // Reenviar el código de verificación
        const resendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/resend-code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            registration_id: registrationId,
          }),
        })

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json()
          throw new Error(errorData.message || "Error al reenviar el código de verificación")
        }
      }

      // Crear token con el paso actual
      const token = await createRegistrationToken(registrationId, stepToUse)
      console.log("Token creado:", token)
      console.log("Redirigiendo a:", stepToUse)

      // Si el paso es /email, necesitamos incluir el correo en la URL
      if (stepToUse === "/email" && userData) {
        // Redirigir a la página de email con el correo como parámetro
        window.location.href = `${stepToUse}?email=${encodeURIComponent(userData.email)}`
        return
      }

      // Para otros pasos, redirigir normalmente
      window.location.href = stepToUse
    } catch (error) {
      console.error("Error al continuar el registro:", error)
      setError("Hubo un problema al continuar con el registro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewRegistration = () => {
    setShowNewRegistrationDialog(true)
  }

  const confirmNewRegistration = async () => {
    if (!registrationId || !userData) return

    setIsResettingRegistration(true)

    try {
      // Llamar al endpoint para resetear el registro
      const resetResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/register/${registrationId}/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          documentNumber: userData.documentNumber,
        }),
      })

      if (!resetResponse.ok) {
        const errorData = await resetResponse.json()
        throw new Error(errorData.message || "Error al reiniciar el registro")
      }

      const responseData = await resetResponse.json()

      // Eliminar el token de registro actual de las cookies
      document.cookie = "registrationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure"

      // Crear un nuevo token para la página de email y guardarlo en las cookies
      const token = await createRegistrationToken(responseData.registration_id, "/email")

      // Guardar el token en localStorage también para asegurar que esté disponible
      setLocalStorageData(responseData.registration_id, "/email")

      console.log("Nuevo token creado:", token)
      console.log("ID de registro:", responseData.registration_id)

      // Añadir el registration_id como parámetro en la URL
      const emailUrl = `/email?email=${encodeURIComponent(userData.email)}&registration_id=${responseData.registration_id}&bypass=true&timestamp=${Date.now()}`
      console.log("Redirigiendo a:", emailUrl)

      // Pequeña pausa para asegurar que las cookies se guarden correctamente
      setTimeout(() => {
        window.location.replace(emailUrl)
      }, 100)
    } catch (error) {
      console.error("Error al reiniciar el registro:", error)
      setError("Hubo un problema al iniciar un nuevo registro. Por favor, intente nuevamente.")
      setShowNewRegistrationDialog(false)
    } finally {
      setIsResettingRegistration(false)
    }
  }

  // Mostrar pantalla de carga mientras se obtiene el estado
  if (isLoading && !currentStep) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-100">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="max-w-md w-full p-8 border-none shadow-xl">
            <div className="text-center">
              <RefreshCw className="w-16 h-16 animate-spin mx-auto text-[#f34739] mb-6" />
              <h1 className="text-2xl font-bold mb-4">Cargando información</h1>
              <p className="text-gray-600">Estamos obteniendo el estado de tu registro...</p>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Si no hay ID de registro o paso actual después de cargar, mostrar error
  if (!isLoading && (!registrationId || !currentStep)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-100">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
              <p className="text-gray-600 mb-6">No se encontró la información necesaria para continuar el registro</p>
              <Button onClick={() => router.push("/")} className="w-full bg-red-500 hover:bg-red-600">
                Volver al inicio
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Formatear el nombre para mostrar
  const displayName = userData ? `${userData.name} ${userData.lastName}` : ""

  // Determinar el nombre del paso actual para mostrar
  const getStepName = (step: string) => {
    const stepNames: Record<string, string> = {
      "/email": "Verificación de correo",
      "/acercaNegocio": "Información del negocio",
      "/ubicar-local": "Ubicación del local",
      "/datosClaves": "Datos clave",
      "/datosBancarios": "Datos bancarios",
      "/cuenta-bancaria": "Cuenta bancaria",
      "/firmar-contrato": "Firma de contrato",
      "/verificacion-documentos": "Verificación de documentos",
    }
    return stepNames[step] || step
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full backdrop-blur-lg border-none shadow-2xl p-8 relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f34739]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f34739]/10 rounded-full blur-3xl" />

          <div className="flex flex-col items-center text-center space-y-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-[#f34739] to-[#ff6b61] rounded-full flex items-center justify-center shadow-lg shadow-[#f34739]/20">
              <UserCircle className="w-14 h-14 text-white" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-800">
                {displayName ? `¡Bienvenido nuevamente, ${displayName.split(" ")[0]}!` : "¡Bienvenido nuevamente!"}
              </h1>
              <p className="text-gray-600 text-lg">Notamos que ya tienes un registro en proceso</p>

              {currentStep && currentStep !== "/" && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-[#f34739]" />
                    <h3 className="font-medium text-gray-700">Próximo paso:</h3>
                  </div>
                  <p className="text-[#f34739] font-semibold text-lg">{getStepName(currentStep)}</p>
                </div>
              )}

              {lastStep && lastStep !== "/" && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-medium text-gray-700">Último paso completado:</h3>
                  </div>
                  <p className="text-green-600 font-semibold">{getStepName(lastStep)}</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 mt-4">
                  <p className="text-sm text-red-600">{error}</p>
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
              variant="outline"
              className="w-full h-12 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-lg transition-all duration-300"
              onClick={handleNewRegistration}
              disabled={isLoading}
            >
              Empezar otro registro
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
                  <span className="text-sm font-medium">{userData.documentNumber}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modal de confirmación para nuevo registro */}
      <Dialog open={showNewRegistrationDialog} onOpenChange={setShowNewRegistrationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Iniciar un nuevo registro?</DialogTitle>
            <DialogDescription>
              Ya tienes un registro en proceso. Si inicias uno nuevo, se eliminarán todos los datos ingresados hasta
              ahora y tendrás que volver a verificar tu correo electrónico.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Se mantendrán tus datos básicos (nombre, documento, correo), pero se eliminarán todos los demás datos
              ingresados en el proceso de registro.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewRegistrationDialog(false)}
              className="sm:w-auto w-full"
              disabled={isResettingRegistration}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmNewRegistration}
              className="bg-[#f34739] hover:bg-[#d33729] sm:w-auto w-full"
              disabled={isResettingRegistration}
            >
              {isResettingRegistration ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Iniciar nuevo registro"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

