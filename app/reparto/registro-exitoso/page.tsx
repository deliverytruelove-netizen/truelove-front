// app\reparto\registro-exitoso\page.tsx
"use client"

import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { CheckCircle, Loader2 } from "lucide-react"
import { createRepartoToken } from "@/services/repartoTokenService"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { FormDataServiceV2 } from "@/services/formDataServiceV2"
import { toast } from "@/hooks/use-toast"

export default function RegistroExitoso() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Procesando datos")
  const [currentRegistroId, setCurrentRegistroId] = useState<string | null>(null)

useEffect(() => {
  const verificarDatos = async () => {
    const id = sessionStorage.getItem("repartoRegistroId")
    if (id) {
      setCurrentRegistroId(id)
      
      const datosBasicos = await FormDataServiceV2.obtenerDatosBasicos()
      const datosPersonales = await FormDataServiceV2.obtenerDatosPersonales()
      const cuentaBancaria = await FormDataServiceV2.obtenerCuentaBancaria()
      const vehiculo = await FormDataServiceV2.obtenerVehiculo()
      
      // Usar la función helper para verificar si es bicicleta o moto eléctrica
      const esVehiculoSinDocumento = FormDataServiceV2.esVehiculoSinDocumentoMotorizado()
      
      // Modificar la validación para considerar vehículos sin documentos
      if (!datosBasicos || !datosPersonales || !cuentaBancaria || (!vehiculo && !esVehiculoSinDocumento)) {
        toast({
          title: "Error",
          description: "Faltan datos del registro. Por favor, comience el proceso nuevamente.",
          variant: "destructive",
        })
        router.push("/reparto")
      }
    } else {
      toast({
        title: "Error",
        description: "No se encontró el ID del registro",
        variant: "destructive",
      })
      router.push("/reparto")
    }
  }
  
  verificarDatos()
}, [router])

  const enviarRegistroCompleto = async () => {
    if (!currentRegistroId) {
      toast({
        title: "Error",
        description: "No se encontró el ID del registro",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setLoadingMessage("Enviando datos al servidor")
    
    try {
      // ✅ OBTENER TODOS LOS DATOS DE INDEXEDDB
      const datosBasicos = await FormDataServiceV2.obtenerDatosBasicos()
      const datosPersonales = await FormDataServiceV2.obtenerDatosPersonales()
      const cuentaBancaria = await FormDataServiceV2.obtenerCuentaBancaria()
      const vehiculo = await FormDataServiceV2.obtenerVehiculo()

      // Para bicicletas y motos eléctricas, no se requieren datos de vehículo motorizado
      const esVehiculoSinDocumento = FormDataServiceV2.esVehiculoSinDocumentoMotorizado()

      if (!datosBasicos || !datosPersonales || !cuentaBancaria || (!vehiculo && !esVehiculoSinDocumento)) {
        toast({
          title: "Error",
          description: "Faltan datos del registro. Por favor, comience el proceso nuevamente.",
          variant: "destructive",
        })
        router.push("/reparto")
        return
      }
      
      const datosCompletos = {
        datosBasicos,
        datosPersonales, 
        cuentaBancaria,
        vehiculo: esVehiculoSinDocumento ? null : vehiculo
      }
      
      console.log('📦 Enviando datos al backend:', {
        datosBasicos: '✅',
        datosPersonales: '✅',
        cuentaBancaria: '✅',
        vehiculo: vehiculo ? '✅' : '❌ (no requerido)'
      })
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/registro-completo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...datosCompletos,
          temp_id: currentRegistroId
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al enviar los datos")
      }
      
      const data = await response.json()
      
      if (data.data && data.data.id) {
        sessionStorage.setItem("repartoRegistroId", data.data.id)
        
        // ✅ LIMPIAR TODO (sessionStorage + IndexedDB)
        await FormDataServiceV2.limpiarTodosLosDatos()
        console.log('🧹 Datos limpiados exitosamente (sessionStorage + IndexedDB)')
        
        setLoadingMessage("Preparando siguiente paso")
        const newToken = await createRepartoToken(data.data.id, "/reparto/entrega-material")
        
        if (newToken) {
          sessionStorage.setItem("repartoCurrentStep", "/reparto/entrega-material")
          router.push("/reparto/entrega-material")
        } else {
          throw new Error("Error al crear el token")
        }
      } else {
        throw new Error("No se recibió ID de registro")
      }
    } catch (error) {
      console.error("Error al enviar registro:", error)
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Hubo un problema al enviar el registro. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
     

      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-20 h-20 text-[#f34739]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">¡Felicitaciones!</h1>
            <p className="text-gray-500">
              Has completado todos los pasos del registro. Haz clic en Finalizar para guardar toda tu información.
            </p>
            <div className="pt-4">
              <Button
                onClick={enviarRegistroCompleto}
                className="bg-[#f34739] hover:bg-[#d63c30] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    {loadingMessage}...
                  </>
                ) : "Finalizar Registro"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
