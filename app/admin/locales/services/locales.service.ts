// app\admin\locales\services\locales.service.ts
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
  prioridad: number
  latitud: number
  longitud: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

/**
 * Obtiene todos los locales ordenados por prioridad con paginación
 */
export const fetchLocales = async (
  page = 1,
  perPage = 10,
  filters?: {
    search?: string
    city?: string
    priorityLevel?: "alta" | "media" | "baja" | "todos"
  },
): Promise<PaginatedResponse<Local>> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    // Construir los parámetros de la consulta
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    }

    // Añadir filtros si existen
    if (filters?.search) {
      params.search = filters.search
    }

    if (filters?.city && filters.city !== "all") {
      params.city = filters.city
    }

    if (filters?.priorityLevel && filters.priorityLevel !== "todos") {
      params.priority_level = filters.priorityLevel
    }

    // Realizar la petición a la API
    const response = await axios.get(`${API_URL}/admin/locales/prioridad`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params,
    })

    // Verificar si la respuesta es correcta
    if (response.status !== 200) {
      throw new Error("Error al obtener los locales")
    }

    // Si la API no devuelve metadatos de paginación, crear una estructura compatible
    if (!response.data.meta) {
      return {
        data: response.data.data || [],
        meta: {
          total: response.data.data?.length || 0,
          per_page: perPage,
          current_page: page,
          last_page: Math.ceil((response.data.data?.length || 0) / perPage),
        },
      }
    }

    // Retornar los datos con metadatos de paginación
    return response.data
  } catch (error) {
    console.error("Error al obtener locales:", error)
    throw error
  }
}

/**
 * Actualiza la prioridad de un local específico
 */
export const updateLocalPriority = async (localId: number, prioridad: number): Promise<void> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    // Validar que la prioridad sea un número válido (mayor o igual a 0)
    if (prioridad < 0) {
      throw new Error("La prioridad debe ser un número positivo")
    }

    // Realizar la petición a la API
    const response = await axios.post(
      `${API_URL}/admin/locales/prioridad/${localId}`,
      { prioridad },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    // Verificar si la respuesta es correcta
    if (response.status !== 200) {
      throw new Error("Error al actualizar la prioridad")
    }
  } catch (error) {
    console.error("Error al actualizar prioridad:", error)
    throw error
  }
}

/**
 * Obtiene estadísticas sobre las prioridades de los locales
 */
export interface PriorityStats {
  totalLocales: number
  highPriorityLocales: number
  mediumPriorityLocales: number
  lowPriorityLocales: number
}

export const fetchPriorityStats = async (): Promise<PriorityStats> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    // Realizar la petición a la API
    const response = await axios.get(`${API_URL}/admin/locales/prioridad/estadisticas`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    // Verificar si la respuesta es correcta
    if (response.status !== 200) {
      throw new Error("Error al obtener las estadísticas de prioridad")
    }

    // Retornar los datos
    return (
      response.data.data || {
        totalLocales: 0,
        highPriorityLocales: 0,
        mediumPriorityLocales: 0,
        lowPriorityLocales: 0,
      }
    )
  } catch (error) {
    console.error("Error al obtener estadísticas de prioridad:", error)
    throw error
  }
}

// Añadir una nueva función para obtener el total de locales
export const getTotalLocales = async (): Promise<number> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    // Realizar la petición a la API para obtener estadísticas
    const stats = await fetchPriorityStats()

    // Retornar el total de locales
    return stats.totalLocales
  } catch (error) {
    console.error("Error al obtener el total de locales:", error)
    throw error
  }
}
