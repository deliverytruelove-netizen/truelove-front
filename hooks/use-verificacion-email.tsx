// hooks\use-verificacion-email.tsx este es del paso de verificación del email
"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getRegistrationToken, updateRegistrationStep, getRegistrationData, clearAllRegistrationData } from "@/services/registrationTokenService"

export function useVerificacionEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const bypass = searchParams.get("bypass")
  const urlRegistrationId = searchParams.get("registration_id")

  const [codigoVerificacion, setCodigoVerificacion] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const [verificado, setVerificado] = useState(false)
  const [tiempoReenvio, setTiempoReenvio] = useState(0)
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)

  // Función para ocultar la notificación
  const ocultarNotificacion = useCallback(() => {
    setMostrarNotificacion(false)
  }, [])

  // Efecto para inicialización y limpieza
  useEffect(() => {
    const verificarToken = async () => {
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
        // Limpiar datos antes de redirigir
        clearAllRegistrationData()
        router.push("/")
        return
      }

      if (data.registration_id) {
        setRegistrationId(data.registration_id)
      }
    }

    verificarToken()

    // Prevención de navegación hacia atrás
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      window.history.pushState(null, "", window.location.href)
    }

    if (typeof window !== 'undefined') {
      window.history.pushState(null, "", window.location.href)
      window.addEventListener("popstate", handlePopState)
    }

    // Temporizador de cuenta regresiva para reenvío de código
    let temporizador: NodeJS.Timeout
    if (tiempoReenvio > 0) {
      temporizador = setInterval(() => {
        setTiempoReenvio((prev) => Math.max(0, prev - 1))
      }, 1000)
    }

    // Función de limpieza
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("popstate", handlePopState)
      }
      if (temporizador) clearInterval(temporizador)
    }
  }, [email, router, tiempoReenvio, bypass, urlRegistrationId])

  // Función para manejar la verificación del código
  const manejarVerificacion = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
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
          code: codigoVerificacion.trim(),
          registration_id: regId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar el código")
      }

      setVerificado(true)

      // Actualizar el paso del registro
      await updateRegistrationStep("/acercaNegocio")

      setTimeout(() => {
        router.push("/acercaNegocio")
      }, 3000)
    } catch (error) {
      console.error("Error de verificación:", error)
      setError(error instanceof Error ? error.message : "Error al verificar el código. Por favor, intente nuevamente.")
    } finally {
      setCargando(false)
    }
  }

  // Función para manejar el reenvío del código
  const manejarReenvio = async () => {
    if (!email || cargando || tiempoReenvio > 0) return

    setCargando(true)
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

      setTiempoReenvio(60)
      setMostrarNotificacion(true)
    } catch (error) {
      console.error("Error de reenvío:", error)
      setError(error instanceof Error ? error.message : "Error al reenviar el código")
    } finally {
      setCargando(false)
    }
  }

  return {
    email,
    codigoVerificacion,
    setCodigoVerificacion,
    error,
    cargando,
    verificado,
    tiempoReenvio,
    mostrarNotificacion,
    ocultarNotificacion,
    manejarVerificacion,
    manejarReenvio,
  }
}