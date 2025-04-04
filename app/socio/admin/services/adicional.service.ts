// app\socio\admin\services\adicional.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB

export interface CategoriaAdicional {
  id: number
  nombre: string
  empresa_id: string
}

export interface Adicional {
  id: number
  titulo: string
  descripcion: string
  foto: string
  precio: number | string
  status: "active" | "inactive"
  empresa_id: string
  categoria_adicional_id: number
}

// Interfaces para respuestas de API
export interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}

// obtener el token
const getAuthToken = () => {
  // Obtener el token de las cookies
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1]

  if (cookieToken) {
    // Verificar si ya tiene el prefijo "Bearer"
    return cookieToken.startsWith("Bearer ") ? cookieToken : `Bearer ${cookieToken}`
  }

  // Si no está en las cookies, intentar obtenerlo del localStorage
  const localStorageToken = localStorage.getItem("authToken")

  if (localStorageToken) {
    return localStorageToken.startsWith("Bearer ") ? localStorageToken : `Bearer ${localStorageToken}`
  }

  return null
}

export const adicionalService = {
  getEmpresaId: async (): Promise<string> => {
    try {
      // Obtener el usuario del localStorage
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Usuario no encontrado")
      }

      interface User {
        businessRegistration?: {
          id: number | string
        }
      }

      const user = JSON.parse(userStr) as User

      // Verificar si el usuario tiene businessRegistration
      if (!user.businessRegistration?.id) {
        // Si no está en el usuario directamente, hacer la petición
        const token = getAuthToken()
        const response = await fetch(`${API_URL}/negocio/datos`, {
          headers: {
            Authorization: token || "",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Error al obtener datos del negocio")
        }

        interface BusinessData {
          id: number | string
        }

        const data = (await response.json()) as BusinessData
        return data.id.toString()
      }

      return user.businessRegistration.id.toString()
    } catch (error) {
      console.error("Error al obtener ID de empresa:", error)
      // Valor por defecto para desarrollo
      console.warn("Usando ID de empresa por defecto: 22")
      return "22"
    }
  },

  // Métodos para Categorías de Adicionales
  getCategoriasAdicionales: async (): Promise<ApiResponse<CategoriaAdicional[]>> => {
    try {
      const empresaId = await adicionalService.getEmpresaId()
      const token = getAuthToken()

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await fetch(`${API_URL}/categorias-adicionales/web/${empresaId}`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al obtener categorías de adicionales")
      }

      return response.json() as Promise<ApiResponse<CategoriaAdicional[]>>
    } catch (error) {
      console.error("Error en getCategoriasAdicionales:", error)
      throw error
    }
  },

  createCategoriaAdicional: async (data: { nombre: string }): Promise<ApiResponse<CategoriaAdicional>> => {
    try {
      const empresaId = await adicionalService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/categorias-adicionales/web`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: data.nombre,
          empresa_id: empresaId,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al crear categoría de adicional")
      }

      return response.json() as Promise<ApiResponse<CategoriaAdicional>>
    } catch (error) {
      console.error("Error en createCategoriaAdicional:", error)
      throw error
    }
  },

  updateCategoriaAdicional: async (id: string, data: { nombre: string }): Promise<ApiResponse<CategoriaAdicional>> => {
    try {
      const empresaId = await adicionalService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/categorias-adicionales/web/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: data.nombre,
          empresa_id: empresaId,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al actualizar categoría de adicional")
      }

      return response.json() as Promise<ApiResponse<CategoriaAdicional>>
    } catch (error) {
      console.error("Error en updateCategoriaAdicional:", error)
      throw error
    }
  },

  deleteCategoriaAdicional: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/categorias-adicionales/web/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al eliminar categoría de adicional")
      }

      return response.json() as Promise<ApiResponse<void>>
    } catch (error) {
      console.error("Error en deleteCategoriaAdicional:", error)
      throw error
    }
  },

  // Métodos para Adicionales
  getAdicionales: async (): Promise<Adicional[]> => {
    try {
      const empresaId = await adicionalService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/adicionales/web/${empresaId}`, {
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al obtener adicionales")
      }

      return response.json() as Promise<Adicional[]>
    } catch (error) {
      console.error("Error en getAdicionales:", error)
      return []
    }
  },

  createAdicional: async (formData: FormData): Promise<ApiResponse<Adicional>> => {
    try {
      const empresaId = await adicionalService.getEmpresaId()
      const token = getAuthToken()

      formData.append("empresa_id", empresaId.toString())

      const response = await fetch(`${API_URL}/adicionales/web`, {
        method: "POST",
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al crear adicional")
      }

      return response.json() as Promise<ApiResponse<Adicional>>
    } catch (error) {
      console.error("Error en createAdicional:", error)
      throw error
    }
  },

  updateAdicional: async (id: string, formData: FormData): Promise<ApiResponse<Adicional>> => {
    try {
      const empresaId = await adicionalService.getEmpresaId()
      const token = getAuthToken()

      formData.append("empresa_id", empresaId.toString())
      formData.append("_method", "PUT") // Para simular PUT con FormData

      const response = await fetch(`${API_URL}/adicionales/web/${id}`, {
        method: "POST", // Usamos POST pero con _method=PUT para compatibilidad con Laravel
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al actualizar adicional")
      }

      return response.json() as Promise<ApiResponse<Adicional>>
    } catch (error) {
      console.error("Error en updateAdicional:", error)
      throw error
    }
  },

  deleteAdicional: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/adicionales/web/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al eliminar adicional")
      }

      return response.json() as Promise<ApiResponse<void>>
    } catch (error) {
      console.error("Error en deleteAdicional:", error)
      throw error
    }
  },
}

