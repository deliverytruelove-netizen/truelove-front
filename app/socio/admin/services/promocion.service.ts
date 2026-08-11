// app\socio\admin\services\promocion.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB

export interface Promocion {
  id?: number
  titulo: string
  subtitulo: string
  imagen?: string | File
  estado: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

const getAuthToken = () => {
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1]

  if (cookieToken) {
    return cookieToken.startsWith("Bearer ") ? cookieToken : `Bearer ${cookieToken}`
  }

  const localStorageToken = localStorage.getItem("authToken")

  if (localStorageToken) {
    return localStorageToken.startsWith("Bearer ") ? localStorageToken : `Bearer ${localStorageToken}`
  }

  return null
}

export const getPromocionesSocio = async (): Promise<Promocion[]> => {
  const response = await fetch(`${API_URL}/socio/promociones`, {
    headers: {
      Authorization: getAuthToken() || "",
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error al obtener las promociones")
  }

  const data: ApiResponse<Promocion[]> = await response.json()
  return data.data
}

export const createPromocionSocio = async (formData: FormData): Promise<Promocion> => {
  const response = await fetch(`${API_URL}/socio/promociones`, {
    method: "POST",
    headers: {
      Authorization: getAuthToken() || "",
      Accept: "application/json",
    },
    body: formData,
  })

  const data: ApiResponse<Promocion> = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Error al crear la promoción")
  }

  return data.data
}

export const updatePromocionSocio = async (id: number, formData: FormData): Promise<Promocion> => {
  formData.append("_method", "PUT")

  const response = await fetch(`${API_URL}/socio/promociones/${id}`, {
    method: "POST",
    headers: {
      Authorization: getAuthToken() || "",
      Accept: "application/json",
    },
    body: formData,
  })

  const data: ApiResponse<Promocion> = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Error al actualizar la promoción")
  }

  return data.data
}

export const deletePromocionSocio = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/socio/promociones/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: getAuthToken() || "",
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message || "Error al eliminar la promoción")
  }
}
