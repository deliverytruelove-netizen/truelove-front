'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CapturarImagen } from "./CapturarImagen"
import { toast } from "@/hooks/use-toast"
import { compressImage } from "@/utils/comprimir-imagen"
import Image from 'next/image'
interface Ciudad {
  id: number;
  nombre: string;
}

interface Distrito {
  id: number;
  nombre: string;
}

export function FormularioDatos() {
  const router = useRouter()
  const [imagenCapturada, setImagenCapturada] = useState<string | null>(null)
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [distritos, setDistritos] = useState<Distrito[]>([])
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<string>("")
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>("")
  const [genero, setGenero] = useState<string>("")
  const [fechaNacimiento, setFechaNacimiento] = useState<string>("")
  const [cargando, setCargando] = useState(false)

  const obtenerCiudades = useCallback(async () => {
    try {
      setCargando(true)
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/ciudades`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!respuesta.ok) {
        throw new Error(`Error al obtener ciudades: ${respuesta.status}`)
      }
      
      const datos = await respuesta.json()
      setCiudades(datos)
    } catch (error) {
      console.error('Error al obtener ciudades:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ciudades. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    obtenerCiudades()
  }, [obtenerCiudades])

  const obtenerDistritos = async (ciudadId: string) => {
    if (!ciudadId) return
    
    try {
      setCargando(true)
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/distritos/${ciudadId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!respuesta.ok) {
        throw new Error(`Error al obtener distritos: ${respuesta.status}`)
      }
      
      const datos = await respuesta.json()
      setDistritos(datos)
    } catch (error) {
      console.error('Error al obtener distritos:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los distritos. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const manejarCaptura = useCallback((srcImagen: string) => {
    setImagenCapturada(srcImagen)
  }, [])

  const manejarCambioCiudad = useCallback((ciudadId: string) => {
    setCiudadSeleccionada(ciudadId)
    setDistritoSeleccionado("")
    obtenerDistritos(ciudadId)
  }, [])

  const validarFormulario = useCallback(() => {
    if (!fechaNacimiento) {
      toast({
        title: "Error",
        description: "Por favor, ingresa tu fecha de nacimiento.",
        variant: "destructive",
      })
      return false
    }
    if (!genero) {
      toast({
        title: "Error",
        description: "Por favor, selecciona tu género.",
        variant: "destructive",
      })
      return false
    }
    if (!imagenCapturada) {
      toast({
        title: "Error",
        description: "Por favor, toma una selfie.",
        variant: "destructive",
      })
      return false
    }
    if (!ciudadSeleccionada) {
      toast({
        title: "Error",
        description: "Por favor, selecciona tu ciudad.",
        variant: "destructive",
      })
      return false
    }
    if (!distritoSeleccionado) {
      toast({
        title: "Error",
        description: "Por favor, selecciona tu distrito.",
        variant: "destructive",
      })
      return false
    }
    return true
  }, [fechaNacimiento, genero, imagenCapturada, ciudadSeleccionada, distritoSeleccionado])

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarFormulario()) {
      return
    }

    try {
      setCargando(true)

      let imagenComprimida = null
      if (imagenCapturada) {
        try {
          const imagenBase64 = await compressImage(imagenCapturada)
          // Convertir base64 a Blob
          const response = await fetch(imagenBase64)
          imagenComprimida = await response.blob()
        } catch (error) {
          console.error('Error al comprimir la imagen:', error)
          toast({
            title: "Error",
            description: "Error al procesar la imagen. Por favor, intenta de nuevo.",
            variant: "destructive",
          })
          return
        }
      }

      const datosFormulario = new FormData()
      datosFormulario.append('fecha_nacimiento', fechaNacimiento)
      datosFormulario.append('genero', genero)
      datosFormulario.append('ciudad_id', ciudadSeleccionada)
      datosFormulario.append('distrito_id', distritoSeleccionado)
      
      if (imagenComprimida) {
        datosFormulario.append('selfie', imagenComprimida, 'selfie.jpg')
      }

      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/datos-personales`, {
        method: 'POST',
        body: datosFormulario,
      })

      const contentType = respuesta.headers.get("content-type");
      if (!respuesta.ok) {
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const datosError = await respuesta.json();
          throw new Error(datosError.message || 'Error al enviar el formulario');
        } else {
          throw new Error('Error al enviar el formulario');
        }
      }

      // Solo intentar parsear JSON si el content-type es application/json
      if (contentType && contentType.indexOf("application/json") !== -1) {
        await respuesta.json(); // No necesitamos guardar el resultado si no lo vamos a usar
      }

      toast({
        title: "Éxito",
        description: "Datos personales guardados correctamente.",
      })

      router.push('/reparto/documentos')

    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={manejarEnvio}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
          <input
            type="date"
            id="fechaNacimiento"
            required
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genero">Género</Label>
          <Select value={genero} onValueChange={setGenero}>
            <SelectTrigger id="genero">
              <SelectValue placeholder="Selecciona tu género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="femenino">Femenino</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tómate una selfie</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center space-y-4">
            <CapturarImagen onCapture={manejarCaptura} />
            {imagenCapturada && (
              <div className="mt-4">
                <p className="text-xs md:text-sm text-gray-500 mb-2">Imagen capturada:</p>
                <Image 
                  src={imagenCapturada} 
                  alt="Selfie capturada" 
                  className="max-w-[200px] h-auto rounded-lg mx-auto" 
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Select value={ciudadSeleccionada} onValueChange={manejarCambioCiudad}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu ciudad" />
            </SelectTrigger>
            <SelectContent>
              {ciudades.map((ciudad) => (
                <SelectItem key={ciudad.id} value={ciudad.id.toString()}>
                  {ciudad.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="distrito">Distrito</Label>
          <Select 
            value={distritoSeleccionado} 
            onValueChange={setDistritoSeleccionado}
            disabled={!ciudadSeleccionada}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu distrito" />
            </SelectTrigger>
            <SelectContent>
              {distritos.map((distrito) => (
                <SelectItem key={distrito.id} value={distrito.id.toString()}>
                  {distrito.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit"
          className="bg-red-500 hover:bg-red-600 text-white"
          disabled={cargando}
        >
          {cargando ? 'Cargando...' : 'Continuar'}
        </Button>
      </div>
    </form>
  )
}

