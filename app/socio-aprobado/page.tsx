// esgvsd
"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, PartyPopper, FileCheck, Upload, Rocket } from "lucide-react"
import { fetchSocioData } from "@/services/socioAprobadoService"
import { useToast } from "@/hooks/use-toast"

// Componente de contenido principal
function SocioAprobadoContent() {
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const registrationId = searchParams.get("registration_id")

        if (!registrationId) {
          toast({
            title: "Error",
            description: "No se encontró el ID de registro",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        const businessData = await fetchSocioData(registrationId)
        setBusinessName(businessData.nombre || "")
        setLoading(false)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "Hubo un problema al cargar la información",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [router, toast, searchParams])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f34739] mx-auto" />
          <p className="mt-4 text-[#f34739]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-white">
      <Navbar/>
       

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
              className="mx-auto w-32 h-32 md:w-40 md:h-40 relative bg-green-50 rounded-full flex items-center justify-center"
            >
              <PartyPopper className="w-20 h-20 text-green-500 animate-bounce" aria-hidden="true" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-green-600">¡Felicidades!</h1>
              <p className="text-xl md:text-2xl font-semibold text-gray-700">{businessName}, bienvenido a True Love</p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600"
            >
              Tu negocio ha sido aprobado exitosamente. Ya puedes comenzar a configurar tu perfil.
            </motion.p>
          </div>
        </motion.div>

        <div className="w-full md:w-1/2 bg-white p-6 md:p-12 rounded-t-3xl md:rounded-l-3xl shadow-2xl">
          <ScrollArea className="h-[calc(100vh-4rem)] md:h-auto">
            <div className="space-y-8 max-w-xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4"
              >
                <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Contrato generado correctamente</h2>
                  <p className="text-gray-600">
                    Puedes descargar tu contrato desde el correo electrónico que te enviaremos. Manténlo seguro.
                  </p>
                  <span className="text-green-500 font-medium">Completado</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-4"
              >
                <FileCheck className="w-8 h-8 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Documentos adjuntos</h2>
                  <p className="text-gray-600">¡Ya cargaste todo lo que necesitamos!</p>
                  <span className="text-green-500 font-medium">Completado</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-start gap-4"
              >
                <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Verificación aprobada</h2>
                  <p className="text-gray-600">Todos tus documentos han sido verificados y aprobados correctamente.</p>
                  <span className="text-green-500 font-medium">Completado</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-start gap-4"
              >
                <Upload className="w-8 h-8 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Crea tu perfil</h2>
                  <p className="text-gray-600">Para empezar, carga tu logo, menú y horarios.</p>
                  <Button asChild className="mt-2 bg-blue-500 hover:bg-blue-600 text-white">
                    <Link href="/login">Comenzar ahora</Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="flex items-start gap-4 opacity-50"
              >
                <Rocket className="w-8 h-8 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-500">Activa tu negocio</h2>
                  <p className="text-gray-500">
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

// Componente principal envuelto en Suspense
export default function SocioAprobadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f34739] mx-auto" />
            <p className="mt-4 text-[#f34739]">Cargando...</p>
          </div>
        </div>
      }
    >
      <SocioAprobadoContent />
    </Suspense>
  )
}

