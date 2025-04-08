// app\socio\admin\services\menu.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB

export interface Category {
  id: number
  nombre: string
  empresa_id: string
}

export interface MenuItem {
  id: number
  titulo: string
  descripcion: string
  foto: string
  precio: number | string // Permitir que precio sea número o string
  status: "active" | "inactive" | "out-of-stock"
  empresa_id: string
  categoria_id: number
}

// Interfaces para respuestas de API
export interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}

// Definimos tipos específicos para las respuestas de menú
export type MenuItemResponse = MenuItem | MenuItem[]
export type MenuResponseData =
  | {
      data?: MenuItemResponse
    }
  | MenuItem[]

// obtener el tokern
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

export const menuService = {
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
      // No usar un valor por defecto
      return ""
    }
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await fetch(`${API_URL}/categoria/web/${empresaId}`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al obtener categorías")
      }

      return response.json() as Promise<ApiResponse<Category[]>>
    } catch (error) {
      console.error("Error en getCategories:", error)
      throw error
    }
  },


  createCategory: async (data: { nombre: string }): Promise<ApiResponse<Category>> => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/categoria/web`, {
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
        throw new Error(errorData.message || "Error al crear categoría")
      }

      return response.json() as Promise<ApiResponse<Category>>
    } catch (error) {
      console.error("Error en createCategory:", error)
      throw error
    }
  },

  updateCategory: async (id: string, data: { nombre: string }): Promise<ApiResponse<Category>> => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/categoria/web/${id}`, {
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
        throw new Error(errorData.message || "Error al actualizar categoría")
      }

      return response.json() as Promise<ApiResponse<Category>>
    } catch (error) {
      console.error("Error en updateCategory:", error)
      throw error
    }
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/categoria/web/${id}/${empresaId}`, {
        method: "DELETE",
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al eliminar categoría")
      }

      return response.json() as Promise<ApiResponse<void>>
    } catch (error) {
      console.error("Error en deleteCategory:", error)
      throw error
    }
  },

  getMenus: async (): Promise<MenuItem[]> => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      console.log(`Obteniendo menús para empresa ID: ${empresaId}`)
      console.log(`URL de la API: ${API_URL}/listar/menus/web/${empresaId}`)

      // Intentar primero con la ruta que tienes configurada
      let response = await fetch(`${API_URL}/listar/menus/web/${empresaId}`, {
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
      })

      // Si la primera ruta falla, intentar con la ruta alternativa
      if (!response.ok) {
        console.log("Primera ruta falló, intentando ruta alternativa...")
        response = await fetch(`${API_URL}/menus/web/${empresaId}`, {
          headers: {
            Authorization: token || "",
            Accept: "application/json",
          },
        })
      }

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al obtener menús")
      }

      const responseData = (await response.json()) as MenuResponseData
      console.log("Respuesta de getMenus:", responseData)

      // Si la respuesta es un array directamente, asumimos que son los productos
      if (Array.isArray(responseData)) {
        // Asignar una categoría por defecto si no tiene categoria_id
        return responseData.map((item: Partial<MenuItem>) => {
          if (!item.categoria_id) {
            console.log(`Producto ${item.id} sin categoria_id, asignando categoría por defecto`)
            // Asignar a la primera categoría disponible o a la categoría 1
            item.categoria_id = 1
          }
          return item as MenuItem
        })
      }
      // Si la respuesta es un objeto con una propiedad data que es un array
      else if (responseData && typeof responseData === "object" && "data" in responseData) {
        const dataContent = responseData.data

        if (Array.isArray(dataContent)) {
          return dataContent.map((item: Partial<MenuItem>) => {
            if (!item.categoria_id) {
              console.log(`Producto ${item.id} sin categoria_id, asignando categoría por defecto`)
              item.categoria_id = 1
            }
            return item as MenuItem
          })
        }
        // Si data es un objeto único (no un array)
        else if (dataContent && typeof dataContent === "object" && !Array.isArray(dataContent)) {
          const menuItem = dataContent as Partial<MenuItem>
          if (!menuItem.categoria_id) {
            console.log(`Producto ${menuItem.id} sin categoria_id, asignando categoría por defecto`)
            menuItem.categoria_id = 1
          }
          return [menuItem as MenuItem]
        }
      }

      return []
    } catch (error) {
      console.error("Error en getMenus:", error)
      return []
    }
  },

  createMenu: async (formData: FormData): Promise<ApiResponse<MenuItem>> => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      formData.append("empresa_id", empresaId.toString())

      // Intentar primero con la ruta que tienes configurada
      let response = await fetch(`${API_URL}/crear/menus/web`, {
        method: "POST",
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
        body: formData,
      })

      // Si la primera ruta falla, intentar con la ruta alternativa
      if (!response.ok) {
        console.log("Primera ruta falló, intentando ruta alternativa...")
        response = await fetch(`${API_URL}/menus/web`, {
          method: "POST",
          headers: {
            Authorization: token || "",
            Accept: "application/json",
          },
          body: formData,
        })
      }

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al crear menú")
      }

      return response.json() as Promise<ApiResponse<MenuItem>>
    } catch (error) {
      console.error("Error en createMenu:", error)
      throw error
    }
  },

  updateMenu: async (id: string, formData: FormData): Promise<ApiResponse<MenuItem>> => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      formData.append("empresa_id", empresaId.toString())
      formData.append("_method", "PUT") // Para simular PUT con FormData

      // Implementamos la actualización del menú
      const response = await fetch(`${API_URL}/menus/web/${id}`, {
        method: "POST", // Usamos POST pero con _method=PUT para compatibilidad con Laravel
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al actualizar menú")
      }

      return response.json() as Promise<ApiResponse<MenuItem>>
    } catch (error) {
      console.error("Error en updateMenu:", error)
      throw error
    }
  },

  updateMenuStatus: async (id: string, status: string): Promise<ApiResponse<MenuItem>> => {
    try {
      const token = getAuthToken()

      // Intentar primero con la ruta que tienes configurada
      let response = await fetch(`${API_URL}/menu/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
          Accept: "application/json",
        },
        body: JSON.stringify({ status }),
      })

      // Si la primera ruta falla, intentar con la ruta alternativa
      if (!response.ok) {
        console.log("Primera ruta falló, intentando ruta alternativa...")
        response = await fetch(`${API_URL}/menus/web/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
            Accept: "application/json",
          },
          body: JSON.stringify({ status }),
        })
      }

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al actualizar estado del menú")
      }

      return response.json() as Promise<ApiResponse<MenuItem>>
    } catch (error) {
      console.error("Error en updateMenuStatus:", error)
      throw error
    }
  },

  deleteMenu: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const token = getAuthToken()

      // Implementamos la eliminación del menú
      // Aunque no existe en el backend, podemos preparar el frontend
      const response = await fetch(`${API_URL}/menus/web/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Error al eliminar menú")
      }

      return response.json() as Promise<ApiResponse<void>>
    } catch (error) {
      console.error("Error en deleteMenu:", error)
      throw error
    }
  },
  getMenusByCategory: async (categoryId: string): Promise<MenuItem[]> => {
    try {
      const token = getAuthToken();
      
      console.log(`Obteniendo menús para la categoría ID: ${categoryId}`);
      console.log(`URL de la API: ${API_URL}/menus/categoria/${categoryId}`);
  
      const response = await fetch(`${API_URL}/menus/categoria/${categoryId}`, {
        headers: {
          Authorization: token || "",
          Accept: "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        throw new Error(errorData.message || "Error al obtener menús por categoría");
      }
  
      const menuItems = await response.json();
      console.log("Menús obtenidos por categoría:", menuItems);
      
      return Array.isArray(menuItems) ? menuItems : [];
    } catch (error) {
      console.error("Error en getMenusByCategory:", error);
      return [];
    }
  }
}