import RegistrationForm from '@/components/registerLocal/RegistrationForm'
import Fondo from '@/public/fondo.webp'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-start justify-end py-10 px-4">
      {/* Imagen de fondo */}
      <Image
        src={Fondo.src}
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      {/* Contenido principal */}
      <div className="absolute left-4 p-10 md:left-8 lg:left-16 max-w-4xl">
        <h1 className="text-4xl md:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-tight tracking-tight">
          Haz crecer tu{' '}
          <span className="text-red-50 drop-shadow-[0_2px_4px_rgba(220,38,38,0.8)]">
            negocio con
          </span>
        </h1>
        <h1 className="ml-72 text-4xl md:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-tight tracking-tight">
          nosotros
        </h1>
      </div>

      {/* Párrafo movido más cerca del formulario */}
      <div className="absolute bottom-96 left-1/3 transform -translate-x-1/2 text-center">
        <p className="text-lg md:text-xl lg:text-2xl ml-80 text-white font-medium drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-relaxed">
          Únete a nuestra red <br />
          de establecimientos y <br />
          alcanza a más clientes
        </p>
      </div>

      {/* Formulario al final */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-12 w-full max-w-lg">
        <RegistrationForm />
      </div>
    </div>
  )
}
