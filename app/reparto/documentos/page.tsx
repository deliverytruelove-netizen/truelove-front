// app\reparto\documentos\page.tsx
import Image from "next/image"
import Navbar from "@/components/ui/navbar"
import { FormularioBancario } from "./components/formulario-bancario"
import Moto from "@/src/assets/img/documentos.jpg"

export default function RepartoDocumento() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />
        {/* <div className="flex items-center gap-2 md:gap-4">
          <Button asChild variant="ghost" className="text-xs md:text-sm">
            <Link href="/">¿Tienes preguntas?</Link>
          </Button>
          <Button
            asChild
            variant="default"
            className="bg-[#f34739] text-white hover:bg-[#d63c30] text-xs md:text-sm"
          >
            <Link href="/">Guardar y salir</Link>
          </Button>
        </div>
      </Navbar> */}

      {/* Contenido principal */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Imagen lateral */}
        <div className="hidden md:block w-full md:w-1/2 h-48 md:h-auto relative">
          <Image
            src={Moto}
            alt="Moto de reparto"
            layout="fill"
            objectFit="cover"
          />
        </div>

        {/* Formulario */}
        <div className="w-full md:w-1/2 bg-white">
          <FormularioBancario />
        </div>
      </div>
    </div>
  )
}

