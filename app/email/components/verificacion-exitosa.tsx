"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import EmailEnviado from "@/public/img/data.svg"

export function VerificacionExitosa() {
  return (
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
  )
}
