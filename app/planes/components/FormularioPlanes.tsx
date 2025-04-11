// app\planes\components\FormularioPlanes.tsx
'use client'

import { useState } from "react"
import { Check, ChevronDown, Smartphone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area" // Removed import

interface FormularioPlanesProps {
  onPlanSelect: (selected: boolean) => void
}

export default function FormularioPlanes({ onPlanSelect }: FormularioPlanesProps) {
  const [isOpen, setIsOpen] = useState(false)

  const benefits = [
    "10% de comisión durante los primeros 30 días",
    "Configuración simple y gratuita",
    "Notificaciones instantáneas de nuevos pedidos",
    "Gestiona órdenes fácilmente",
    "Compatible con tu teléfono móvil",
    "Sin costos ocultos ni mensualidades",
  ]

  return (
    <Card className="w-full max-w-md -mt-8"> {/* Updated Card className */}
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">
          Planes ideales para tu negocio de delivery
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Optimiza tus entregas y gestiona tus pedidos sin complicaciones.
        </p>
      </CardHeader>
      {/* Removed ScrollArea */}
        <CardContent className="relative space-y-4"> {/* Removed height class */}
          <Badge className="absolute right-[-35px] top-[25px] rotate-45 bg-red-600 px-10 py-1 text-white">
            Popular
          </Badge>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <Smartphone className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-base font-semibold">
              App para Delivery en Android
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Descarga nuestra app en tu celular Android para gestionar
            pedidos desde cualquier lugar.
          </p>

          <div>
            <h3 className="mb-2 text-sm font-medium">Beneficios</h3>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-red-600" />
                  <span className="text-xs">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-sm">Comisión por uso</span>
              <span className="font-medium">21 %</span>
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-sm">Costo de instalación</span>
              <span className="font-medium">175 PEN</span>
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-sm">Tarifa de plataforma</span>
              <span className="font-medium">50 PEN</span>
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-sm">Uso de la app</span>
              <span className="font-medium">0 PEN</span>
            </div>
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                <span>Ver requisitos técnicos</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <ul className="list-inside list-disc space-y-2 text-xs text-muted-foreground">
                <li>Dispositivo móvil con GPS habilitado</li>
                <li>Aplicación de seguimiento instalada y configurada</li>
                <li>Conexión a internet estable durante las entregas</li>
                <li>Conocimiento básico de las rutas locales</li>
                <li>Disponibilidad de un medio de transporte adecuado</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>

          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={() => onPlanSelect(true)}
          >
            Seleccionar
          </Button>
        </CardContent>
    </Card>
  )
}

