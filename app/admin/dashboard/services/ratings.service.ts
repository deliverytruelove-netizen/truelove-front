// app/admin/dashboard/services/ratings.service.ts
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

export interface RatingData {
  id: number
  ratingCounts: { star: number; count: number }[]
  ratingsByDate: { date: string; count: number }[]
  totalRatings: number
}

/**
 * Obtiene los datos de calificaciones para un local específico
 * @param localId ID del local
 * @returns Datos de calificaciones
 */
export const fetchLocalRatings = async (localId: number): Promise<RatingData> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("authToken")

    // Verificar si existe el token
    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    // Configuración de headers para las peticiones
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }

    // Obtener los datos de calificaciones
    const response = await axios.get(API_URL + `/reviews/${localId}`, { headers })
    
    return response.data
  } catch (error) {
    console.error("Error al obtener datos de calificaciones:", error)
    throw error
  }
}