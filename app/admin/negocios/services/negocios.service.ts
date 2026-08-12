// app\admin\negocios\services\negocios.service.ts
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

export interface Negocio {
  id: number
  nombre: string
  direccion: string
  ciudad: string
  business_id: number
  empresa: string
  logo: string | null
  banner: string | null
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

const authHeaders = () => {
  const token = localStorage.getItem("authToken")
  if (!token) {
    throw new Error("No se encontró el token de autenticación")
  }
  return { Authorization: `Bearer ${token}` }
}

/**
 * Reutiliza el mismo listado que "Prioridad de Locales" (ya trae logo/banner
 * y búsqueda/paginación), pero aquí solo nos interesan esos campos.
 */
export const fetchNegocios = async (
  page = 1,
  perPage = 12,
  search = "",
): Promise<PaginatedResponse<Negocio>> => {
  const response = await axios.get(`${API_URL}/admin/locales/prioridad`, {
    headers: authHeaders(),
    params: { page, per_page: perPage, search },
  })

  return response.data
}

export const uploadLogo = async (businessId: number, file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("logo", file)

  const response = await axios.post(`${API_URL}/admin/negocios/${businessId}/logo`, formData, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
  })

  return response.data.ruta_logo as string
}

export const uploadBanner = async (businessId: number, file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("banner", file)

  const response = await axios.post(`${API_URL}/admin/negocios/${businessId}/banner`, formData, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
  })

  return response.data.banner as string
}
