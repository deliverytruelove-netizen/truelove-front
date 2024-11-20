'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Check, ChevronDown, Smartphone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import DeliveryImage from "@/public/img/deli.jpg"
import { useToast } from "@/hooks/use-toast"

interface LatestIds {
  negocioId: number
  establecimientoId: number
  datosClaveId: number
  datosBancariosId: number
}

export default function PricingPlan() {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(false)
  const [latestIds, setLatestIds] = useState<LatestIds | null>(null)
  const [loading, setLoading] = useState(true)

  const currentStep = 6
  const totalSteps = 8

  const fetchLatestIds = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/obtener-ultimos-ids`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener los IDs más recientes')
      }

      const data = await response.json()
      setLatestIds(data)
    } catch (error) {
      console.error('Error fetching latest IDs:', error)
      toast({
        title: "Error",
        description: "No se pudieron obtener los IDs más recientes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLatestIds()
  }, [fetchLatestIds])

  const benefits = [
    "10% de comisión durante los primeros 30 días",
    "Configuración simple y gratuita",
    "Notificaciones instantáneas de nuevos pedidos",
    "Gestiona órdenes fácilmente",
    "Compatible con tu teléfono móvil",
    "Sin costos ocultos ni mensualidades",
  ]

  const handleNext = () => {
    if (!selectedPlan || !latestIds) return

    // Construct URL with latest IDs
    const params = new URLSearchParams({
      negocioId: latestIds.negocioId.toString(),
      establecimientoId: latestIds.establecimientoId.toString(),
      datosClaveId: latestIds.datosClaveId.toString(),
      datosBancariosId: latestIds.datosBancariosId.toString()
    })

    router.push(`/revisarDatos?${params.toString()}`)
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="grid lg:grid-cols-2">
        <div className="relative hidden h-full min-h-[600px] lg:block">
          <Image
            alt="Delivery person handing over a package"
            src={DeliveryImage}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">
                Planes ideales para tu negocio de delivery
              </CardTitle>
              <p className="text-muted-foreground">
                Optimiza tus entregas y gestiona tus pedidos sin complicaciones.
              </p>
            </CardHeader>
            <ScrollArea className="h-[60vh]">
              <CardContent className="relative space-y-6">
                <Badge className="absolute right-[-35px] top-[25px] rotate-45 bg-red-600 px-10 py-1 text-white">
                  Popular
                </Badge>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                    <Smartphone className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    App para Delivery en Android
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Descarga nuestra app en tu celular Android para gestionar
                  pedidos desde cualquier lugar.
                </p>

                <div>
                  <h3 className="mb-3 font-medium">Beneficios</h3>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="mt-1 h-4 w-4 text-red-600" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b py-3">
                    <span className="text-sm">Comisión por uso</span>
                    <span className="font-medium">21 %</span>
                  </div>
                  <div className="flex items-center justify-between border-b py-3">
                    <span className="text-sm">Costo de instalación</span>
                    <span className="font-medium">175 PEN</span>
                  </div>
                  <div className="flex items-center justify-between border-b py-3">
                    <span className="text-sm">Tarifa de plataforma</span>
                    <span className="font-medium">50 PEN</span>
                  </div>
                  <div className="flex items-center justify-between border-b py-3">
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
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
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
                  onClick={() => setSelectedPlan(true)}
                >
                  Seleccionar
                </Button>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!selectedPlan}
      />
    </section>
  )
}