// app\revisarDatos\hooks\vista-datos.ts
"use client"

import { useState, useCallback } from "react"
import type { ReviewData } from "../types/review-data"
import { useToast } from "@/hooks/use-toast"
import { getRegistrationToken } from "@/services/registrationTokenService"

export function useReviewData() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReviewData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const token = getRegistrationToken()
      if (!token) {
        throw new Error("No se encontró el token de registro")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/revisarDatos`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error de API:", errorData)

        // Si el error es por datos omitidos, mostrar un mensaje más amigable
        if (errorData.detalles) {
          let mensajeDetallado = "Faltan completar los siguientes datos:\n"

          if (errorData.detalles.datosClaveNegocio === "no encontrado") {
            mensajeDetallado += "- Datos clave del negocio\n"
          }

          if (errorData.detalles.datosBancarios === "no encontrado") {
            mensajeDetallado += "- Datos bancarios\n"
          }

          throw new Error(mensajeDetallado)
        } else {
          throw new Error(errorData.error || "Error al cargar los datos")
        }
      }

      const jsonData = await response.json()
      setData(jsonData)
      setError(null)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("No se pudieron cargar los datos. Por favor, intenta de nuevo.")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  return {
    data,
    loading,
    error,
    fetchData,
    setError,
    setLoading,
  }
}

