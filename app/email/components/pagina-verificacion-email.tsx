"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import emailIcon from "@/public/img/gmail.png"
import EmailImage from "@/public/img/emailsended.jpg"
import { NotificacionMejorada } from "./notificacion-mejorada"
import { VerificacionExitosa } from "./verificacion-exitosa"
import { FormularioVerificacion } from "./formulario-verificacion"
import { useVerificacionEmail } from "@/hooks/use-verificacion-email"

export function PaginaVerificacionEmail() {
  const {
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
  } = useVerificacionEmail()

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {!verificado && (
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
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 z-10 relative"
      >
        <div className="flex flex-col items-center">
          {!verificado && (
            <div className="mb-6">
              <Image src={emailIcon || "/placeholder.svg"} alt="Email Icon" width={50} height={50} />
            </div>
          )}

          {verificado ? (
            <VerificacionExitosa />
          ) : (
            <FormularioVerificacion
              email={email}
              cargando={cargando}
              error={error}
              tiempoReenvio={tiempoReenvio}
              codigoVerificacion={codigoVerificacion}
              setCodigoVerificacion={setCodigoVerificacion}
              manejarVerificacion={manejarVerificacion}
              manejarReenvio={manejarReenvio}
            />
          )}
        </div>
        <NotificacionMejorada
          mensaje="Se ha reenviado el código a su correo"
          mostrar={mostrarNotificacion}
          duracion={3000}
          onClose={ocultarNotificacion}
        />
      </motion.div>
    </div>
  )
}

export default PaginaVerificacionEmail
