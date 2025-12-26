// app\reparto\zonas\components\FormularioDatos.tsx 
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CapturarImagen } from "./CapturarImagen"
import { toast } from "@/hooks/use-toast"
import { compressImage } from "@/utils/comprimir-imagen"
import React from "react"
import { createRepartoToken } from "@/services/repartoTokenService"
import { FormDataServiceV2 } from "@/services/formDataServiceV2"
interface Ubigeo {
  id_ubigeo: number
  departamento: string
  provincia: string
  distrito: string
  nombre: string
}

export function FormularioDatos() {
  const router = useRouter()
  const [repartoRegistroId, setRepartoRegistroId] = React.useState<string | null>(null)
  const [imagenCapturada, setImagenCapturada] = useState<string | null>(null)
  const [departamentos, setDepartamentos] = useState<Ubigeo[]>([])
  const [provincias, setProvincias] = useState<Ubigeo[]>([])
  const [distritos, setDistritos] = useState<Ubigeo[]>([])
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string>("")
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>("")
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>("")
  const [genero, setGenero] = useState<string>("")
  const [fechaNacimiento, setFechaNacimiento] = useState<string>("")
  const [cargando, setCargando] = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(false)
  const [, setDatosPersonalesId] = useState<number | null>(null) //datosPersonalesId
  const [generoError, setGeneroError] = useState<string>("")
  const [selfieError, setSelfieError] = useState<string>("")
  const [fechaNacimientoError, setFechaNacimientoError] = useState<string>("")
  const [departamentoError, setDepartamentoError] = useState<string>("")
  const [provinciaError, setProvinciaError] = useState<string>("")
  const [distritoError, setDistritoError] = useState<string>("")

const obtenerDepartamentosFunc = async () => {
  try {
    setCargando(true)

    // Timeout más largo para móviles
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/departamentos`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!respuesta.ok) {
      throw new Error(`Error al obtener departamentos: ${respuesta.status}`)
    }

    const datos = await respuesta.json()
    setDepartamentos(datos)
  } catch (error) {
    console.error("Error al obtener departamentos:", error)

    let mensaje = "No se pudieron cargar los departamentos. Por favor, intenta de nuevo."
    if (error instanceof Error && error.name === "AbortError") {
      mensaje = "La carga está tomando demasiado tiempo. Por favor, verifica tu conexión."
    }

    toast({
      title: "Error",
      description: mensaje,
      variant: "destructive",
    })
  } finally {
    setCargando(false)
  }
}

  // Modificar la función cargarDatosExistentes para manejar correctamente la carga de ubicación
  const cargarDatosExistentesFunc = async (id: string) => {
    try {
      setCargandoDatos(true)
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/datos-personales/${id}`)

      if (!respuesta.ok) {
        // Si no hay datos, simplemente continuamos sin mostrar error
        if (respuesta.status === 404) {
          return
        }
        throw new Error("Error al obtener datos personales")
      }

      const datos = await respuesta.json()
      console.log("Datos personales obtenidos:", datos)

      // Si hay datos personales, establecerlos
      if (datos.datos_personales) {
        const datosPersonales = datos.datos_personales
        setDatosPersonalesId(datosPersonales.id)

        // Establecer fecha de nacimiento
        if (datosPersonales.fecha_nacimiento) {
          setFechaNacimiento(datosPersonales.fecha_nacimiento)
        }

        // Establecer género
        if (datosPersonales.genero) {
          setGenero(datosPersonales.genero)
        }

        // Establecer selfie
        if (datosPersonales.url_selfie) {
          setImagenCapturada(datosPersonales.url_selfie)
        }
      }

      // Si hay información de ubicación, establecerla
      if (datos.ubicacion) {
        const ubicacion = datos.ubicacion

        // Primero cargar todos los departamentos
        await obtenerDepartamentos()

        // Cargar departamento seleccionado
        if (ubicacion.departamento) {
          setDepartamentoSeleccionado(ubicacion.departamento)

          // Luego cargar provincias del departamento seleccionado
          const provinciasData = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/provincias/${ubicacion.departamento}`)
          if (provinciasData.ok) {
            const provinciasResult = await provinciasData.json()
            setProvincias(provinciasResult)

            // Establecer provincia seleccionada
            if (ubicacion.provincia) {
              setProvinciaSeleccionada(ubicacion.provincia)

              // Cargar distritos de la provincia seleccionada
              const distritosData = await fetch(
                `${process.env.NEXT_PUBLIC_API_WEB}/distritos/${ubicacion.departamento}/${ubicacion.provincia}`,
              )

              if (distritosData.ok) {
                const distritosResult = await distritosData.json()
                setDistritos(distritosResult)

                // Finalmente establecer el distrito seleccionado (ubigeo_id)
                if (ubicacion.ubigeo_id) {
                  setDistritoSeleccionado(ubicacion.ubigeo_id.toString())
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar datos existentes:", error)
      // No mostramos toast aquí porque podría ser un registro nuevo
    } finally {
      setCargandoDatos(false)
    }
  }
  const obtenerDepartamentos = useCallback(obtenerDepartamentosFunc, [])
  const cargarDatosExistentes = useCallback(cargarDatosExistentesFunc, [obtenerDepartamentos])

  React.useEffect(() => {
    const id = sessionStorage.getItem("repartoRegistroId")
    if (!id) {
      router.push("/reparto")
    } else {
      setRepartoRegistroId(id)
      // Cargar datos existentes
      cargarDatosExistentes(id)

      // SOLUCIÓN: Asegurar que el paso actual sea zonas
      const currentStep = sessionStorage.getItem("repartoCurrentStep")
      if (currentStep !== "/reparto/zonas") {
        console.log("Actualizando paso actual a zonas")
        sessionStorage.setItem("repartoCurrentStep", "/reparto/zonas")

        // Intentar actualizar el token si existe
        try {
          if (id) {
            createRepartoToken(id, "/reparto/zonas")
              .then(() => {
                console.log("Token actualizado al cargar la página de zonas")
              })
              .catch((err) => {
                console.error("Error al actualizar token al cargar:", err)
              })
          }
        } catch (error) {
          console.error("Error al verificar token existente:", error)
        }
      }
    }
  }, [router, cargarDatosExistentes])

 const manejarCaptura = useCallback((srcImagen: string) => {
  setImagenCapturada(srcImagen)
  setSelfieError("") // Limpiar error cuando se captura imagen
}, [])

const obtenerProvincias = useCallback(async (departamentoId: string) => {
  if (!departamentoId) return

  try {
    setCargando(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/provincias/${departamentoId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!respuesta.ok) {
      throw new Error(`Error al obtener provincias: ${respuesta.status}`)
    }

    const datos = await respuesta.json()
    setProvincias(datos)
  } catch (error) {
    console.error("Error al obtener provincias:", error)

    let mensaje = "No se pudieron cargar las provincias. Por favor, intenta de nuevo."
    if (error instanceof Error && error.name === "AbortError") {
      mensaje = "La carga está tomando demasiado tiempo. Por favor, verifica tu conexión."
    }

    toast({
      title: "Error",
      description: mensaje,
      variant: "destructive",
    })
  } finally {
    setCargando(false)
  }
}, [])
const obtenerDistritos = useCallback(async (departamentoId: string, provinciaId: string) => {
  if (!departamentoId || !provinciaId) return

  try {
    setCargando(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/distritos/${departamentoId}/${provinciaId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!respuesta.ok) {
      throw new Error(`Error al obtener distritos: ${respuesta.status}`)
    }

    const datos = await respuesta.json()
    setDistritos(datos)
  } catch (error) {
    console.error("Error al obtener distritos:", error)

    let mensaje = "No se pudieron cargar los distritos. Por favor, intenta de nuevo."
    if (error instanceof Error && error.name === "AbortError") {
      mensaje = "La carga está tomando demasiado tiempo. Por favor, verifica tu conexión."
    }

    toast({
      title: "Error",
      description: mensaje,
      variant: "destructive",
    })
  } finally {
    setCargando(false)
  }
}, [])

  const manejarCambioDepartamento = useCallback(
    (departamentoId: string) => {
      setDepartamentoSeleccionado(departamentoId)
      setProvinciaSeleccionada("")
      setDistritoSeleccionado("")
      setProvincias([])
      setDistritos([])
      void obtenerProvincias(departamentoId)
    },
    [obtenerProvincias],
  )

  const manejarCambioProvincia = useCallback(
    (provinciaId: string) => {
      setProvinciaSeleccionada(provinciaId)
      setDistritoSeleccionado("")
      setDistritos([])
      void obtenerDistritos(departamentoSeleccionado, provinciaId)
    },
    [departamentoSeleccionado, obtenerDistritos],
  )

  useEffect(() => {
    void obtenerDepartamentos()
  }, [obtenerDepartamentos])

  useEffect(() => {
    if (genero) {
      setGeneroError("")
    }
  }, [genero])

  useEffect(() => {
    if (imagenCapturada) {
      setSelfieError("")
    }
  }, [imagenCapturada])

  useEffect(() => {
    if (fechaNacimiento) {
      // Validar fecha de nacimiento
      const fechaNac = new Date(fechaNacimiento)
      const hoy = new Date()
      let edad = hoy.getFullYear() - fechaNac.getFullYear()
      const mes = hoy.getMonth() - fechaNac.getMonth()
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--
      }
      if (edad < 18) {
        setFechaNacimientoError("Debes tener al menos 18 años.")
      } else {
        setFechaNacimientoError("")
      }
    }
  }, [fechaNacimiento])

  useEffect(() => {
    if (departamentoSeleccionado) {
      setDepartamentoError("")
    }
  }, [departamentoSeleccionado])

  useEffect(() => {
    if (provinciaSeleccionada) {
      setProvinciaError("")
    }
  }, [provinciaSeleccionada])

  useEffect(() => {
    if (distritoSeleccionado) {
      setDistritoError("")
    }
  }, [distritoSeleccionado])

  const validarFormulario = useCallback(() => {
    let esValido = true

    if (!fechaNacimiento) {
      setFechaNacimientoError("Por favor, ingresa tu fecha de nacimiento.")
      esValido = false
    } else {
      // validar que la persona tenga al menos 18 años
      const fechaNac = new Date(fechaNacimiento)
      const hoy = new Date()
      let edad = hoy.getFullYear() - fechaNac.getFullYear()
      const mes = hoy.getMonth() - fechaNac.getMonth()
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--
      }
      if (edad < 18) {
        setFechaNacimientoError("Debes tener al menos 18 años.")
        esValido = false
      } else {
        setFechaNacimientoError("")
      }
    }
    if (!genero) {
      setGeneroError("Por favor, selecciona tu género.")
      esValido = false
    } else {
      setGeneroError("")
    }

    if (!imagenCapturada) {
      setSelfieError("Por favor, toma una selfie.")
      esValido = false
    } else {
      setSelfieError("")
    }

    if (!departamentoSeleccionado) {
      setDepartamentoError("Por favor, selecciona tu departamento.")
      esValido = false
    } else {
      setDepartamentoError("")
    }

    if (!provinciaSeleccionada) {
      setProvinciaError("Por favor, selecciona tu provincia.")
      esValido = false
    } else {
      setProvinciaError("")
    }

    if (!distritoSeleccionado) {
      setDistritoError("Por favor, selecciona tu distrito.")
      esValido = false
    } else {
      setDistritoError("")
    }

    return esValido
  }, [fechaNacimiento, genero, imagenCapturada, departamentoSeleccionado, provinciaSeleccionada, distritoSeleccionado])

  // const manejarEnvio = async (e: React.FormEvent) => {
  //   e.preventDefault()

  //   if (!validarFormulario()) {
  //     return
  //   }

  //   try {
  //     setCargando(true)

  //     let imagenComprimida = null
  //     // Solo comprimir la imagen si es una captura nueva (base64) y no una URL
  //     if (imagenCapturada && imagenCapturada.startsWith("data:")) {
  //       try {
  //         const imagenBase64 = await compressImage(imagenCapturada)
  //         const response = await fetch(imagenBase64)
  //         imagenComprimida = await response.blob()
  //       } catch (error) {
  //         console.error("Error al comprimir la imagen:", error)
  //         toast({
  //           title: "Error",
  //           description: "Error al procesar la imagen. Por favor, intenta de nuevo.",
  //           variant: "destructive",
  //         })
  //         return
  //       }
  //     }

  //     const datosFormulario = new FormData()
  //     datosFormulario.append("reparto_registro_id", repartoRegistroId!)
  //     datosFormulario.append("fecha_nacimiento", fechaNacimiento)
  //     datosFormulario.append("genero", genero)
  //     datosFormulario.append("ubigeo_id", distritoSeleccionado)

  //     if (imagenComprimida) {
  //       datosFormulario.append("selfie", imagenComprimida, "selfie.jpg")
  //     }

  //     // Determinar si es una actualización o creación
  //     const url = datosPersonalesId
  //       ? `${process.env.NEXT_PUBLIC_API_WEB}/datos-personales/${datosPersonalesId}`
  //       : `${process.env.NEXT_PUBLIC_API_WEB}/datos-personales`

  //     const respuesta = await fetch(url, {
  //       method: "POST",
  //       body: datosFormulario,
  //     })

  //     if (!respuesta.ok) {
  //       const contentType = respuesta.headers.get("content-type")
  //       if (contentType?.includes("application/json")) {
  //         const datosError = await respuesta.json()
  //         throw new Error(datosError.message || "Error al enviar el formulario")
  //       }
  //       throw new Error("Error al enviar el formulario")
  //     }

  //     // SOLUCIÓN: Actualizar el token con el siguiente paso antes de redirigir
  //     try {
  //       console.log("Actualizando token para avanzar a documentos")

  //       // Crear un nuevo token directamente
  //       if (repartoRegistroId) {
  //         const newToken = await createRepartoToken(repartoRegistroId, "/reparto/documentos")

  //         if (newToken) {
  //           console.log("Token creado correctamente para documentos")

  //           // Asegurar que el paso actual se actualice en sessionStorage
  //           sessionStorage.setItem("repartoCurrentStep", "/reparto/documentos")

  //           // Mantener el ID en sessionStorage para la siguiente página
  //           sessionStorage.setItem("repartoRegistroId", repartoRegistroId)

  //           // Añadir un pequeño retraso para asegurar que todo se guarde
  //           setTimeout(() => {
  //             // Usar un enfoque diferente para la redirección
  //             window.location.href = "/reparto/documentos"
  //           }, 300)
  //         } else {
  //           console.error("Error al crear el token")
  //           // Intentar redirección directa en caso de error
  //           router.push("/reparto/documentos")
  //         }
  //       } else {
  //         console.error("No se encontró ID de registro")
  //         router.push("/reparto/documentos")
  //       }
  //     } catch (tokenError) {
  //       console.error("Error al crear el token:", tokenError)
  //       // Intentar redirección directa en caso de error
  //       router.push("/reparto/documentos")
  //     }
  //   } catch (error) {
  //     console.error("Error al enviar el formulario:", error)
  //     toast({
  //       title: "Error",
  //       description:
  //         error instanceof Error
  //           ? error.message
  //           : "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setCargando(false)
  //   }
  // }

const manejarEnvio = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validarFormulario()) {
    return
  }

  try {
    setCargando(true)

    let imagenComprimida = imagenCapturada

    // Solo comprimir la imagen si es una captura nueva (base64)
    if (imagenCapturada && imagenCapturada.startsWith("data:")) {
      try {
        imagenComprimida = await compressImage(imagenCapturada)
      } catch (error) {
        console.error("Error al comprimir la imagen:", error)
        setSelfieError("Error al procesar la imagen. Por favor, intenta de nuevo.")
        return
      }
    }

    // Guardar datos en el almacenamiento local con IndexedDB
    const datosPersonales = {
      fecha_nacimiento: fechaNacimiento,
      genero: genero,
      ubigeo_id: distritoSeleccionado,
      selfie: imagenComprimida,
      departamento: departamentoSeleccionado,
      provincia: provinciaSeleccionada,
    }

    // ✅ GUARDAR CON INDEXEDDB (async)
    await FormDataServiceV2.guardarDatosPersonales(datosPersonales)

    // Actualizar el paso actual
    sessionStorage.setItem("repartoCurrentStep", "/reparto/documentos")

    // Redireccionar al siguiente paso
    router.push("/reparto/documentos")
  } catch (error) {
    console.error("Error al procesar datos:", error)

    let mensaje = "Hubo un problema al procesar el formulario. Por favor, intenta de nuevo."
    if (error instanceof Error) {
      if (error.message.includes("fetch") || error.message.includes("network")) {
        mensaje = "Error de conexión. Por favor, verifica tu internet e intenta nuevamente."
      } else {
        mensaje = error.message
      }
    }

    toast({
      title: "Error",
      description: mensaje,
      variant: "destructive",
    })
  } finally {
    setCargando(false)
  }
}

  if (!repartoRegistroId) return null

  if (cargandoDatos) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={manejarEnvio} aria-label="Formulario de datos personales">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
          <input
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            required
            max={(() => {
              const date = new Date()
              date.setFullYear(date.getFullYear() - 18)
              return date.toISOString().split("T")[0]
            })()}
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-required="true"
          />
          {fechaNacimientoError && <p className="text-sm text-red-500 mt-1">{fechaNacimientoError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="genero">Género</Label>
          <Select value={genero} onValueChange={setGenero} name="genero">
            <SelectTrigger id="genero" aria-required="true">
              <SelectValue placeholder="Selecciona tu género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="femenino">Femenino</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
          {generoError && <p className="text-sm text-red-500 mt-1">{generoError}</p>}
        </div>

        <div className="space-y-2">
          <Label id="selfie-label">Tómate una selfie</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center space-y-4" aria-labelledby="selfie-label">
            <CapturarImagen onCapture={manejarCaptura} />
            {imagenCapturada && (
              <div className="mt-4">
                <p className="text-xs md:text-sm text-gray-500 mb-2">Imagen capturada:</p>
                <Image
                  src={imagenCapturada || "/placeholder.svg"}
                  alt="Selfie capturada"
                  width={200}
                  height={150}
                  className="max-w-[200px] h-auto rounded-lg mx-auto"
                />
              </div>
            )}
            {selfieError && <p className="text-sm text-red-500 mt-1">{selfieError}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="departamento">Departamento</Label>
          <Select value={departamentoSeleccionado} onValueChange={manejarCambioDepartamento} name="departamento">
            <SelectTrigger id="departamento" aria-required="true">
              <SelectValue placeholder="Selecciona tu departamento" />
            </SelectTrigger>
            <SelectContent>
              {departamentos.map((departamento) => (
                <SelectItem key={departamento.id_ubigeo} value={departamento.departamento}>
                  {departamento.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {departamentoError && <p className="text-sm text-red-500 mt-1">{departamentoError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="provincia">Provincia</Label>
          <Select
            value={provinciaSeleccionada}
            onValueChange={manejarCambioProvincia}
            disabled={!departamentoSeleccionado}
            name="provincia"
          >
            <SelectTrigger id="provincia" aria-required="true">
              <SelectValue placeholder="Selecciona tu provincia" />
            </SelectTrigger>
            <SelectContent>
              {provincias.map((provincia) => (
                <SelectItem key={provincia.id_ubigeo} value={provincia.provincia}>
                  {provincia.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {provinciaError && <p className="text-sm text-red-500 mt-1">{provinciaError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="distrito">Distrito</Label>
          <Select
            value={distritoSeleccionado}
            onValueChange={setDistritoSeleccionado}
            disabled={!provinciaSeleccionada}
            name="distrito"
          >
            <SelectTrigger id="distrito" aria-required="true">
              <SelectValue placeholder="Selecciona tu distrito" />
            </SelectTrigger>
            <SelectContent>
              {distritos.map((distrito) => (
                <SelectItem key={distrito.id_ubigeo} value={distrito.id_ubigeo.toString()}>
                  {distrito.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {distritoError && <p className="text-sm text-red-500 mt-1">{distritoError}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4 mb-20">
        <Button
          type="submit"
          className="bg-red-500 hover:bg-red-600 text-white"
          disabled={cargando}
          aria-busy={cargando}
        >
          {cargando ? "Guardando..." : "Guardar y Continuar"}
        </Button>
      </div>
    </form>
  )
}
