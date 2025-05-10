"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle } from "lucide-react"

// Interfaz para las props de la notificación mejorada
export interface NotificacionMejoradaProps {
  mensaje: string
  duracion?: number
  mostrar: boolean
  onClose?: () => void
}

// Componente de notificación mejorada
export function NotificacionMejorada({ mensaje, duracion = 3000, mostrar, onClose }: NotificacionMejoradaProps) {
  const [visible, setVisible] = useState(false)

  // Este efecto controla la visibilidad basada en la prop mostrar
  useEffect(() => {
    if (mostrar) {
      setVisible(true)

      // Configurar un temporizador para ocultar la notificación después de la duración
      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) {
          onClose()
        }
      }, duracion)

      // Limpiar el temporizador si el componente se desmonta o mostrar cambia
      return () => clearTimeout(timer)
    }
  }, [mostrar, duracion, onClose])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="justify-center content-center bg-green-500 text-white -top-5 rounded-md p-2 gap-2 mt-2 shadow-lg flex"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{mensaje}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
