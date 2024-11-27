'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock"
import dynamic from 'next/dynamic'
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import FormularioPlanes from "./components/FormularioPlanes"
import DeliveryImage from "@/public/img/deli.jpg"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LatestIds {
  negocioId: number
  establecimientoId: number
  datosClaveId: number
  datosBancariosId: number
}

function PlanPrecios() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState(false)
  const [latestIds, setLatestIds] = useState<LatestIds | null>(null)
  const [loading, setLoading] = useState(true)

  const currentStep = 5
  const totalSteps = 7

  useBodyScrollLock();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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

  const handleNext = () => {
    if (!selectedPlan || !latestIds) return

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
    <section className="min-h-screen flex flex-col w-full bg-gray-50">
      <Navbar />
      <div className="flex-grow grid lg:grid-cols-2">
        <div className="relative hidden h-full lg:block">
          <Image
            alt="Delivery person handing over a package"
            src={DeliveryImage}
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="flex items-center justify-center p-4 lg:p-8">
            <FormularioPlanes onPlanSelect={setSelectedPlan} />
          </div>
        </ScrollArea>
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

export default dynamic(() => Promise.resolve(PlanPrecios), { ssr: false })

