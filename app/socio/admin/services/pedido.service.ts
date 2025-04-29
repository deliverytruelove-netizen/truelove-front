const API_URL = process.env.NEXT_PUBLIC_API_WEB

export interface Pedido {
  id: number
  id_cliente: number
  id_local: number
  id_motorizado?: number
  latitud: string
  longitud: string
  created_at: string
  updated_at: string
  detalle: string
  local: string
  direccion_local: string
  direccion_entrega: string
  cliente: string
  celular: string
  lat_local: string
  lon_local: string
  ultimo_estado_tracking: string
  estado: string
}

export const fetchPedidos = async (): Promise<Pedido[]> => {
  try {
    const token = localStorage.getItem("authToken")

    // Intentar obtener el ID del socio directamente
    let socioId: string | null = localStorage.getItem("socioId")

    // Si no existe socioId directo, intentar extraerlo del objeto user
    if (!socioId) {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          // Primero intentar obtener el ID del businessRegistration
          if (user && user.businessRegistration && user.businessRegistration.id) {
            socioId = user.businessRegistration.id.toString()
            // Guardar para futuros usos
            if (socioId) {
              localStorage.setItem("socioId", socioId)
            }
          }
          // Si no hay businessRegistration, usar el ID del usuario
          else if (user && user.id) {
            socioId = user.id.toString()
            // Guardar para futuros usos
            if (socioId) {
              localStorage.setItem("socioId", socioId)
            }
          }
        } catch (e) {
          console.error("Error al parsear datos de usuario:", e)
        }
      }
    }

    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    if (!socioId) {
      throw new Error("No se encontró el ID del socio")
    }

    console.log("Usando socioId:", socioId) // Para depuración

    const response = await fetch(`${API_URL}/socio/pedidos/${socioId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al obtener los pedidos")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en fetchPedidos:", error)
    throw error
  }
}

export const actualizarEstadoPedido = async (pedidoId: number, estado: number): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    const response = await fetch(`${API_URL}/socio/pedidos/update-estado/${pedidoId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al actualizar el estado del pedido")
    }

    return
  } catch (error) {
    console.error("Error en actualizarEstadoPedido:", error)
    throw error
  }
}

export const getEstadoLabel = (estado: string): { label: string; color: string } => {
  switch (estado) {
    case "Pendiente":
      return { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" }
    case "Aceptado":
      return { label: "Aceptado", color: "bg-blue-100 text-blue-800" }
    case "En preparación":
      return { label: "En preparación", color: "bg-indigo-100 text-indigo-800" }
    case "Listo para entrega":
      return { label: "Listo para entrega", color: "bg-purple-100 text-purple-800" }
    case "En camino":
      return { label: "En camino", color: "bg-orange-100 text-orange-800" }
    case "Entregado":
      return { label: "Entregado", color: "bg-green-100 text-green-800" }
    case "Cancelado":
      return { label: "Cancelado", color: "bg-red-100 text-red-800" }
    default:
      return { label: "Sin seguimiento", color: "bg-gray-100 text-gray-800" }
  }
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}
