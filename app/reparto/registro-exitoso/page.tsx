'use client'


import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { CheckCircle } from 'lucide-react'

export default function RegistroExitoso() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar>
        <div className="flex items-center gap-2 md:gap-4">
       
        </div>
      </Navbar>

      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-20 h-20 text-[#f34739]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Felicitaciones!
            </h1>
            <p className="text-gray-500">
              Has completado exitosamente el registro de tu vehículo. Ahora estás un paso más cerca de formar parte de nuestro equipo.
            </p>
            <div className="pt-4">
              <Button 
                asChild
                className="bg-[#f34739] hover:bg-[#d63c30] text-white"
              >
                <Link href="/reparto/entrega-material">
                  Continuar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

