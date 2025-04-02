'use client'

import { useState, useEffect } from "react"
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
import { updateRegistrationStep, getRegistrationData } from '@/services/registrationTokenService'

function PlanPrecios() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState(false)
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

