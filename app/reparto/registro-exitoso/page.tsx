// app\reparto\registro-exitoso\page.tsx
"use client"

import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { CheckCircle } from "lucide-react"
import { createRepartoToken } from "@/services/repartoTokenService"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function RegistroExitoso() {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [registroId, setRegistroId] = useState<string | null>(null)

  useEffect(() => {
    // Obtener el ID de registro de sessionStorage
    const id = sessionStorage.getItem("repartoRegistroId")
    if (id) {
      setRegistroId(id)
      console.log("ID de registro encontrado:", id)
    } else {
      console.error("No se encontró el ID de registro en sessionStorage")
    }
  }, [])

  const handleContinue = async () => {
    try {
      setIsUpdating(true)

      // SOLUCIÓN: Crear un nuevo token directamente en lugar de actualizar
      if (registroId) {
        console.log("Creando nuevo token para avanzar a entrega-material")
        const newToken = await createRepartoToken(registroId, "/reparto/entrega-material")

        if (newToken) {
          console.log("Token creado correctamente para entrega-material")

          // Asegurar que el paso actual se actualice en sessionStorage
          sessionStorage.setItem("repartoCurrentStep", "/reparto/entrega-material")

          // Asegurar que el ID de registro se mantenga
          sessionStorage.setItem("repartoRegistroId", registroId)

          // Añadir un pequeño retraso para asegurar que todo se guarde
          setTimeout(() => {
            // Usar un enfoque diferente para la redirección
            window.location.href = "/reparto/entrega-material"
          }, 300)
        } else {
          console.error("Error al crear el token")
          router.push("/reparto/entrega-material")
        }
      } else {
        console.error("No se encontró ID de registro")
        router.push("/reparto/entrega-material")
      }
    } catch (error) {
      console.error("Error al crear el token:", error)
      // Intentar redirección directa en caso de error
      router.push("/reparto/entrega-material")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar>
        <div className="flex items-center gap-2 md:gap-4"></div>
      </Navbar>

      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-20 h-20 text-[#f34739]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">¡Felicitaciones!</h1>
            <p className="text-gray-500">
              Has completado exitosamente el registro de tu vehículo. Ahora estás un paso más cerca de formar parte de
              nuestro equipo.
            </p>
            <div className="pt-4">
              <Button
                onClick={handleContinue}
                className="bg-[#f34739] hover:bg-[#d63c30] text-white"
                disabled={isUpdating}
              >
                {isUpdating ? "Procesando..." : "Continuar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
