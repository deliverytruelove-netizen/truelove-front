// app\admin\promociones\services\banner.service.ts
// Servicio para gestionar banners
import axios from "axios"

// URL base de la API desde variables de entorno
const API_URL = process.env.NEXT_PUBLIC_API_WEB

// Interfaz para el banner
interface Banner {
  id?: number
  titulo: string
  subtitulo: string
  color_fondo: string
  texto_boton: string
  url_boton: string
  url_imagen?: string | File
  estado: boolean
}

// Modificar la función getBanners para soportar paginación y búsqueda
export const getBanners = async (
  page = 1, 
  limit = 10, 
  search = "",
  showAll = true
): Promise<{data: Banner[], total: number, page: number, lastPage: number}> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    const response = await axios.get(`${API_URL}/banners`, {
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
    console.error("Error al obtener banners:", error)
    throw error
  }
}

/**
 * Obtiene un banner específico por ID
 */
export const getBannerById = async (id: number): Promise<Banner> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    const response = await axios.get(`${API_URL}/banners/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error al obtener banner con ID ${id}:`, error)
    throw error
  }
}

/**
 * Crea un nuevo banner
 */
export const createBanner = async (bannerData: FormData): Promise<Banner> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    const response = await axios.post(`${API_URL}/banners`, bannerData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error al crear banner:", error)
    throw error
  }
}

/**
 * Actualiza un banner existente
 */
export const updateBanner = async (id: number, bannerData: FormData): Promise<Banner> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    // Para asegurar que la API procese correctamente la actualización
    // Añadimos el método _method para simular PUT si es necesario
    bannerData.append('_method', 'PUT')
    
    const response = await axios.post(`${API_URL}/banners/${id}`, bannerData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error al actualizar banner con ID ${id}:`, error)
    throw error
  }
}

/**
 * Elimina un banner
 */
export const deleteBanner = async (id: number): Promise<void> => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")

  try {
    await axios.delete(`${API_URL}/banners/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error(`Error al eliminar banner con ID ${id}:`, error)
    throw error
  }
}