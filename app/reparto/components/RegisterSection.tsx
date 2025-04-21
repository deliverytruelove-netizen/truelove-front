"use client"
import { Suspense } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import RegistrationForm from "./RegisterForm"
import ImagenFondo from "@/public/motorizadotruelove.png"

function Loading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
  )
}

export default function RegisterSection() {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src={ImagenFondo.src || "/placeholder.svg"}
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full min-h-screen">
        {/* Título en el espacio negro central */}
        <div className="absolute top-32 left-[17%] md:left-[20%] lg:left-[18%] max-w-xl">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-tight tracking-tight whitespace-nowrap"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            ¡Regístrate Ya!
            <br />
            <span className="text-gray-300 text-2xl mt-6 font-light block">Es rápido y sencillo.</span>
          </motion.h1>
        </div>

        {/* Formulario a la derecha */}
        <div className="absolute right-4 md:right-16 lg:right-24 top-1/2 transform -translate-y-1/2 w-full max-w-md">
          <Suspense fallback={<Loading />}>
            <RegistrationForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
