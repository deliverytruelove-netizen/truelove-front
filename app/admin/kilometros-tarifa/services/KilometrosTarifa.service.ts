import axios from 'axios'
import type { KilometrosTarifa, KilometrosTarifaApiResponse } from '../types/KilometrosTarifa.types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_WEB

// Función para obtener headers con token dinámico
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")

  if (!token) {
    throw new Error("No token found")
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export const fetchKilometrosTarifas = async (): Promise<KilometrosTarifa[]> => {
  try {
    const response = await axios.get<KilometrosTarifaApiResponse>(
      `${API_BASE_URL}/admin/kilometros-tarifa`,
      { headers: getAuthHeaders() }
    )

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al obtener las configuraciones de tarifa')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const fetchKilometrosTarifa = async (id: number): Promise<KilometrosTarifa> => {
  try {
    const response = await axios.get<KilometrosTarifaApiResponse>(
      `${API_BASE_URL}/admin/kilometros-tarifa/${id}`,
      { headers: getAuthHeaders() }
    )

    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al obtener la configuración de tarifa')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const createKilometrosTarifa = async (data: Partial<KilometrosTarifa>): Promise<KilometrosTarifa> => {
  try {
    const response = await axios.post<KilometrosTarifaApiResponse>(
      `${API_BASE_URL}/admin/kilometros-tarifa`,
      data,
      { headers: getAuthHeaders() }
    )

    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al crear la configuración de tarifa')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data
      if (errorData?.errors) {
        // Manejar errores de validación
        const errorMessages = Object.values(errorData.errors).flat().join(', ')
        throw new Error(errorMessages)
      }
      const message = errorData?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const updateKilometrosTarifa = async ({
  id,
  data
}: {
  id: number
  data: Partial<KilometrosTarifa>
}): Promise<KilometrosTarifa> => {
  try {
    const response = await axios.put<KilometrosTarifaApiResponse>(
      `${API_BASE_URL}/admin/kilometros-tarifa/${id}`,
      data,
      { headers: getAuthHeaders() }
    )

    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al actualizar la configuración de tarifa')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data
      if (errorData?.errors) {
        // Manejar errores de validación
        const errorMessages = Object.values(errorData.errors).flat().join(', ')
        throw new Error(errorMessages)
      }
      const message = errorData?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const deleteKilometrosTarifa = async (id: number): Promise<void> => {
  try {
    const response = await axios.delete<KilometrosTarifaApiResponse>(
      `${API_BASE_URL}/admin/kilometros-tarifa/${id}`,
      { headers: getAuthHeaders() }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar la configuración de tarifa')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const activarKilometrosTarifa = async (id: number): Promise<KilometrosTarifa> => {
  try {
    const response = await axios.post<KilometrosTarifaApiResponse>(
      `${API_BASE_URL}/admin/kilometros-tarifa/${id}/activar`,
      {},
      { headers: getAuthHeaders() }
    )

    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al activar la configuración de tarifa')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const fetchKilometrosTarifaActiva = async (): Promise<KilometrosTarifa | null> => {
  try {
    const response = await axios.get<KilometrosTarifaApiResponse>(
      `${API_BASE_URL}/admin/kilometros-tarifa/activa`,
      { headers: getAuthHeaders() }
    )

    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }

    return null
  } catch (error) {
    // Si no hay configuración activa, retornar null en lugar de error
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}