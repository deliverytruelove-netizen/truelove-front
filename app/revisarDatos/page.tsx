'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle } from 'lucide-react'
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import DeliveryImage from "@/public/img/negocio.jpg"
import { useToast } from "@/hooks/use-toast"

// Definición de la interfaz para los datos a revisar
interface ReviewData {
  datos_negocio: {
    nombre: string
    tipo: string
    categoria: string
    total_sucursales: number
    metodo_contacto: string
    telefono: string
    es_local_calle: boolean
  }
  direccion_negocio: {
    nombre_establecimiento: string
    calle: string
    numero: string
    codigo_postal: string
    ciudad: string
    provincia: string
    referencia: string | null
    direccion_completa: string
    latitud: string
    longitud: string
  }
  datos_legales: {
    razon_social: string
    ruc: string
  }
  datos_bancarios: {
    titular_cuenta: string
    numero_cuenta: string
    nombre_banco: string
    tipo_cuenta: string
    documento_titular: string
    codigo_cci: string
    usar_direccion_negocio: boolean
  }
}

export default function ReviewData() {
  const router = useRouter()
  const { toast } = useToast()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReviewData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const currentStep = 7
  const totalSteps = 8

  // Función para obtener los datos, ahora usando useCallback
  const fetchData = useCallback(async (
    negocioId: string,
    establecimientoId: string,
    datosClaveId: string,
    datosBancariosId: string
  ) => {
    try {
      // Construir URL con los parámetros correctos
      const url = new URL(`${process.env.NEXT_PUBLIC_API_WEB}/revisarDatos`)
      url.searchParams.append('negocioId', negocioId)
      url.searchParams.append('establecimientoId', establecimientoId)
      url.searchParams.append('datosClaveId', datosClaveId)
      url.searchParams.append('datosBancariosId', datosBancariosId)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar los datos')
      }

      const jsonData = await response.json()
      setData(jsonData)
      setError(null)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('No se pudieron cargar los datos. Por favor, intenta de nuevo.')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al cargar los datos',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast]) // Dependencias del useCallback

  // Efecto para cargar los datos iniciales
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const negocioId = searchParams.get('negocioId')
    const establecimientoId = searchParams.get('establecimientoId')
    const datosClaveId = searchParams.get('datosClaveId')
    const datosBancariosId = searchParams.get('datosBancariosId')

    if (!negocioId || !establecimientoId || !datosClaveId || !datosBancariosId) {
      setError('Faltan parámetros necesarios en la URL')
      setLoading(false)
      return
    }

    fetchData(negocioId, establecimientoId, datosClaveId, datosBancariosId)
  }, [fetchData]) // Ahora fetchData es una dependencia

  // Función para manejar el avance al siguiente paso
  const handleNext = async () => {
    if (!acceptedTerms) return

    try {
      const searchParams = new URLSearchParams(window.location.search)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/revisar-datos`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          negocio_id: searchParams.get('negocioId'),
          establecimiento_id: searchParams.get('establecimientoId'),
          datos_clave_negocio_id: searchParams.get('datosClaveId'),
          datos_bancarios_id: searchParams.get('datosBancariosId'),
          terminos_aceptados: acceptedTerms
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.mensaje || 'Error al guardar la revisión')
      }

      router.push('/next-step')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al guardar la revisión',
        variant: "destructive"
      })
    }
  }

  // Función para volver al paso anterior
  const handleBack = () => {
    router.back()
  }

  // Función para manejar la edición de secciones
  const handleEdit = (section: string) => {
    const searchParams = new URLSearchParams(window.location.search)
    const negocioId = searchParams.get('negocioId')
    const establecimientoId = searchParams.get('establecimientoId')

    if (!negocioId || !establecimientoId) {
      toast({
        title: "Error",
        description: "No se pueden editar los datos sin los identificadores necesarios",
        variant: "destructive"
      })
      return
    }

    const routes = {
      business: '/datos-negocio',
      address: '/direccion-negocio',
      legal: '/datos-legales',
      bank: '/datos-bancarios',
      commercial: '/relacion-comercial'
    }
    
    const route = routes[section as keyof typeof routes]
    if (route) {
      const queryParams = new URLSearchParams({
        negocioId,
        establecimientoId,
        edit: 'true'
      })
      
      router.push(`${route}?${queryParams.toString()}`)
    }
  }

  // Renderizado condicional para el estado de error
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4 text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-sm text-muted-foreground text-center">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full max-w-[200px]"
            >
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Renderizado condicional para el estado de carga
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  // Renderizado condicional si no hay datos
  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No se encontraron datos</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  // Renderizado principal del componente
  return (
    <section className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="grid lg:grid-cols-2">
        <div className="relative hidden h-full min-h-[600px] lg:block">
          <Image
            alt="Delivery service illustration"
            src={DeliveryImage}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Revisa tus datos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Por favor verifica que la información sea correcta.
              </p>
            </CardHeader>
            <ScrollArea className="h-[60vh]">
              <CardContent className="space-y-6">
                {/* Sección de Datos del Negocio */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Datos del negocio</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('business')}
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {Object.entries(data.datos_negocio).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2">
                        <span className="text-sm text-muted-foreground">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <span className="text-sm font-medium">
                          {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección de Dirección del Negocio */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Dirección del Negocio</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('address')}
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {Object.entries(data.direccion_negocio).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2">
                        <span className="text-sm text-muted-foreground">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <span className="text-sm font-medium">{value || 'No especificada'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección de Datos Legales */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Datos legales</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('legal')}
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {Object.entries(data.datos_legales).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2">
                        <span className="text-sm text-muted-foreground">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección de Datos Bancarios */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Datos bancarios</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('bank')}
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {Object.entries(data.datos_bancarios).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2">
                        <span className="text-sm text-muted-foreground">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <span className="text-sm font-medium">
                          {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección de Relación Comercial */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Relación comercial</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('commercial')}
                    >
                      Cambiar
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Logistica + Pelican Admin (Shop)</p>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        Para finalizar el registro, te pedimos que leas y aceptes los{' '}
                        <a href="#" className="text-pink-600 hover:text-pink-700 underline">
                          términos y condiciones
                        </a>
                        {' '}con los que trabajaremos juntos.
                      </Label>
                    </div>
                  </div>
                </div>
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
        isNextDisabled={!acceptedTerms}
      />
    </section>
  )
}