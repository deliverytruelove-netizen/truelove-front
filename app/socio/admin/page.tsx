"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PerfilNegocio } from "./components/perfil-negocio"
import Link from "next/link"
import { Store, Clock, FileText, HeadphonesIcon } from "lucide-react"

const horariosEjemplo = [
  {
    id: 1,
    nombre: "Horario Regular",
    lunes: true,
    martes: true,
    miercoles: true,
    jueves: true,
    viernes: true,
    sabado: false,
    domingo: false,
    hora_apertura: "09:00:00",
    hora_cierre: "18:00:00",
    activo: true,
  },
]

export default function SocioDashboard() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <PerfilNegocio horarios={horariosEjemplo} />
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="grid gap-4">
                <Link href="/socio/admin/menu" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 bg-white hover:bg-brand-50 border-brand-200 hover:border-brand-300 text-brand-600 hover:text-brand-700 shadow-sm group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3">
                      <Store className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Gestionar Menú</span>
                        <span className="text-xs text-brand-500">Administra tus productos</span>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/socio/admin/pedidos" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 bg-white hover:bg-brand-50 border-brand-200 hover:border-brand-300 text-brand-600 hover:text-brand-700 shadow-sm group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Pedidos Pendientes</span>
                        <span className="text-xs text-brand-500">Revisa tus pedidos activos</span>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/socio/admin/configuracion" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 bg-white hover:bg-brand-50 border-brand-200 hover:border-brand-300 text-brand-600 hover:text-brand-700 shadow-sm group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3">
                      <Clock className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Horario</span>
                        <span className="text-xs text-brand-500">Configura tus horarios</span>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full h-auto p-4 bg-white hover:bg-brand-50 border-brand-200 hover:border-brand-300 text-brand-600 hover:text-brand-700 shadow-sm group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3">
                    <HeadphonesIcon className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Soporte</span>
                      <span className="text-xs text-brand-500">¿Necesitas ayuda?</span>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

