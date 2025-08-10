'use client'

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock"
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import FormularioPlanes from "./components/FormularioPlanes"
import DeliveryImage from "@/public/img/deli.jpg"
import { updateRegistrationStep, getRegistrationData } from '@/services/registrationTokenService'

function PlanesContent() {
  useBodyScrollLock();
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState(false)
  const [loading, setLoading] = useState(true)

  const currentStep = 5
  const totalSteps = 7

  useEffect(() => {
    const checkToken = async () => {
      const data = await getRegistrationData();
      if (!data || data.current_step !== '/planes') {
        toast({
          title: "Error",
          description: "Por favor complete los pasos anteriores",
          variant: "destructive",
        });
        router.push('/');
      } else {
        setLoading(false);
      }
    };

    checkToken();
  }, [router, toast]);

  const handleNext = async () => {
    if (!selectedPlan) return;

    try {
      await updateRegistrationStep('/revisarDatos');
      router.push('/revisarDatos');
    } catch (error) {
      console.error('Error updating registration step:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paso de registro",
        variant: "destructive"
      });
    }
  }

  const handleBack = async () => {
    try {
      await updateRegistrationStep('/datosBancarios');
      router.push('/datosBancarios');
    } catch (error) {
      console.error('Error al volver hacia atras:', error);
      toast({
        title: "Error",
        description: "No se pudo volver al paso anterior",
        variant: "destructive"
      });
    }
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
    <div className="flex flex-col h-dvh bg-white overflow-hidden">
      {/* Navbar fijo */}
      <div className="flex-shrink-0 bg-white">
        <Navbar />
      </div>

      {/* Contenido principal con flex-grow */}
      <div className="flex flex-grow overflow-hidden">
        {/* Imagen fija en desktop */}
        <div className="hidden md:block w-1/2 relative bg-muted flex-shrink-0">
          <div className="absolute inset-0">
            <Image
              src={DeliveryImage}
              alt="Persona de delivery entregando un paquete"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
        </div>

        {/* Área del formulario con scroll interno */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8 pb-32">
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Elige tu Plan de Delivery
                </h1>
                <p className="text-muted-foreground">
                  Selecciona el plan que mejor se adapte a las necesidades de tu negocio. 
                  Puedes cambiar tu plan en cualquier momento desde tu panel de control.
                </p>
              </div>

              <FormularioPlanes onPlanSelect={setSelectedPlan} />
            </div>
          </div>
        </div>
      </div>

      {/* StepNavigation fijo */}
      <div className="flex-shrink-0 border-t">
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onBack={handleBack}
          isNextDisabled={!selectedPlan}
        />
      </div>
    </div>
  )
}

export default function PlanPrecios() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <PlanesContent />
    </Suspense>
  )
}