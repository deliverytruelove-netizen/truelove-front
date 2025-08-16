"use client"

import React, { useState, useEffect } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MapComponent from "../../components/BusinessMap"
import SearchComponent from "../../components/Search"
import BusinessForm from "../../components/BussinessForm"
import type { GoogleMapsLocation } from "../../types/google-maps"

interface AddressEditorModalProps {
  currentAddress: string
  onAddressUpdate: (newAddress: string) => void
  onClose: () => void
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

const AddressEditorModal: React.FC<AddressEditorModalProps> = ({
  onAddressUpdate,
  onClose
}) => {
  const [selectedLocation, setSelectedLocation] = useState<GoogleMapsLocation | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [initialFormData, setInitialFormData] = useState<FormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ title: string; description: string; variant?: string } | null>(null)

  // Cargar datos actuales del establecimiento al montar el componente
  useEffect(() => {
    fetchCurrentEstablishmentData()
  }, [])

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchCurrentEstablishmentData = async () => {
    setIsLoading(true)
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1]

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/establecimiento/actual`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const establecimientoData = await response.json()
        console.log("📍 Datos del establecimiento cargados:", establecimientoData)
        
        // Crear el objeto de ubicación
        const locationData: GoogleMapsLocation = {
          place_id: 'existing-location',
          formatted_address: establecimientoData.direccion_completa,
          center: [parseFloat(establecimientoData.longitud), parseFloat(establecimientoData.latitud)],
          name: establecimientoData.nombre_establecimiento,
          address_components: [
            { long_name: establecimientoData.provincia, types: ['administrative_area_level_1'] },
            { long_name: establecimientoData.ciudad, types: ['locality'] },
            { long_name: establecimientoData.codigo_postal, types: ['postal_code'] }
          ] as google.maps.GeocoderAddressComponent[],
        }

        // Crear los datos del formulario
        const formDataFromDB: FormData = {
          businessName: establecimientoData.nombre_establecimiento || '',
          street: establecimientoData.calle || '',
          number: establecimientoData.numero || '',
          postalCode: establecimientoData.codigo_postal || '',
          province: establecimientoData.provincia || '',
          city: establecimientoData.ciudad || '',
          reference: establecimientoData.referencia || '',
        }

        console.log("📝 Datos del formulario preparados:", formDataFromDB)

        setSelectedLocation(locationData)
        setInitialFormData(formDataFromDB)
        setFormData(formDataFromDB)
        setShowForm(true)
      } else {
        throw new Error("Error al obtener datos del establecimiento")
      }
    } catch (error) {
      console.error("Error al cargar datos del establecimiento:", error)
      setToast({
        title: "Error",
        description: "No se pudieron cargar los datos actuales del establecimiento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = (location: GoogleMapsLocation) => {
    console.log("🎯 Nueva ubicación seleccionada:", location)
    setSelectedLocation(location)
    setShowForm(true)
  }

  const handleFormSubmit = (data: FormData) => {
    console.log("📋 Datos del formulario actualizados:", data)
    setFormData(data)
  }

  const handleSave = async () => {
    if (isSubmitting || !formData || !selectedLocation) return
    setIsSubmitting(true)

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1]

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const locationData = {
        ...formData,
        coordinates: selectedLocation.center,
        fullAddress: selectedLocation.formatted_address,
      }

      console.log("💾 Guardando datos:", locationData)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/establecimiento/actualizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(locationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar la dirección')
      }

      setToast({
        title: "Éxito",
        description: "La dirección ha sido actualizada correctamente",
      })

      // Actualizar la dirección en el componente padre
      onAddressUpdate(selectedLocation.formatted_address)
      
      // Volver al perfil después de un breve delay
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Error al actualizar la dirección:', error)
      setToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la dirección",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
 <div className="bg-white p-6">
      {/* Toast Notification */}
      {toast && (
  <div className="absolute top-4 right-4 z-50 max-w-sm">
          <div className={`rounded-lg p-4 shadow-lg ${
            toast.variant === 'destructive' 
              ? 'bg-red-50 border border-red-200 text-red-800' 
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            <div className="font-medium">{toast.title}</div>
            <div className="text-sm mt-1">{toast.description}</div>
          </div>
        </div>
      )}


    
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Search and Map */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Buscar Ubicación</CardTitle>
                <p className="text-sm text-gray-500">
                  Haz clic en el mapa para ajustar la ubicación exacta
                </p>
                <SearchComponent onLocationSelect={handleLocationSelect} />
              </CardHeader>
              <CardContent>
                <MapComponent 
                  selectedLocation={selectedLocation}
                  onLocationUpdate={handleLocationSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            {showForm && selectedLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Detalles de la Dirección</CardTitle>
                  <p className="text-sm text-gray-500">
                    Completa y verifica los datos de tu establecimiento
                  </p>
                </CardHeader>
                <CardContent>
                  <BusinessForm
                    selectedLocation={selectedLocation}
                    onSubmit={handleFormSubmit}
                    initialData={initialFormData}
                  />
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {showForm && selectedLocation && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!(selectedLocation && formData) || isSubmitting}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
 
    </div>
  )
}

export default AddressEditorModal;