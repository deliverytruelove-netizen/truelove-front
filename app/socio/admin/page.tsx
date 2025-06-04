// app\socio\admin\page.tsx
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
    <div className="max-w-7xl mx-auto">
      {/* Espacio para futuras estadísticas */}
      <div className="mb-6"></div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 ">
        <div className="md:col-span-2">
          <PerfilNegocio horarios={horariosEjemplo} />
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
              <div className="grid gap-3">
                <Link href="/socio/admin/menu" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 bg-white hover:bg-brand-50 border border-gray-200 hover:border-brand-300 text-gray-700 hover:text-brand-700 shadow-sm group relative overflow-hidden transition-all duration-200 dark:bg-gray-800 dark:text-white"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                        <Store className="h-5 w-5 text-brand-600" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Gestionar Menú</span>
                        <span className="text-xs text-gray-500 dark:text-gray-200">Administra tus productos</span>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/socio/admin/pedidos" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 bg-white hover:bg-brand-50 border border-gray-200 hover:border-brand-300 text-gray-700 hover:text-brand-700 shadow-sm group relative overflow-hidden transition-all duration-200 dark:bg-gray-800 dark:text-white"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-brand-600" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Pedidos Pendientes</span>
                        <span className="text-xs text-gray-500 dark:text-gray-200">Revisa tus pedidos activos</span>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/socio/admin/configuracion" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 bg-white hover:bg-brand-50 border border-gray-200 hover:border-brand-300 text-gray-700 hover:text-brand-700 shadow-sm group relative overflow-hidden transition-all duration-200 dark:bg-gray-800 dark:text-white"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-brand-600" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Horario</span>
                        <span className="text-xs text-gray-500 dark:text-gray-200">Configura tus horarios</span>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full h-auto p-4 bg-white hover:bg-brand-50 border border-gray-200 hover:border-brand-300 text-gray-700 hover:text-brand-700 shadow-sm group relative overflow-hidden transition-all duration-200 dark:bg-gray-800 dark:text-gray-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <HeadphonesIcon className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Soporte</span>
                      <span className="text-xs text-gray-500 dark:text-gray-200">¿Necesitas ayuda?</span>
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
