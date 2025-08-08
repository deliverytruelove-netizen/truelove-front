// components\HomePage.tsx
import RegistrationForm from "@/components/registerLocal/RegistrationForm"
import Fondo from "@/public/_FRS0388.jpg"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full bg-white md:bg-black overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <Image
          src={Fondo.src || "/placeholder.svg"}
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between md:px-8 lg:px-16">
        {/* Título - oculto en móvil, visible en tablet/desktop */}
        <div className="hidden md:block md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-tight tracking-tight">
            Haz crecer tu negocio
            <br />
            <span className="text-red-50 drop-shadow-[0_2px_4px_rgba(220,38,38,0.8)]">con nosotros</span>
          </h1>
        </div>

        {/* Formulario - centrado en móvil, a la derecha en tablet/desktop */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <div className="w-full md:max-w-md">
            <RegistrationForm />
          </div>
        </div>
      </div>
    </div>
  )
}
