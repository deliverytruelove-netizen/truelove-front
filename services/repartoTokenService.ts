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
export const setRepartoToken = (token: string) => {
  // Asegurarse de que estamos en el cliente
  if (typeof document !== "undefined") {
    document.cookie = `repartoToken=${token}; path=/; max-age=3600; SameSite=Strict; ${location.protocol === "https:" ? "Secure;" : ""}`
    console.log("Token guardado en cookie:", token.substring(0, 20) + "...")
  }
}

// Obtiene el token almacenado en las cookies
export const getRepartoToken = (): string | null => {
  // Asegurarse de que estamos en el cliente
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("repartoToken="))
  return tokenCookie ? tokenCookie.split("=")[1] : null
}

// Elimina el token de las cookies
export const removeRepartoToken = () => {
  // Asegurarse de que estamos en el cliente
  if (typeof document !== "undefined") {
    document.cookie = "repartoToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure"
    console.log("Token de reparto eliminado")
  }
}

// Verifica si el token es válido
export const isRepartoTokenValid = async (): Promise<boolean> => {
  const token = getRepartoToken()
  if (!token) return false

  try {
    await jwtVerify(token, getSecretKey())
    return true
  } catch {
    return false
  }
}

// Obtiene los datos decodificados del token
export const getRepartoData = async (): Promise<DecodedToken | null> => {
  const token = getRepartoToken()
  if (!token) return null

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
    return null
  } catch (error) {
    console.error("Error al decodificar el token:", error)
    return null
  }
}

// Crea un nuevo token de registro
export const createRepartoToken = async (registration_id: string, current_step: string): Promise<string> => {
  try {
    console.log("Creando token para:", { registration_id, current_step })

    // Creamos un nuevo token con los datos proporcionados
    const token = await new SignJWT({
      registration_id,
      current_step,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(getSecretKey())

    // Guardamos el token en las cookies
    setRepartoToken(token)
    return token
  } catch (error) {
    console.error("Error al crear el token de registro:", error)
    throw error
  }
}

// Actualiza el paso actual en el token
export const updateRepartoStep = async (current_step: string): Promise<string | null> => {
  // Obtenemos los datos actuales del token
  const data = await getRepartoData()
  if (!data) return null

  // Creamos un nuevo token con el paso actualizado
  const newToken = await createRepartoToken(data.registration_id, current_step)
  setRepartoToken(newToken)
  return newToken
}

