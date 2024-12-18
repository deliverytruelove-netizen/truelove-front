"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import ImaDelivery from "@/public/img/deli-ubicacion.jpg"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import MapComponent from "./components/BusinessMap"
import SearchComponent from "./components/Search"
import BusinessForm from "./components/BussinessForm"
import StepNavigation from "@/components/ui/StepNavigation"
import { useToast } from "@/hooks/use-toast"
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock"

type MapboxFeature = {
  id: string
  place_name: string
  center: [number, number]
  text: string
  context?: { id: string; text: string }[]
}

type FormData = {
  businessName: string
  street: string
  number: string
  postalCode: string
  province: string
  city: string
  reference?: string
}

export default function BusinessLocation() {
  useBodyScrollLock()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedLocation, setSelectedLocation] = useState<MapboxFeature | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLocationSelect = (location: MapboxFeature) => {
    console.log("Location selected:", location)
    setSelectedLocation(location)
    setShowForm(true)
  }

  const handleFormSubmit = (data: FormData) => {
    console.log("Form data submitted:", data)
    setFormData(data)
  }

  const handleNext = async () => {
    if (isSubmitting || !formData || !selectedLocation) return
    setIsSubmitting(true)
    console.log('Iniciando handleNext')

    const businessRegistrationId = sessionStorage.getItem('business_registration_id')
    if (!businessRegistrationId) {
      toast({
        title: "Error",
        description: "Por favor complete el registro primero",
        variant: "destructive",
      })
      router.push('/')
      return
    }

    const locationData = {
      ...formData,
      coordinates: selectedLocation.center,
      fullAddress: selectedLocation.place_name,
      business_registration_id: businessRegistrationId
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/establecimientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
        cache: 'no-store',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al guardar los datos')
      }

      const result = await response.json()
      console.log('Respuesta del servidor recibida:', result)
      
      // Guardar el ID del establecimiento para usarlo en pasos posteriores
      sessionStorage.setItem('establecimiento_id', result.establecimiento.id)
      
      toast({
        title: "Éxito",
        description: "Los datos del establecimiento se han guardado correctamente",
      })

      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/datosClaves')

    } catch (error) {
      console.error('Error en handleNext:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar los datos del establecimiento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

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

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="hidden md:flex w-full md:w-1/2 p-4 bg-gray-100">
          <div className="h-full flex justify-center items-center">
            <Image
              src={ImaDelivery}
              alt="delivery"
              layout="responsive"
              width={500}
              height={500}
              priority
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-gray-50">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4 md:p-8 space-y-6">
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-2xl font-bold">Ubicación del negocio</h2>
                <p className="text-muted-foreground mt-2">
                  Ingresa la dirección exacta de tu establecimiento para que tus
                  clientes puedan encontrarte fácilmente.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <SearchComponent onLocationSelect={handleLocationSelect} />
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                <MapComponent 
                  selectedLocation={selectedLocation}
                  onLocationUpdate={handleLocationSelect}
                />

                {showForm && selectedLocation && (
                  <div className="mt-6 border rounded-lg bg-white p-6">
                    <BusinessForm
                      selectedLocation={selectedLocation}
                      onSubmit={handleFormSubmit}
                    />
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      <StepNavigation
        currentStep={2}
        totalSteps={7}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!(selectedLocation && formData) || isSubmitting}
      />
    </div>
  )
}

