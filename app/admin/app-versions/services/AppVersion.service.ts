import axios from 'axios'
import type { AppVersion, AppVersionApiResponse } from '../types/AppVersion.types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_WEB

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

export const fetchAppVersions = async (): Promise<AppVersion[]> => {
  try {
    const response = await axios.get<AppVersionApiResponse>(
      `${API_BASE_URL}/admin/app-versions`,
      { headers: getAuthHeaders() }
    )

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al obtener las versiones de las apps')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      throw new Error(message)
    }
    throw error
  }
}

export const updateAppVersion = async ({
  id,
  data
}: {
  id: number
  data: Partial<AppVersion>
}): Promise<AppVersion> => {
  try {
    const response = await axios.put<AppVersionApiResponse>(
      `${API_BASE_URL}/admin/app-versions/${id}`,
      data,
      { headers: getAuthHeaders() }
    )

    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Error al actualizar la versión')
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
