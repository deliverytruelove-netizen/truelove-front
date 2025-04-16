"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormularioEntrega } from "./components/FormularioEntrega"
import Lok from "@/public/img/lok.jpg"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getRepartoData } from "@/services/repartoTokenService"

export default function EntregaMaterial() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  // Eliminamos el estado registroId ya que no se está utilizando y el componente hijo
  // ya maneja su propio estado para esto

  useEffect(() => {
    async function verificarAcceso() {
      try {
        // Intentar obtener el ID de registro de sessionStorage
        const id = sessionStorage.getItem("repartoRegistroId")

        if (id) {
          console.log("ID de registro encontrado en sessionStorage:", id)
          // Ya no necesitamos setRegistroId
          setIsLoading(false)
          return
        }

        // Si no hay ID en sessionStorage, intentar obtenerlo del token
        const data = await getRepartoData()

        if (data && data.registration_id) {
          console.log("ID de registro recuperado del token:", data.registration_id)
          sessionStorage.setItem("repartoRegistroId", data.registration_id)
          // Ya no necesitamos setRegistroId

          // También actualizar el paso actual en sessionStorage
          sessionStorage.setItem("repartoCurrentStep", "/reparto/entrega-material")
          setIsLoading(false)
          return
        }

        // Si no se pudo obtener el ID, redirigir al inicio
        console.error("No se pudo obtener el ID de registro")
        router.push("/reparto")
      } catch (error) {
        console.error("Error al verificar acceso:", error)
        router.push("/reparto")
      }
    }

    verificarAcceso()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar>
        <div className="flex items-center gap-2 md:gap-4">
          <Button asChild variant="ghost" className="text-xs md:text-sm">
            <Link href="/">¿Tienes preguntas?</Link>
          </Button>
          <Button asChild variant="default" className="bg-[#f34739] text-white hover:bg-[#d63c30] text-xs md:text-sm">
            <Link href="/">Guardar y salir</Link>
          </Button>
        </div>
      </Navbar>

      <div className="flex flex-col md:flex-row flex-1">
        <div className="hidden md:block w-full md:w-1/2 h-48 md:h-auto relative">
          <Image
            src={Lok || "/placeholder.svg"}
            alt="Entrega de material"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        <div className="w-full md:w-1/2 bg-white">
          <ScrollArea className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
            <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6 md:space-y-8">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Entrega del material publicitario</h1>
                <p className="text-sm md:text-base text-gray-500 mt-2">
                  Por favor, selecciona la fecha y hora que mejor se ajuste a tu disponibilidad para la entrega del
                  material.
                </p>
              </div>

              <FormularioEntrega />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
