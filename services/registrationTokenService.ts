// services\registrationTokenService.ts 
import { jwtVerify, SignJWT } from "jose"

// Interfaz que define la estructura del token decodificado
interface DecodedToken {
  exp: number // Tiempo de expiración del token
  registration_id: string // ID único del registro
  current_step: string // Paso actual del proceso de registro
  token?: string // Token de autorización
}

// Interfaz para los datos almacenados en localStorage
interface LocalStorageData {
  registration_id: string // ID único del registro
  step: string // Paso actual del proceso de registro
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
  document.cookie = `registrationToken=${token}; path=/; max-age=3600; SameSite=Strict; Secure`
}

// Guarda los datos del registro en localStorage como respaldo
export const setLocalStorageData = (registration_id: string, step: string) => {
  try {
    localStorage.setItem("registrationData", JSON.stringify({ registration_id, step }))
  } catch (error) {
    console.error("Error al guardar datos en localStorage:", error)
  }
}

// Obtiene el token almacenado en las cookies
export const getRegistrationToken = (): string | null => {
  const cookies = document.cookie.split(";")
  const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("registrationToken="))
  return tokenCookie ? tokenCookie.split("=")[1] : null
}

// Elimina el token de las cookies
export const removeRegistrationToken = () => {
  document.cookie = "registrationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure"
  // También eliminar de localStorage
  try {
    localStorage.removeItem("registrationData")
  } catch (error) {
    console.error("Error al eliminar datos de localStorage:", error)
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

// Obtiene los datos almacenados en localStorage
export const getLocalStorageData = (): LocalStorageData | null => {
  try {
    const data = localStorage.getItem("registrationData")
    if (!data) return null
    return JSON.parse(data) as LocalStorageData
  } catch (error) {
    console.error("Error al obtener datos de localStorage:", error)
    return null
  }
}

// Obtiene los datos decodificados del token
export const getRegistrationData = async (): Promise<DecodedToken | null> => {
  // Primero intentamos obtener de la URL
  const urlRegistrationId = getRegistrationIdFromUrl()
  if (urlRegistrationId) {
    console.log("Usando registration_id de la URL:", urlRegistrationId)
    // Guardar en localStorage para futuras referencias
    setLocalStorageData(urlRegistrationId, "/email")
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
    }
  }

  // Si no se encuentra en el token, intentamos obtener de localStorage
  const localData = getLocalStorageData()
  if (localData) {
    console.log("Usando datos de localStorage:", localData)
    return {
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora de expiración
      registration_id: localData.registration_id,
      current_step: localData.step,
    }
  }

  return null
}

// Crea un nuevo token de registro
export const createRegistrationToken = async (registration_id: string, current_step: string): Promise<string> => {
  try {
    // Creamos un nuevo token con los datos proporcionados
    const token = await new SignJWT({
      registration_id,
      current_step,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(getSecretKey())

    // Guardamos el token en las cookies
    setRegistrationToken(token)

    // También guardamos en localStorage como respaldo
    setLocalStorageData(registration_id, current_step)

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

