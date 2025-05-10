// app\admin\promociones\services\promosiones.service.ts
// Servicio para gestionar promociones
import axios from "axios"

// URL base de la API desde variables de entorno
const API_URL = process.env.NEXT_PUBLIC_API_WEB

// Interfaz para la promoción
export interface Promocion {
  id?: number
  titulo: string
  subtitulo: string
  imagen?: string | File
  estado: boolean
}

// Obtener promociones con soporte para paginación y búsqueda
export const getPromociones = async (
  page = 1, 
  limit = 10, 
  search = "",
  showAll = true
): Promise<{data: Promocion[], total: number, page: number, lastPage: number}> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    const response = await axios.get(`${API_URL}/promociones`, {
      params: { page, limit, search, showAll },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    
    // Transformar la respuesta para asegurar un formato consistente
    return {
      data: response.data.data || response.data, 
      total: response.data.total || response.data.length,
      page: response.data.current_page || page,
      lastPage: response.data.last_page || Math.ceil((response.data.total || response.data.length) / limit)
    }
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    throw error
  }
}

/**
 * Obtiene una promoción específica por ID
 */
export const getPromocionById = async (id: number): Promise<Promocion> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    const response = await axios.get(`${API_URL}/promociones/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error al obtener promoción con ID ${id}:`, error)
    throw error
  }
}

/**
 * Crea una nueva promoción
 */
export const createPromocion = async (promocionData: FormData): Promise<Promocion> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    const response = await axios.post(`${API_URL}/promociones`, promocionData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error al crear promoción:", error)
    throw error
  }
}

/**
 * Actualiza una promoción existente
 */
export const updatePromocion = async (id: number, promocionData: FormData): Promise<Promocion> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    // Para asegurar que la API procese correctamente la actualización
    // Añadimos el método _method para simular PUT si es necesario
    promocionData.append('_method', 'PUT')
    
    const response = await axios.post(`${API_URL}/promociones/${id}`, promocionData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error al actualizar promoción con ID ${id}:`, error)
    throw error
  }
}

/**
 * Elimina una promoción
 */
export const deletePromocion = async (id: number): Promise<void> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    await axios.delete(`${API_URL}/promociones/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error(`Error al eliminar promoción con ID ${id}:`, error)
    throw error
  }
}