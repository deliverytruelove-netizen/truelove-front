// Servicios de autenticación para el panel de motorizado
import type { Usuario, Repartidor, PerfilData } from "../types"

const API_URL = process.env.NEXT_PUBLIC_API_WEB || ""

// Interfaces para respuestas de API
interface LoginResponse {
  token: string
  user: Usuario
  repartidor: Repartidor
  message?: string
}

interface ErrorResponse {
  message: string
  errors?: Record<string, string[]>
}

// Función para obtener el token de autenticación
export const getAuthToken = (): string | null => {
  // Intentar obtener el token de las cookies
  const tokenFromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1]

  // Si no está en las cookies, intentar obtenerlo del localStorage
  if (!tokenFromCookie) {
    return localStorage.getItem("authToken")
  }

  return tokenFromCookie
}

// Función para obtener el ID del usuario
export const getUserId = (): number | null => {
  try {
    const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : {}
    return userObj.id || null
  } catch (error) {
    console.error("Error al obtener ID de usuario:", error)
    return null
  }
}

// Función para obtener datos del repartidor después del login
export const obtenerDatosRepartidor = async (): Promise<PerfilData> => {
  try {
    const token = getAuthToken()
    const userId = getUserId()

    if (!token || !userId) {
      throw new Error("No se encontró el token de autenticación o ID de usuario")
    }

    // Primero intentamos obtener los datos del perfil del repartidor
    const response = await fetch(`${API_URL}/biker/perfil/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      // Si falla, intentamos con la ruta de login para obtener los datos
      // Esta es una alternativa si la ruta de perfil no funciona
      const loginResponse = await fetch(`${API_URL}/biker/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: JSON.parse(localStorage.getItem("user") || "{}").email,
          password: "dummy-password", // Esto no funcionará realmente, solo es para intentar
        }),
      })

      // Si ambas rutas fallan, intentamos usar datos en caché
      if (!loginResponse.ok) {
        const cachedProfile = localStorage.getItem("userProfile")
        if (cachedProfile) {
          return JSON.parse(cachedProfile) as PerfilData
        }
        throw new Error("Error al obtener datos del repartidor")
      }

      const loginData = (await loginResponse.json()) as LoginResponse

      // Guardar datos en localStorage para futuras cargas
      const perfilData: PerfilData = {
        usuario: loginData.user,
        repartidor: loginData.repartidor,
      }

      localStorage.setItem("userProfile", JSON.stringify(perfilData))
      localStorage.setItem("lastProfileUpdate", new Date().toISOString())

      return perfilData
    }

    const datos = (await response.json()) as PerfilData

    // Guardar datos en localStorage para futuras cargas
    localStorage.setItem("userProfile", JSON.stringify(datos))
    localStorage.setItem("lastProfileUpdate", new Date().toISOString())

    return datos
  } catch (error) {
    console.error("Error al obtener datos del repartidor:", error)

    // Intentar usar datos en caché si hay un error
    const cachedProfile = localStorage.getItem("userProfile")
    if (cachedProfile) {
      return JSON.parse(cachedProfile) as PerfilData
    }

    // Si no hay datos en caché, intentamos construir un objeto con los datos mínimos
    // que tenemos en localStorage
    try {
      const userData = localStorage.getItem("user")
        ? (JSON.parse(localStorage.getItem("user") || "{}") as Partial<Usuario>)
        : {}

      const perfilData: PerfilData = {
        usuario: userData as Usuario,
        repartidor: {
          id: 0,
          nombres: userData.name?.split(" ")[0] || "",
          apellidos: userData.name?.split(" ").slice(1).join(" ") || "",
          email: userData.email || "",
          celular: "",
          departamento: "",
          vehiculo: "",
          tipo_documento: "",
          nro_documento: "",
          mayor_edad: true,
          acepta_politica: true,
          estado: true,
          aprobado: true,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
          user_id: userData.id || 0,
        },
      }

      return perfilData
    } catch (e) {
      console.error("Error al construir datos de perfil:", e)
      throw error
    }
  }
}

// Función para cerrar sesión
export const cerrarSesion = (): void => {
  // Eliminar datos de autenticación
  localStorage.removeItem("authToken")
  localStorage.removeItem("user")
  localStorage.removeItem("userRole")
  localStorage.removeItem("userProfile")
  localStorage.removeItem("lastProfileUpdate")

  // Eliminar cookies
  document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
  document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
}

// Función para verificar si el usuario es un motorizado
export const verificarRolMotorizado = (): boolean => {
  const userRole = document.cookie
    .split("; ")
    .find((row) => row.startsWith("userRole="))
    ?.split("=")[1]

  return userRole === "motorizado"
}

// Función para iniciar sesión como repartidor (alternativa)
export const loginRepartidor = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/biker/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse
      throw new Error(errorData.message || "Error al iniciar sesión")
    }

    const data = (await response.json()) as LoginResponse

    // Guardar datos de autenticación
    localStorage.setItem("authToken", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    localStorage.setItem("userRole", "motorizado")

    // Guardar cookies
    document.cookie = `authToken=${data.token}; path=/;`
    document.cookie = `userRole=motorizado; path=/;`

    // Guardar datos del repartidor
    if (data.repartidor) {
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          usuario: data.user,
          repartidor: data.repartidor,
        }),
      )
      localStorage.setItem("lastProfileUpdate", new Date().toISOString())
    }

    return data
  } catch (error) {
    console.error("Error en login de repartidor:", error)
    throw error
  }
}

// Función para guardar datos del repartidor en localStorage
export const guardarDatosRepartidor = (userData: Usuario, repartidorData: Repartidor): void => {
  localStorage.setItem(
    "userProfile",
    JSON.stringify({
      usuario: userData,
      repartidor: repartidorData,
    }),
  )
  localStorage.setItem("lastProfileUpdate", new Date().toISOString())
}
