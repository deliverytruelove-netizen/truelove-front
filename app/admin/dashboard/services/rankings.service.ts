// app/admin/dashboard/services/rankings.service.ts
import axios from "axios"

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_WEB

// Interfaces para los datos de rankings
export interface TopClient {
  id: number
  nombre: string
  total_pedidos: number
}

export interface TopStore {
  id: number
  nombre: string
  total_pedidos: number
  puntuacion?: number
  logo?: string
}

export interface RankingsData {
  topClients: TopClient[]
  topStores: TopStore[]
}

/**
 * Función para obtener los rankings de clientes y locales
 * @returns Datos de los rankings
 */
export const fetchRankings = async (): Promise<RankingsData> => {
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

    // Obtener los top clientes
    const clientsResponse = await axios.get(API_URL + "/rankings/clients", { headers })
    const topClients = clientsResponse.data.data || []

    // Obtener los top locales
    const storesResponse = await axios.get(API_URL + "/rankings/stores", { headers })
    const topStores = storesResponse.data.data || []

    // Retornar los datos combinados
    return {
      topClients,
      topStores,
    }
  } catch (error) {
    console.error("Error al obtener datos de rankings:", error)
    // Devolver datos vacíos en caso de error
    return {
      topClients: [],
      topStores: [],
    }
  }
}