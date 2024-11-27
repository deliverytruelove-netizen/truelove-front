'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, CircleDot, Circle } from 'lucide-react'
import Contrato from '@/src/assets/contrato.png'

export default function ContratoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar>
        <Button
          asChild
          variant="default"
          className="bg-[#f34739] text-white hover:bg-[#d63c30]"
        >
          <Link href="/">Guardar y salir</Link>
        </Button>
      </Navbar>

      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full md:w-1/2 p-4 md:p-8 bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto w-24 h-24 md:w-32 md:h-32 relative">
              <Image
                src={Contrato}
                alt="Documento"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Firmaste el contrato satisfactoriamente
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              Estamos ajustando los últimos detalles
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-24">
          <ScrollArea className="h-[calc(100vh-4rem)] md:h-auto flex items-center p-4 md:p-8">
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-sm md:text-base font-semibold">
                    Estamos preparando tu contrato para enviártelo
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    ¡Danos un momento! Podrás descargar tu contrato desde el correo
                    electrónico que te enviaremos. Manténlo seguro.
                  </p>
                  <span className="text-xs md:text-sm text-green-500">Completado</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CircleDot className="w-5 h-5 md:w-6 md:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-sm md:text-base font-semibold">Adjunta tus documentos</h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    Para completar el siguiente paso necesitaremos algunos documentos.
                  </p>
                  <span className="text-xs md:text-sm text-red-500">En proceso</span>
                  <div className="pt-2">
                    <Button asChild variant="default" className="bg-red-500 hover:bg-red-600 text-xs md:text-sm">
                      <Link href="/cuenta-bancaria">Empezar</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Circle className="w-5 h-5 md:w-6 md:h-6 text-gray-300 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-sm md:text-base font-semibold text-gray-500">Crea tu perfil</h2>
                  <p className="text-xs md:text-sm text-gray-400">
                    Para empezar, carga tu logo, menú y horarios.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Circle className="w-5 h-5 md:w-6 md:h-6 text-gray-300 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-sm md:text-base font-semibold text-gray-500">Activa tu negocio</h2>
                  <p className="text-xs md:text-sm text-gray-400">
                    Actívate desde el sistema de recepción de pedidos para empezar a
                    recibir pedidos.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

