"use client"

import { useState, useEffect } from "react"
// import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, Circle, CreditCard, Clock } from "lucide-react"
import { getRegistrationData, updateRegistrationStep } from "@/services/registrationTokenService"
import { useToast } from "@/hooks/use-toast"

export default function VerificacionDocumentosPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const data = await getRegistrationData()
        if (!data || !data.token || data.current_step !== "/verificacion-documentos") {
          toast({
            title: "Error",
            description: "Por favor complete los pasos anteriores",
            variant: "destructive",
          })
          router.push("/")
          return
        }
  
       // Verificar si el negocio está aprobado
       const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/negocios/${data.registration_id}/approval-status`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        },
      )
        if (!response.ok) {
          throw new Error("Error al verificar estado del negocio")
        }
  
        const businessData = await response.json()
  
        // Si el negocio está aprobado, actualizar el paso y redirigir
        if (businessData.aprobado) {
          await updateRegistrationStep("/socio-aprobado")
          router.push("/socio-aprobado")
          return
        }
  
        setLoading(false)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "Hubo un problema al verificar el estado de tu negocio",
          variant: "destructive",
        })
      }
    }
  
    // Verificar el estado cada 30 segundos
    checkRegistrationStatus()
    const interval = setInterval(checkRegistrationStatus, 30000)
  
    return () => clearInterval(interval)
  }, [router, toast])
  
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f34739] mx-auto"></div>
          <p className="mt-4 text-[#f34739]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-white">
      <Navbar/>
        {/* <Button
          asChild
          variant="default"
          className="bg-[#f34739] text-white hover:bg-[#d63c30] transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Link href="/">Guardar y salir</Link>
        </Button>
      </Navbar> */}

      <div className="flex flex-col md:flex-row flex-1">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center"
        >
          <div className="text-center space-y-6 max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto w-32 h-32 md:w-40 md:h-40 relative bg-red-50 rounded-full flex items-center justify-center"
            >
              <CreditCard className="w-20 h-20 text-[#f34739]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-[#f34739]"
            >
              Estamos verificando los documentos
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center space-x-2"
            >
              <Clock className="w-6 h-6 text-gray-600" />
              <p className="text-xl md:text-2xl font-semibold text-gray-600">Hasta 2 días hábiles</p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm md:text-base text-gray-600"
            >
              Te notificaremos por correo electrónico cuando hayamos terminado la verificación
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-blue-50 p-4 rounded-lg"
            >
              <p className="text-sm text-blue-700">
                Mientras tanto, puedes ir preparando tu logo, menú y horarios para el siguiente paso.
              </p>
            </motion.div>
          </div>
        </motion.div>

        <div className="w-full md:w-1/2 bg-white p-6 md:p-12 rounded-t-3xl md:rounded-l-3xl shadow-2xl">
          <ScrollArea className="h-[calc(100vh-4rem)] md:h-auto flex items-center p-4 md:p-8">
            <div className="space-y-8 max-w-xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-start gap-4"
              >
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="text-base md:text-lg font-semibold">Contrato generado correctamente</h2>
                  <p className="text-sm md:text-base text-gray-600">
                    Puedes descargar tu contrato desde el correo electrónico que te enviaremos. Manténlo seguro.
                  </p>
                  <span className="text-sm md:text-base text-green-500 font-medium">Completado</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="flex items-start gap-4"
              >
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="text-base md:text-lg font-semibold">Documentos adjuntos</h2>
                  <p className="text-sm md:text-base text-gray-600">¡Ya cargaste todo lo que necesitamos!</p>
                  <span className="text-sm md:text-base text-green-500 font-medium">Completado</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
                className="flex items-start gap-4"
              >
                <div className="relative">
                  <Circle className="w-6 h-6 md:w-8 md:h-8 text-[#f34739] flex-shrink-0 mt-0.5" />
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#f34739] rounded-full animate-ping" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-base md:text-lg font-semibold text-[#f34739]">Verificación en proceso</h2>
                  <p className="text-sm md:text-base text-gray-600">
                    Estamos revisando tus documentos. Te notificaremos cuando esté listo.
                  </p>
                  <span className="text-sm md:text-base text-[#f34739] font-medium">En progreso</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
                className="flex items-start gap-4"
              >
                <Circle className="w-6 h-6 md:w-8 md:h-8 text-gray-300 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="text-base md:text-lg font-semibold text-gray-500">Crea tu perfil</h2>
                  <p className="text-sm md:text-base text-gray-500">Para empezar, carga tu logo, menú y horarios.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.7 }}
                className="flex items-start gap-4"
              >
                <Circle className="w-6 h-6 md:w-8 md:h-8 text-gray-300 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="text-base md:text-lg font-semibold text-gray-500">Activa tu negocio</h2>
                  <p className="text-sm md:text-base text-gray-500">
                    Actívate desde el sistema de recepción de pedidos para empezar a recibir pedidos.
                  </p>
                </div>
              </motion.div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

