// app\ubicar-local\page.tsx
"use client"

import { useState, useEffect } from "react"
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
import { getRegistrationToken, updateRegistrationStep, getRegistrationData } from '@/services/registrationTokenService'

// Actualización de la interfaz para Google Maps
interface GoogleMapsLocation {
  place_id?: string;
  formatted_address: string;
  center: [number, number];
  name?: string;
  address_components?: google.maps.GeocoderAddressComponent[];
  businessName?: string;
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
  const [selectedLocation, setSelectedLocation] = useState<GoogleMapsLocation | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchEstablecimientoData = async (businessRegistrationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/establecimientos/${businessRegistrationId}`,
        {
          headers: {
            Authorization: `Bearer ${getRegistrationToken()}`,
          },
        }
      );
  
      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error("Error al obtener datos del establecimiento");
        }
        return null;
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching establishment data:", error);
      return null;
    }
  };
  
  useEffect(() => {
    const checkToken = async () => {
      const data = await getRegistrationData();
      if (!data || (data.current_step !== '/ubicar-local' && data.current_step !== '/datosClaves')) {
        toast({
          title: "Error",
          description: "Por favor complete los pasos anteriores",
          variant: "destructive",
        });
        router.push('/');
        return;
      }

      if (data.registration_id) {
        const establecimientoData = await fetchEstablecimientoData(data.registration_id);
        if (establecimientoData) {
          console.log("Datos del establecimiento:", establecimientoData);
          
          setSelectedLocation({
            place_id: 'existing-location',
            formatted_address: establecimientoData.direccion_completa,
            center: [parseFloat(establecimientoData.longitud), parseFloat(establecimientoData.latitud)],
            name: establecimientoData.nombre_establecimiento,
            address_components: [
              { long_name: establecimientoData.provincia, types: ['administrative_area_level_1'] },
              { long_name: establecimientoData.ciudad, types: ['locality'] },
              { long_name: establecimientoData.codigo_postal, types: ['postal_code'] }
            ] as google.maps.GeocoderAddressComponent[],
            businessName: establecimientoData.nombre_establecimiento
          });

          setFormData({
            businessName: establecimientoData.nombre_establecimiento,
            street: establecimientoData.calle,
            number: establecimientoData.numero,
            postalCode: establecimientoData.codigo_postal,
            province: establecimientoData.provincia,
            city: establecimientoData.ciudad,
            reference: establecimientoData.referencia || '',
          });

          setShowForm(true);
        }
      }
    };

    checkToken();
  }, [router, toast]);

  const handleLocationSelect = (location: GoogleMapsLocation) => {
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

    try {
      const registrationData = await getRegistrationData();
      if (!registrationData) {
        throw new Error('Datos de registro no encontrados');
      }

      const locationData = {
        ...formData,
        coordinates: selectedLocation.center,
        fullAddress: selectedLocation.formatted_address,
        business_registration_id: registrationData.registration_id
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/establecimientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getRegistrationToken()}`
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
      
      await updateRegistrationStep('/datosClaves')
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

  const handleBack = async () => {
    try {
      await updateRegistrationStep('/acercaNegocio')
      router.push('/acercaNegocio')
    } catch (error) {
      console.error('Error al volver hacia atras:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al volver hacia atras",
        variant: "destructive",
      })
    }
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
             src={ImaDelivery || "/placeholder.svg"}
              alt="delivery"
              layout="responsive"
              width={500}
              height={500}
              loading="lazy" // Usar lazy loading en su lugar
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
