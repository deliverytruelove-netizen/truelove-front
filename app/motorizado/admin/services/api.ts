import { Pedido, EstadisticasData, PerfilData } from "../types"

const API_URL = process.env.NEXT_PUBLIC_API_WEB || ""

// Función para obtener el token de autenticación
export const getAuthToken = (): string | null => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1] || null
}

// Función para obtener el ID del usuario
export const getUserId = (): number | null => {
  try {
    const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : {}
    return userObj.id || null
  } catch (error) {
    console.error("Error al obtener ID de usuario:", error)
    return null
  }
}

// Servicio para obtener pedidos
export const obtenerPedidos = async (): Promise<Pedido[]> => {
  const token = getAuthToken()
  const userId = getUserId()

  if (!token || !userId) {
    throw new Error("No se encontró el token de autenticación o ID de usuario")
  }

  const response = await fetch(`${API_URL}/biker/get/pedidos/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error al obtener pedidos")
  }

  return await response.json()
}

// Servicio para iniciar viaje
export const iniciarViaje = async (idPedido: number): Promise<void> => {
  const token = getAuthToken()
  const userId = getUserId()

  if (!token || !userId) {
    throw new Error("No se encontró el token de autenticación o ID de usuario")
  }

  const response = await fetch(`${API_URL}/biker/iniciar_viaje`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      id_pedido: idPedido,
      id_motorizado: userId,
    }),
  })

  if (!response.ok) {
    throw new Error("Error al iniciar viaje")
  }
}

// Servicio para actualizar estado de pedido
export const actualizarEstadoPedido = async (idPedido: number, nuevoEstado: string): Promise<void> => {
  const token = getAuthToken()

  if (!token) {
    throw new Error("No se encontró el token de autenticación")
  }

  const response = await fetch(`${API_URL}/update-estado/pedido`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      id: idPedido,
      estado: nuevoEstado,
    }),
  })

  if (!response.ok) {
    throw new Error("Error al actualizar estado")
  }
}

// Servicio para obtener perfil del motorizado
export const obtenerPerfilMotorizado = async (): Promise<PerfilData> => {
  const token = getAuthToken()
  const userId = getUserId()

  if (!token || !userId) {
    throw new Error("No se encontró el token de autenticación o ID de usuario")
  }

  const response = await fetch(`${API_URL}/biker/perfil/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error al obtener perfil del motorizado")
  }

  return await response.json()
}

// Servicio para obtener calificaciones
export const obtenerCalificaciones = async (): Promise<{ promedio: number; cambio: number }> => {
  const token = getAuthToken()
  const userId = getUserId()

  if (!token || !userId) {
    throw new Error("No se encontró el token de autenticación o ID de usuario")
  }

  const response = await fetch(`${API_URL}/ratings/biker/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    return { promedio: 0, cambio: 0 }
  }

  return await response.json()
}

// Servicio para actualizar ubicación del motorizado
export const actualizarUbicacion = async (latitude: number, longitude: number): Promise<void> => {
  const token = getAuthToken()
  const userId = getUserId()

  if (!token || !userId) {
    throw new Error("No se encontró el token de autenticación o ID de usuario")
  }

  await fetch(`${API_URL}/biker/location/update`, {
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
}

// Servicio para calcular estadísticas
export const calcularEstadisticas = async (): Promise<EstadisticasData> => {
  try {
    // Obtener pedidos
    const pedidos = await obtenerPedidos()
    
    // Obtener calificaciones
    const ratingData = await obtenerCalificaciones().catch(() => ({ promedio: 0, cambio: 0 }))
    
    // Calcular estadísticas
    const pedidosEntregados = pedidos.filter((p) => p.estado?.toLowerCase() === "entregado").length
    const tiemposEstimados = pedidos.filter((p) => p.tiempo_estimado).map((p) => p.tiempo_estimado)
    
    const tiempoPromedio =
      tiemposEstimados.length > 0
        ? Math.round(tiemposEstimados.reduce((a, b) => a + b, 0) / tiemposEstimados.length)
        : 0
    
    // Simular cambios para la demostración
    // En una implementación real, estos datos vendrían de la API
    const cambioTotal = pedidos.length > 0 ? Math.round(Math.random() * 3) : 0
    const cambioEntregados = pedidosEntregados > 0 ? Math.round(pedidosEntregados * 0.1) : 0
    const cambioTiempo = tiempoPromedio > 0 ? Math.round(Math.random() * 5) - 2 : 0
    
    return {
      totalPedidos: pedidos.length,
      pedidosEntregados,
      tiempoPromedio,
      calificacion: ratingData.promedio || 0,
      cambioTotal,
      cambioEntregados,
      cambioTiempo,
      cambioCalificacion: ratingData.cambio || 0,
    }
  } catch (error) {
    console.error("Error al calcular estadísticas:", error)
    return {
      totalPedidos: 0,
      pedidosEntregados: 0,
      tiempoPromedio: 0,
      calificacion: 0,
      cambioTotal: 0,
      cambioEntregados: 0,
      cambioTiempo: 0,
      cambioCalificacion: 0,
    }
  }
}
