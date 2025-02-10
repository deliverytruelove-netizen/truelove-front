"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, Mail, Clock } from "lucide-react"
import ReactConfetti from "react-confetti"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AnimatedBackground } from "./AnimatedBackground"

export default function ConfirmacionEntrega() {
  const [isLoading, setIsLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setShowConfetti(true)
    }, 3000)

    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    updateWindowSize()
    window.addEventListener("resize", updateWindowSize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", updateWindowSize)
    }
  }, [])

  return (
    <>
      <AnimatedBackground />
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
              <h2 className="mt-4 text-xl font-semibold text-gray-700">Estamos procesando tu solicitud</h2>
              <p className="mt-2 text-gray-500 text-center">
                Por favor, espera mientras registramos los detalles de tu entrega.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <CheckCircle className="h-16 w-16 text-green-500" />
              </motion.div>
              <h2 className="mt-4 text-2xl font-bold text-gray-800">¡Solicitud Recibida!</h2>
              <p className="mt-2 text-gray-600 text-center">
                Hemos registrado exitosamente tu solicitud de entrega de material.
              </p>
              <div className="mt-6 bg-blue-50 rounded-lg p-4 flex items-start">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  En las próximas 24 horas, te enviaremos un correo electrónico con la aprobación y los detalles de tu
                  cita de entrega. Por favor, mantente atento a tu bandeja de entrada.
                </p>
              </div>
              <div className="mt-4 bg-yellow-50 rounded-lg p-4 flex items-start">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  El proceso de aprobación puede tomar hasta 24 horas. Te agradecemos tu paciencia durante este tiempo.
                </p>
              </div>
              <Button asChild className="mt-8 bg-blue-500 hover:bg-blue-600 text-white">
                <Link href="/reparto/dashboard">Ir al Dashboard</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}

