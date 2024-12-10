import RegistrationForm from '@/components/registerLocal/RegistrationForm'
import Fondo from '@/public/fondo.webp'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-5 px-2  ">
      {/* Imagen de fondo */}
      <Image
        src={Fondo.src}
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      {/* Contenido principal */}
      <div className="absolute top-8 left-4 p-5 md:left-8 lg:left-16 max-w-4xl">
        <h1 className="text-4xl md:text-4xl lg:text-4xl font-extrabold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-tight tracking-tight">
          Haz crecer tu{' '}
          <span className="text-red-50 drop-shadow-[0_2px_4px_rgba(220,38,38,0.8)]">
            negocio con nosotros
          </span>
        </h1>
      </div>

      {/* Párrafo cerca del formulario */}
      <div className="absolute top-1/2 transform -translate-y-1/2 text-center hidden md:block">
        <p className="text-lg md:text-xl lg:text-2xl text-white font-medium drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-relaxed">
          Únete a nuestra red <br />
          de establecimientos y <br />
          alcanza a más clientes
        </p>
      </div>

      {/* Formulario ajustado */}
      <div className="w-full max-w-md md:absolute md:right-24 md:top-1/2 md:transform md:-translate-y-1/2">
        <RegistrationForm />
      </div>
    </div>
  )
}

