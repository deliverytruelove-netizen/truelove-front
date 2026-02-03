// app\socio\admin\services\adicional.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB

export interface Menu {
  id: number
  titulo: string
}

export interface Adicional {
  id: number
  titulo: string
  descripcion: string
  foto: string
  precio: number | string
  status: "active" | "inactive"
  empresa_id: string
  menu_id: number
  menu?: Menu // Información del menú/producto asociado
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
      return ""
    }
  },

  // Obtener todos los adicionales de la empresa (con info del menú)
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

  // Obtener todos los menús de la empresa (para selector)
  getMenus: async (): Promise<Menu[]> => {
    try {
      const empresaId = await adicionalService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/listar/menus/web/${empresaId}`, {
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al obtener menús")
      }

      return response.json() as Promise<Menu[]>
    } catch (error) {
      console.error("Error en getMenus:", error)
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

  // Métodos para adicionales por producto (menú)
  getMenuAdicionales: async (menuId: number): Promise<Adicional[]> => {
    try {
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/menu/${menuId}/adicionales`, {
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al obtener adicionales del producto")
      }

      return response.json() as Promise<Adicional[]>
    } catch (error) {
      console.error("Error en getMenuAdicionales:", error)
      return []
    }
  },

  createMenuAdicional: async (menuId: number, formData: FormData): Promise<ApiResponse<Adicional>> => {
    try {
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/menu/${menuId}/adicionales`, {
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
      console.error("Error en createMenuAdicional:", error)
      throw error
    }
  },

  updateMenuAdicional: async (menuId: number, adicionalId: number, formData: FormData): Promise<ApiResponse<Adicional>> => {
    try {
      const token = getAuthToken()
      
      formData.append("_method", "PUT")

      const response = await fetch(`${API_URL}/menu/${menuId}/adicionales/${adicionalId}`, {
        method: "POST",
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
      console.error("Error en updateMenuAdicional:", error)
      throw error
    }
  },

  deleteMenuAdicional: async (menuId: number, adicionalId: number): Promise<ApiResponse<void>> => {
    try {
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/menu/${menuId}/adicionales/${adicionalId}`, {
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
      console.error("Error en deleteMenuAdicional:", error)
      throw error
    }
  },
}
