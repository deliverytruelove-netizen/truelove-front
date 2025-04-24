"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Pedido, EstadisticasData, Usuario, PerfilData } from "../types"
import { obtenerPedidos, calcularEstadisticas, iniciarViaje, actualizarEstadoPedido } from "../services/api"
import { obtenerDatosRepartidor, verificarRolMotorizado } from "../services/auth"

interface MotorizadoContextType {
  pedidos: Pedido[]
  estadisticas: EstadisticasData
  usuario: Usuario | null
  perfilData: PerfilData | null
  loading: boolean
  error: string | null
  actualizarPedidos: () => Promise<void>
  actualizarEstadisticas: () => Promise<void>
  iniciarEntrega: (idPedido: number) => Promise<void>
  confirmarEntrega: (idPedido: number) => Promise<void>
  abrirMapa: (lat: number, lon: number) => void
  llamarCliente: (telefono: string) => void
}

const MotorizadoContext = createContext<MotorizadoContextType | undefined>(undefined)

export const MotorizadoProvider = ({ children }: { children: ReactNode }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasData>({
    totalPedidos: 0,
    pedidosEntregados: 0,
    tiempoPromedio: 0,
    calificacion: 0,
    cambioTotal: 0,
    cambioEntregados: 0,
    cambioTiempo: 0,
    cambioCalificacion: 0,
  })
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [perfilData, setPerfilData] = useState<PerfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Envolver las funciones de actualización en useCallback para evitar recreaciones innecesarias
  const actualizarPedidos = useCallback(async () => {
    try {
      setError(null)
      const data = await obtenerPedidos()
      setPedidos(data)
    } catch (error) {
      console.error("Error al obtener pedidos:", error)
      setError("No se pudieron cargar los pedidos. Intenta nuevamente.")
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      })
    }
  }, [toast])

  const actualizarEstadisticas = useCallback(async () => {
    try {
      const data = await calcularEstadisticas()
      setEstadisticas(data)
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
    }
  }, [])

  // Verificar autenticación y cargar datos del repartidor
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1]

        if (!token) {
          toast({
            title: "Sesión no válida",
            description: "Por favor inicia sesión nuevamente",
            variant: "destructive",
          })
          setTimeout(() => {
            router.push("/login")
          }, 2000)
          return
        }

        // Verificar si el usuario es un motorizado
        if (!verificarRolMotorizado()) {
          toast({
            title: "Acceso restringido",
            description: "No tienes permisos para acceder a esta sección",
            variant: "destructive",
          })
          setTimeout(() => {
            router.push("/login")
          }, 2000)
          return
        }

        // Cargar datos del usuario desde localStorage
        try {
          const userData = localStorage.getItem("user")
          if (userData) {
            const user = JSON.parse(userData)
            setUsuario({
              id: user.id,
              name: user.name || "",
              email: user.email || "",
              usuario: user.usuario || "",
              foto_perfil: user.foto_perfil || undefined,
            })
          }
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error)
        }

        // Obtener datos del repartidor
        try {
          const datosRepartidor = await obtenerDatosRepartidor()
          setPerfilData(datosRepartidor)
        } catch (error) {
          console.error("Error al obtener datos del repartidor:", error)
        }

        // Cargar datos iniciales
        await Promise.all([actualizarPedidos(), actualizarEstadisticas()])
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, toast, actualizarPedidos, actualizarEstadisticas])

  // Actualizar ubicación del motorizado periódicamente
  useEffect(() => {
    const updateLocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords
              const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("authToken="))
                ?.split("=")[1]

              const userId = usuario?.id

              if (!token || !userId) return

              await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/biker/location/update`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  motorizado_id: userId,
                  latitude,
                  longitude,
                }),
              })
            } catch (error) {
              console.error("Error al actualizar ubicación:", error)
            }
          },
          (error) => {
            console.error("Error al obtener ubicación:", error)
          },
        )
      }
    }

    // Actualizar ubicación cada 2 minutos
    const locationInterval = setInterval(updateLocation, 120000)
    updateLocation() // Actualizar inmediatamente al cargar

    return () => clearInterval(locationInterval)
  }, [usuario])

  // Actualizar pedidos periódicamente
  useEffect(() => {
    // Actualizar pedidos cada 2 minutos
    const pedidosInterval = setInterval(() => {
      actualizarPedidos()
    }, 120000)

    return () => clearInterval(pedidosInterval)
  }, [actualizarPedidos])

  // Actualizar estadísticas periódicamente
  useEffect(() => {
    // Actualizar estadísticas cada 5 minutos
    const estadisticasInterval = setInterval(() => {
      actualizarEstadisticas()
    }, 300000)

    return () => clearInterval(estadisticasInterval)
  }, [actualizarEstadisticas])

  const iniciarEntrega = async (idPedido: number) => {
    try {
      await iniciarViaje(idPedido)
      setPedidos(pedidos.map((pedido) => (pedido.id === idPedido ? { ...pedido, estado: "En camino" } : pedido)))
      toast({
        title: "Viaje iniciado",
        description: "Has iniciado el viaje para entregar el pedido",
      })
    } catch (error) {
      console.error("Error al iniciar viaje:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el viaje",
        variant: "destructive",
      })
    }
  }

  const confirmarEntrega = async (idPedido: number) => {
    try {
      await actualizarEstadoPedido(idPedido, "Entregado")
      setPedidos(pedidos.map((pedido) => (pedido.id === idPedido ? { ...pedido, estado: "Entregado" } : pedido)))
      await actualizarEstadisticas() // Actualizar estadísticas después de entregar
      toast({
        title: "Entrega confirmada",
        description: "El pedido ha sido marcado como entregado",
      })
    } catch (error) {
      console.error("Error al confirmar entrega:", error)
      toast({
        title: "Error",
        description: "No se pudo confirmar la entrega",
        variant: "destructive",
      })
    }
  }

  const abrirMapa = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, "_blank")
  }

  const llamarCliente = (telefono: string) => {
    window.open(`tel:${telefono}`, "_self")
  }

  const value = {
    pedidos,
    estadisticas,
    usuario,
    perfilData,
    loading,
    error,
    actualizarPedidos,
    actualizarEstadisticas,
    iniciarEntrega,
    confirmarEntrega,
    abrirMapa,
    llamarCliente,
  }

  return <MotorizadoContext.Provider value={value}>{children}</MotorizadoContext.Provider>
}

export const useMotorizado = () => {
  const context = useContext(MotorizadoContext)
  if (context === undefined) {
    throw new Error("useMotorizado debe ser usado dentro de un MotorizadoProvider")
  }
  return context
}
