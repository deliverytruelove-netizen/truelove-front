// components\HomePage.tsx
import RegistrationForm from "@/components/registerLocal/RegistrationForm"
import Fondo from "@/public/truelovebanner.png"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src={Fondo.src || "/placeholder.svg"}
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-tight tracking-tight whitespace-nowrap">
            Haz crecer tu negocio
            <br />
            <span className="text-red-50 drop-shadow-[0_2px_4px_rgba(220,38,38,0.8)] block text-center">con nosotros</span>
          </h1>
        </div>
        {/* Formulario a la derecha */}
        <div className="absolute right-4 md:right-16 lg:right-24 top-1/2 transform -translate-y-1/2 w-full max-w-md">
          <RegistrationForm />
        </div>
      </div>
    </div>
  )
}
