// services/registrationTokenService.ts 
import { jwtVerify, SignJWT } from "jose"

// Interfaz que define la estructura del token decodificado
interface DecodedToken {
  exp: number // Tiempo de expiración del token
  registration_id: string // ID único del registro
  current_step: string // Paso actual del proceso de registro
  token?: string // Token de autorización
}

// Función para obtener la clave secreta
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length === 0) {
    throw new Error("JWT_SECRET no está configurado en las variables de entorno")
  }
  return new TextEncoder().encode(secret)
}

// Guarda el token en una cookie del navegador
export const setRegistrationToken = (token: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `registrationToken=${token}; path=/; max-age=3600; SameSite=Strict; Secure`
  }
}

// Obtiene el token almacenado en las cookies
export const getRegistrationToken = (): string | null => {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(";")
  const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("registrationToken="))
  return tokenCookie ? tokenCookie.split("=")[1] : null
}

// Elimina TODOS los datos de registro (cookies y localStorage)
export const clearAllRegistrationData = () => {
  if (typeof document !== 'undefined') {
    // Eliminar cookie del token
    document.cookie = "registrationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure"
  }
  
  if (typeof window !== 'undefined') {
    try {
      // Eliminar TODOS los datos relacionados con el registro
      localStorage.removeItem("registrationData")
      localStorage.removeItem("businessFormData")
      localStorage.removeItem("locationData")
      localStorage.removeItem("keyData")
      localStorage.removeItem("bankData")
      localStorage.removeItem("planData")
      localStorage.removeItem("reviewData")
      
      // Limpiar cualquier otro dato que pueda estar almacenado
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.includes('registration') || key.includes('business') || key.includes('form')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error("Error al limpiar localStorage:", error)
    }
  }
}

// NUEVA FUNCIÓN: Guarda datos en localStorage (solo para casos específicos)
export const setLocalStorageData = (registration_id: string, step: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem("registrationData", JSON.stringify({ registration_id, step }))
    } catch (error) {
      console.error("Error al guardar datos en localStorage:", error)
    }
  }
}

// Verifica si el token es válido
export const isRegistrationTokenValid = async (): Promise<boolean> => {
  const token = getRegistrationToken()
  if (!token) return false

  try {
    await jwtVerify(token, getSecretKey())
    return true
  } catch {
    return false
  }
}

// Obtiene los datos del registro de la URL
export const getRegistrationIdFromUrl = (): string | null => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get("registration_id")
  }
  return null
}

// Obtiene los datos decodificados del token (SIN usar localStorage como respaldo)
export const getRegistrationData = async (): Promise<DecodedToken | null> => {
  // Primero intentamos obtener de la URL
  const urlRegistrationId = getRegistrationIdFromUrl()
  if (urlRegistrationId) {
    console.log("Usando registration_id de la URL:", urlRegistrationId)
    return {
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora de expiración
      registration_id: urlRegistrationId,
      current_step: "/email",
    }
  }

  // Luego intentamos obtener del token JWT
  const token = getRegistrationToken()
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey())

      // Verificamos que todos los campos necesarios existan y sean del tipo correcto
      if (
        typeof payload.exp === "number" &&
        typeof payload.registration_id === "string" &&
        typeof payload.current_step === "string"
      ) {
        return {
          exp: payload.exp,
          registration_id: payload.registration_id,
          current_step: payload.current_step,
          token,
        }
      }
    } catch (error) {
      console.error("Error al decodificar token JWT:", error)
      // Si el token es inválido, limpiar todos los datos
      clearAllRegistrationData()
    }
  }

  return null
}

// Crea un nuevo token de registro (SIN guardar en localStorage)
export const createRegistrationToken = async (registration_id: string, current_step: string): Promise<string> => {
  try {
    // Limpiar datos anteriores antes de crear nuevo token
    clearAllRegistrationData()
    
    // Creamos un nuevo token con los datos proporcionados
    const token = await new SignJWT({
      registration_id,
      current_step,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(getSecretKey())

    // Guardamos SOLO el token en las cookies
    setRegistrationToken(token)

    return token
  } catch (error) {
    console.error("Error al crear el token de registro:", error)
    throw error
  }
}

// Actualiza el paso actual en el token
export const updateRegistrationStep = async (current_step: string): Promise<string | null> => {
  // Obtenemos los datos actuales del token
  const data = await getRegistrationData()
  if (!data) return null

  // Creamos un nuevo token con el paso actualizado
  const newToken = await createRegistrationToken(data.registration_id, current_step)
  setRegistrationToken(newToken)
  return newToken
}

// Función para limpiar datos al iniciar un nuevo registro
export const startNewRegistration = () => {
  clearAllRegistrationData()
  console.log("Datos de registro anteriores limpiados")
}