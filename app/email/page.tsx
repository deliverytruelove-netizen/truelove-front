"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import emailIcon from "@/public/img/gmail.png"
import EmailImage from "@/public/img/emailsended.jpg"
import EmailEnviado from "@/public/img/data.svg"
import { getRegistrationToken, updateRegistrationStep, getRegistrationData } from "@/services/registrationTokenService"

// Interfaz para las props de la notificación mejorada
interface ImprovedNotificationProps {
  message: string
  duration?: number
}

// Componente de notificación mejorada
function ImprovedNotification({ message, duration = 3000 }: ImprovedNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          className="justify-center content-center bg-green-500 text-white -top-5 rounded-md p-2 gap-2 mt-2 shadow-lg flex"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Componente principal de verificación de email
function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const bypass = searchParams.get("bypass")
  const timestamp = searchParams.get("timestamp")
  const urlRegistrationId = searchParams.get("registration_id")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)

  // Efecto para inicialización y limpieza
  useEffect(() => {
    const checkToken = async () => {
      // Si tiene el parámetro registration_id en la URL, usarlo directamente
      if (urlRegistrationId) {
        console.log("Usando registration_id de la URL:", urlRegistrationId)
        setRegistrationId(urlRegistrationId)
        return
      }

      // Si tiene el parámetro bypass, permitir acceso sin verificar el token
      if (bypass === "true") {
        console.log("Acceso permitido con bypass")

        // Intentar obtener datos del registro
        const data = await getRegistrationData()
        if (data && data.registration_id) {
          console.log("Datos de registro encontrados:", data)
          setRegistrationId(data.registration_id)
        } else {
          console.error("No se encontraron datos de registro con bypass")
        }
        return
      }

      const data = await getRegistrationData()
      if (!data || data.current_step !== "/email" || !email) {
        router.push("/")
        return
      }

      if (data.registration_id) {
        setRegistrationId(data.registration_id)
      }
    }

    checkToken()

    // Prevención de navegación hacia atrás
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      window.history.pushState(null, "", window.location.href)
    }

    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", handlePopState)

    // Temporizador de cuenta regresiva para reenvío de código
    let countdownTimer: NodeJS.Timeout
    if (resendCooldown > 0) {
      countdownTimer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1))
      }, 1000)
    }

    // Función de limpieza
    return () => {
      window.removeEventListener("popstate", handlePopState)
      if (countdownTimer) clearInterval(countdownTimer)
    }
  }, [email, router, resendCooldown, bypass, timestamp, urlRegistrationId])

  // Función para manejar la verificación del código
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Usar el ID de registro del estado o intentar obtenerlo de nuevo
      const regId = registrationId || urlRegistrationId || (await getRegistrationData())?.registration_id

      if (!regId) {
        throw new Error("Datos de registro no encontrados")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getRegistrationToken()}`,
        },
        body: JSON.stringify({
          email,
          code: verificationCode.trim(),
          registration_id: regId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar el código")
      }

      setIsVerified(true)

      // Actualizar el paso del registro
      await updateRegistrationStep("/acercaNegocio")

      setTimeout(() => {
        router.push("/acercaNegocio")
      }, 3000)
    } catch (error) {
      console.error("Verification error:", error)
      setError(error instanceof Error ? error.message : "Error al verificar el código. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar el reenvío del código
  const handleResendCode = async () => {
    if (!email || isLoading || resendCooldown > 0) return

    setIsLoading(true)
    setError("")

    try {
      // Usar el ID de registro del estado o intentar obtenerlo de nuevo
      const regId = registrationId || urlRegistrationId || (await getRegistrationData())?.registration_id

      if (!regId) {
        throw new Error("Datos de registro no encontrados")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/resend-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getRegistrationToken()}`,
        },
        body: JSON.stringify({
          email,
          registration_id: regId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al reenviar el código")
      }

      setResendCooldown(60)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    } catch (error) {
      console.error("Resend error:", error)
      setError(error instanceof Error ? error.message : "Error al reenviar el código")
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {!isVerified && (
        <Image
          src={EmailImage || "/placeholder.svg"}
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="z-0"
        />
      )}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 z-10"
      >
        <div className="flex flex-col items-center">
          {!isVerified && (
            <div className="mb-6">
              <Image src={emailIcon || "/placeholder.svg"} alt="Email Icon" width={50} height={50} />
            </div>
          )}

          {isVerified ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Image
                src={EmailEnviado || "/placeholder.svg"}
                alt="Email Enviado"
                width={60}
                height={60}
                className="mx-auto mb-4"
              />
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Verificación exitosa!</h2>
              <p className="text-gray-600">Serás redirigido en unos segundos...</p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                Te enviamos un correo electrónico de verificación
              </h2>

              <p className="text-gray-600 text-center mb-6">
                Te enviamos un correo electrónico a la dirección <span className="font-bold">{email}</span>
              </p>

              <form onSubmit={handleVerification} className="w-full space-y-4">
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#f34739] focus:border-[#f34739]"
                    placeholder="Ingrese el código de 6 dígitos"
                    required
                    disabled={isLoading}
                    maxLength={6}
                    autoComplete="off"
                  />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-[#f34739] text-white hover:bg-[#d63c30] flex items-center justify-center"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar"
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-500 mt-4">
                ¿No has recibido el correo?
                <Button
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isLoading}
                  className="ml-2 text-red-600 hover:text-red-800 bg-white hover:bg-white"
                >
                  {resendCooldown > 0 ? `${resendCooldown}s` : "Reenviar código"}
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
      {showNotification && <ImprovedNotification message="Se ha reenviado el código a su correo" />}
    </div>
  )
}

export default function VerifyEmailPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  )
}

