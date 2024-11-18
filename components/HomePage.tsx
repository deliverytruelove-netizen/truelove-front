import RegistrationForm from '@/components/registerLocal/RegistrationForm'
import Fondo from '@/public/fondo.png'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-start justify-end py-10 px-4">
      <Image
        src={Fondo.src}
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute top-1/4 left-16 max-w-2xl">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-tight tracking-tight">
          Haz crecer tu{' '}
          <span className="text-red-50 drop-shadow-[0_2px_4px_rgba(220,38,38,0.8)]">
            negocio
          </span>{' '}
          con nosotros
        </h1>
        <p className="mt-6 text-2xl md:text-3xl text-white font-medium drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] leading-relaxed">
          Únete a nuestra red de establecimientos y{' '}
          <span className="text-red-50 drop-shadow-[0_2px_4px_rgba(220,38,38,0.8)]">
            alcanza a más clientes
          </span>
        </p>
      </div>
      <RegistrationForm />
    </div>
  )
}