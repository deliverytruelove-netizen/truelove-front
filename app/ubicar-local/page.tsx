'use client'

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

// Definir un tipo para la ubicación seleccionada
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

// Definir un tipo para la ubicación seleccionada
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
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState<MapboxFeature | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)

  const handleLocationSelect = (location: MapboxFeature) => {
    console.log("Location selected:", location)
    setSelectedLocation(location)
    setShowForm(true)
  }

  const handleFormSubmit = (data: FormData) => {
    console.log("Form data submitted:", data)
    setFormData(data)
  }

  const handleNext = () => {
    if (formData && selectedLocation) {
      const locationData = {
        ...formData,
        coordinates: selectedLocation.center,
        fullAddress: selectedLocation.place_name,
      }
      console.log("Location data:", locationData)
      router.push("/datosClaves")
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

      <div className="flex flex-1">
        <div className="w-1/2 p-4 bg-gray-100">
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

        <div className="w-1/2 bg-gray-50">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-8 space-y-6">
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
                <MapComponent selectedLocation={selectedLocation} />

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
        currentStep={3}
        totalSteps={8}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!(selectedLocation && formData)}
      />
    </div>
  )
}
