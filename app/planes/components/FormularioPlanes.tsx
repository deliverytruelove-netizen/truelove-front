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
    <Card className="w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-4 relative">
        <Badge className="absolute -right-3 top-6 rotate-45 bg-red-600 px-8 py-1 text-white text-xs font-medium shadow-md">
          Popular
        </Badge>
        <CardTitle className="text-xl font-bold text-gray-900 pr-12">
          Planes ideales para tu negocio de delivery
        </CardTitle>
        <p className="text-sm text-gray-600 leading-relaxed">
          Optimiza tus entregas y gestiona tus pedidos sin complicaciones.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Header del plan */}
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
          <div className="rounded-lg bg-red-100 p-2 flex-shrink-0">
            <Smartphone className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              App para Delivery en Android
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Gestiona pedidos desde cualquier lugar
            </p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 leading-relaxed">
          Descarga nuestra app en tu celular Android para gestionar
          pedidos desde cualquier lugar.
        </p>

        {/* Beneficios */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Beneficios incluidos</h3>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-xs text-gray-700 leading-relaxed">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Precios */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalles de precios</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Comisión por uso</span>
              <span className="font-semibold text-gray-900">21%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Costo de instalación</span>
              <span className="font-semibold text-gray-900">175 PEN</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Tarifa de plataforma</span>
              <span className="font-semibold text-gray-900">50 PEN</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Uso de la app</span>
              <span className="font-semibold text-green-600">0 PEN</span>
            </div>
          </div>
        </div>

        {/* Requisitos técnicos colapsables */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm">Ver requisitos técnicos</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Dispositivo móvil con GPS habilitado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Aplicación de seguimiento instalada y configurada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Conexión a internet estable durante las entregas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Conocimiento básico de las rutas locales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Disponibilidad de un medio de transporte adecuado</span>
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Botón de selección */}
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 transition-colors duration-200 shadow-md hover:shadow-lg"
          onClick={() => onPlanSelect(true)}
        >
          Seleccionar Plan
        </Button>
      </CardContent>
    </Card>
  )
}