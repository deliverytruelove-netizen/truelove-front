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

export const menuService = {
  // Categorías
  getCategories: async (empresa_id: string) => {
    try {
      const response = await fetch(`${API_URL}/categories/${empresa_id}`)
      if (!response.ok) throw new Error("Error al obtener categorías")
      return response.json()
    } catch (error) {
      console.error("Error en getCategories:", error)
      throw error
    }
  },

  createCategory: async (data: { nombre: string; empresa_id: string }) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Error al crear categoría")
      return response.json()
    } catch (error) {
      console.error("Error en createCategory:", error)
      throw error
    }
  },

  updateCategory: async (id: string, data: { nombre: string; empresa_id: string }) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Error al actualizar categoría")
      return response.json()
    } catch (error) {
      console.error("Error en updateCategory:", error)
      throw error
    }
  },

  deleteCategory: async (id: string, empresa_id: string) => {
    try {
      const response = await fetch(`${API_URL}/categorias/${id}/${empresa_id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error al eliminar categoría")
      return response.json()
    } catch (error) {
      console.error("Error en deleteCategory:", error)
      throw error
    }
  },

  // Menús
  getMenus: async (empresa_id: string) => {
    try {
      const response = await fetch(`${API_URL}/listar/menus/${empresa_id}`)
      if (!response.ok) throw new Error("Error al obtener menús")
      const data = await response.json()
      // Asegurarse de que los datos se están procesando correctamente
      console.log("Menús recibidos:", data)
      return data
    } catch (error) {
      console.error("Error en getMenus:", error)
      throw error
    }
  },

  createMenu: async (formData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/crear/menus`, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("Error al crear menú")
      return response.json()
    } catch (error) {
      console.error("Error en createMenu:", error)
      throw error
    }
  },

  updateMenuStatus: async (id: string, status: string) => {
    try {
      const response = await fetch(`${API_URL}/menu/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Error al actualizar estado del menú")
      return response.json()
    } catch (error) {
      console.error("Error en updateMenuStatus:", error)
      throw error
    }
  },
}

