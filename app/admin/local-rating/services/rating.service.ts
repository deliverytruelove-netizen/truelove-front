// app\admin\local-rating\services\rating.service.ts
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

// Definir interfaces para los tipos de datos
export interface Local {
  id: number
  nombre: string
  direccion: string
  ciudad: string
  business_id: number
  empresa: string
  logo: string | null
  puntuacion: number
  pedidoCount: number
  latitud: number
  longitud: number
}

export interface Comentario {
  id: number
  comentario: string
  rating: string
  cliente: string
}

export interface RestaurantInfo {
  id: string
  comentarios: Comentario[]
  pedidoCount: number
  rating: string
  ratingCounts: {
    "1": number
    "2": number
    "3": number
    "4": number
    "5": number
  }
}

/**
 * Obtiene todos los locales disponibles
 */
export const fetchLocales = async (): Promise<Local[]> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    // Realizar la petición a la API
    const response = await axios.get(`${API_URL}/admin/locales/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    // Verificar si la respuesta es correcta
    if (response.status !== 200) {
      throw new Error("Error al obtener los locales")
    }

    // Retornar los datos
    return response.data.data || []
  } catch (error) {
    console.error("Error al obtener locales:", error)
    throw error
  }
}

/**
 * Obtiene información detallada de un restaurante, incluyendo comentarios y estadísticas
 */
export const fetchRestaurantInfo = async (localId: number): Promise<RestaurantInfo> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    // Realizar la petición a la API
    const response = await axios.get(`${API_URL}/getRestaurante/${localId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    // Verificar si la respuesta es correcta
    if (response.status !== 200) {
      throw new Error("Error al obtener la información del restaurante")
    }

    // Retornar los datos
    return response.data || {}
  } catch (error) {
    console.error("Error al obtener información del restaurante:", error)
    throw error
  }
}
