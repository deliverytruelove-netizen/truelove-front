const API_URL = process.env.NEXT_PUBLIC_API_WEB

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null

  // Obtener el token de las cookies
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1]

  if (cookieToken) {
    return cookieToken.startsWith("Bearer ") ? cookieToken : `Bearer ${cookieToken}`
  }

  // Si no está en las cookies, intentar obtenerlo del localStorage
  const localStorageToken = localStorage.getItem("authToken")

  if (localStorageToken) {
    return localStorageToken.startsWith("Bearer ") ? localStorageToken : `Bearer ${localStorageToken}`
  }

  return null
}

async function getEmpresaId(): Promise<string | null> {
  if (typeof window === "undefined") return null

  try {
    // Obtener el usuario del localStorage
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      return null
    }

    interface User {
      businessRegistration?: {
        id: number | string
      }
    }

    const user = JSON.parse(userStr) as User

    // Verificar si el usuario tiene businessRegistration
    if (user.businessRegistration?.id) {
      return user.businessRegistration.id.toString()
    }

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
      return null
    }

    const data = await response.json()
    return data.empresa_id?.toString() || null
  } catch {
    return null
  }
}

export interface GrupoAdicionalItem {
  id: number
  titulo: string
  precio: string | number
  pivot?: {
    grupo_id: number
    adicional_id: number
    precio: string
    orden: number
  }
}

export interface GrupoAdicional {
  id: number
  empresa_id: number
  nombre: string
  minimo: number
  maximo: number
  estado: "active" | "inactive"
  items?: GrupoAdicionalItem[]
  created_at?: string
  updated_at?: string
}

export interface CreateGrupoData {
  nombre: string
  minimo: number
  maximo: number
}

export interface AddItemData {
  adicional_id: number
  precio: number
  orden?: number
}

// Obtener todos los grupos de la empresa
export const getGrupos = async (): Promise<GrupoAdicional[]> => {
  const token = getAuthToken()
  const empresaId = await getEmpresaId()

  if (!empresaId) {
    throw new Error("No se encontró el ID de empresa")
  }

  const response = await fetch(`${API_URL}/grupos-adicionales/${empresaId}`, {
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error al obtener grupos")
  }

  return response.json()
}

// Crear un nuevo grupo
export const createGrupo = async (data: CreateGrupoData): Promise<GrupoAdicional> => {
  const token = getAuthToken()
  const empresaId = await getEmpresaId()

  if (!empresaId) {
    throw new Error("No se encontró el ID de empresa")
  }

  const response = await fetch(`${API_URL}/grupos-adicionales`, {
    method: "POST",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      empresa_id: empresaId,
      ...data,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al crear grupo")
  }

  const result = await response.json()
  return result.data
}

// Actualizar un grupo
export const updateGrupo = async (id: number, data: CreateGrupoData & { estado?: string }): Promise<GrupoAdicional> => {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/grupos-adicionales/${id}`, {
    method: "PUT",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al actualizar grupo")
  }

  const result = await response.json()
  return result.data
}

// Eliminar un grupo
export const deleteGrupo = async (id: number): Promise<void> => {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/grupos-adicionales/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al eliminar grupo")
  }
}

// Obtener detalle de un grupo con sus items
export const getGrupoDetalle = async (id: number): Promise<GrupoAdicional> => {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/grupos-adicionales/detalle/${id}`, {
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error al obtener grupo")
  }

  return response.json()
}

// Agregar un adicional a un grupo
export const addItemToGrupo = async (grupoId: number, data: AddItemData): Promise<void> => {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/grupos-adicionales/${grupoId}/items`, {
    method: "POST",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al agregar item")
  }
}

// Actualizar precio de un item en el grupo
export const updateItemInGrupo = async (grupoId: number, adicionalId: number, precio: number, orden?: number): Promise<void> => {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/grupos-adicionales/${grupoId}/items/${adicionalId}`, {
    method: "PUT",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ precio, orden }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al actualizar item")
  }
}

// Remover un adicional de un grupo
export const removeItemFromGrupo = async (grupoId: number, adicionalId: number): Promise<void> => {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/grupos-adicionales/${grupoId}/items/${adicionalId}`, {
    method: "DELETE",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al remover item")
  }
}

// Obtener adicionales disponibles para agregar a un grupo
export const getAvailableItems = async (grupoId: number): Promise<GrupoAdicionalItem[]> => {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/grupos-adicionales/${grupoId}/disponibles`, {
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error al obtener adicionales disponibles")
  }

  return response.json()
}

// Asignar grupos a un producto/menú
export const assignGruposToMenu = async (menuId: number, grupoIds: number[]): Promise<void> => {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/menu/${menuId}/grupos`, {
    method: "POST",
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ grupos: grupoIds }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al asignar grupos")
  }
}

// Obtener grupos asignados a un producto/menú
export const getMenuGrupos = async (menuId: number): Promise<GrupoAdicional[]> => {
  const token = getAuthToken()

  const response = await fetch(`${API_URL}/menu/${menuId}/grupos`, {
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error al obtener grupos del menú")
  }

  return response.json()
}
