
import Image from 'next/image'
import RegistrationForm from '@/components/registerLocal/RegistrationForm'
import Fondo from '@/public/fondo.png'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-start justify-end py-10 px-4"
         style={{
           backgroundImage: `url(${Fondo.src})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}>
      <div className="absolute top-1/4 left-11 transform -translate-x-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
          Haz crecer tu negocio con nosotros
        </h1>
        <p className="mt-4 text-xl text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
          Únete a nuestra red de establecimientos y alcanza a más clientes
        </p>
      </div>
      <RegistrationForm />
    </div>
  )
}