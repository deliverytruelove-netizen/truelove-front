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
  precio: number
  status: "active" | "inactive" | "out-of-stock"
  empresa_id: string
  categoria_id: number
}

// obtener el tokern
const getAuthToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1]
}

export const menuService = {
  getEmpresaId: async () => {
    try {
      // Obtener el usuario del localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error("Usuario no encontrado");
      }

      const user = JSON.parse(userStr);
      
      // Verificar si el usuario tiene businessRegistration
      if (!user.businessRegistration?.id) {
        // Si no está en el usuario directamente, hacer la petición
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/negocio/datos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener datos del negocio");
        }

        const data = await response.json();
        return data.id.toString();
      }

      return user.businessRegistration.id.toString();
    } catch (error) {
      console.error("Error al obtener ID de empresa:", error);
      throw new Error("No se pudo obtener el ID del negocio");
    }
  },

  getCategories: async () => {
    try {
      const empresaId = await menuService.getEmpresaId();
      const token = getAuthToken();

      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(`${API_URL}/categories/${empresaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al obtener categorías");
      }

      return response.json();
    } catch (error) {
      console.error("Error en getCategories:", error);
      throw error;
    }
  },

  createCategory: async (data: { nombre: string }) => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: data.nombre,
          empresa_id: empresaId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al crear categoría")
      }

      return response.json()
    } catch (error) {
      console.error("Error en createCategory:", error)
      throw error
    }
  },

  updateCategory: async (id: string, data: { nombre: string }) => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: data.nombre,
          empresa_id: empresaId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al actualizar categoría")
      }

      return response.json()
    } catch (error) {
      console.error("Error en updateCategory:", error)
      throw error
    }
  },

  getMenus: async () => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/listar/menus/${empresaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al obtener menús")
      }

      return response.json()
    } catch (error) {
      console.error("Error en getMenus:", error)
      throw error
    }
  },

  createMenu: async (formData: FormData) => {
    try {
      const empresaId = await menuService.getEmpresaId()
      const token = getAuthToken()

      formData.append("empresa_id", empresaId.toString())

      const response = await fetch(`${API_URL}/crear/menus`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al crear menú")
      }

      return response.json()
    } catch (error) {
      console.error("Error en createMenu:", error)
      throw error
    }
  },

  updateMenuStatus: async (id: string, status: string) => {
    try {
      const token = getAuthToken()

      const response = await fetch(`${API_URL}/menu/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al actualizar estado del menú")
      }

      return response.json()
    } catch (error) {
      console.error("Error en updateMenuStatus:", error)
      throw error
    }
  },
}

