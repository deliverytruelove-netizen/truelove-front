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

// Servicios para el sistema de rangos
import type { 
  TarifaConfiguracion, 
  CalculadoraRequest, 
  CalculadoraResponse, 
  LocalOption, 
  ClienteOption,
  LocalConConfig,
} from '../types/KilometrosTarifa.types'

interface TarifaConfiguracionApiResponse {
  success: boolean
  data?: TarifaConfiguracion | TarifaConfiguracion[]
  message?: string
  errors?: Record<string, string[]>
}

export const fetchTarifasRangos = async (): Promise<TarifaConfiguracion[]> => {
  try {
    const response = await axios.get<TarifaConfiguracionApiResponse>(
      `${API_BASE_URL}/admin/tarifas-rangos`,
      { headers: getAuthHeaders() }
    )

    if (response.data.success) {
      // La API ahora devuelve un solo objeto (no array) porque solo hay una configuración
      // Lo convertimos a array para mantener compatibilidad con el frontend
      if (Array.isArray(response.data.data)) {
        return response.data.data
      } else if (response.data.data) {
        return [response.data.data]
      }
    }

    throw new Error(response.data.message || 'Error al obtener las configuraciones de rangos')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const createTarifaRango = async (data: Partial<TarifaConfiguracion>): Promise<TarifaConfiguracion> => {
  try {
    const response = await axios.post<TarifaConfiguracionApiResponse>(
      `${API_BASE_URL}/admin/tarifas-rangos`,
      data,
      { headers: getAuthHeaders() }
    )

    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al crear la configuración')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data
      if (errorData?.errors) {
        const errorMessages = Object.values(errorData.errors).flat().join(', ')
        throw new Error(errorMessages)
      }
      const message = errorData?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const updateTarifaRango = async ({
  id,
  data
}: {
  id: number
  data: Partial<TarifaConfiguracion>
}): Promise<TarifaConfiguracion> => {
  try {
    const response = await axios.put<TarifaConfiguracionApiResponse>(
      `${API_BASE_URL}/admin/tarifas-rangos/${id}`,
      data,
      { headers: getAuthHeaders() }
    )

    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al actualizar la configuración')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data
      if (errorData?.errors) {
        const errorMessages = Object.values(errorData.errors).flat().join(', ')
        throw new Error(errorMessages)
      }
      const message = errorData?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const deleteTarifaRango = async (id: number): Promise<void> => {
  try {
    const response = await axios.delete<TarifaConfiguracionApiResponse>(
      `${API_BASE_URL}/admin/tarifas-rangos/${id}`,
      { headers: getAuthHeaders() }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar la configuración')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const activarTarifaRango = async (id: number): Promise<TarifaConfiguracion> => {
  try {
    const response = await axios.post<TarifaConfiguracionApiResponse>(
      `${API_BASE_URL}/admin/tarifas-rangos/${id}/activar`,
      {},
      { headers: getAuthHeaders() }
    )

    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al activar la configuración')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const calcularPreview = async (request: CalculadoraRequest): Promise<CalculadoraResponse> => {
  try {
    const response = await axios.post<CalculadoraResponse>(
      `${API_BASE_URL}/admin/tarifas-rangos/calcular-preview`,
      request,
      { headers: getAuthHeaders() }
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const fetchLocales = async (): Promise<LocalOption[]> => {
  try {
    const response = await axios.get<{ success: boolean; data: LocalOption[] }>(
      `${API_BASE_URL}/admin/tarifas-rangos/locales`,
      { headers: getAuthHeaders() }
    )

    if (response.data.success) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error('Error fetching locales:', error)
    return []
  }
}

export const fetchClientes = async (): Promise<ClienteOption[]> => {
  try {
    const response = await axios.get<{ success: boolean; data: ClienteOption[] }>(
      `${API_BASE_URL}/admin/tarifas-rangos/clientes`,
      { headers: getAuthHeaders() }
    )

    if (response.data.success) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error('Error fetching clientes:', error)
    return []
  }
}

export const fetchLocalesConConfig = async (): Promise<LocalConConfig[]> => {
  try {
    const response = await axios.get<{ success: boolean; data: LocalConConfig[] }>(
      `${API_BASE_URL}/admin/tarifas-rangos/locales-con-config`,
      { headers: getAuthHeaders() }
    )
    if (response.data.success) return response.data.data
    return []
  } catch (error) {
    console.error('Error fetching locales con config:', error)
    return []
  }
}

export const fetchConfigLocal = async (idLocal: number): Promise<{ data: TarifaConfiguracion | null; usa_global: boolean }> => {
  try {
    const response = await axios.get<{ success: boolean; data: TarifaConfiguracion | null; usa_global: boolean }>(
      `${API_BASE_URL}/admin/tarifas-rangos/config-local/${idLocal}`,
      { headers: getAuthHeaders() }
    )
    return { data: response.data.data ?? null, usa_global: response.data.usa_global }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Error al obtener config del local')
    }
    throw error
  }
}

export const saveConfigLocal = async (idLocal: number, data: Partial<TarifaConfiguracion>): Promise<TarifaConfiguracion> => {
  try {
    const response = await axios.post<TarifaConfiguracionApiResponse>(
      `${API_BASE_URL}/admin/tarifas-rangos/config-local/${idLocal}`,
      data,
      { headers: getAuthHeaders() }
    )
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Error al guardar config del local')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data
      if (errorData?.errors) {
        const msgs = Object.values(errorData.errors).flat().join(', ')
        throw new Error(msgs)
      }
      throw new Error(errorData?.message || 'Error de conexión')
    }
    throw error
  }
}

export const deleteConfigLocal = async (idLocal: number): Promise<void> => {
  try {
    const response = await axios.delete<{ success: boolean; message: string }>(
      `${API_BASE_URL}/admin/tarifas-rangos/config-local/${idLocal}`,
      { headers: getAuthHeaders() }
    )
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar config del local')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Error de conexión')
    }
    throw error
  }
}