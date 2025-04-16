// services\repartoTokenService.ts
import { jwtVerify, SignJWT } from "jose"

interface DecodedToken {
  exp: number
  registration_id: string
  current_step: string
  token?: string
}

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length === 0) {
    throw new Error("JWT_SECRET no está configurado en las variables de entorno")
  }
  return new TextEncoder().encode(secret)
}

export const setRepartoToken = (token: string) => {
  if (typeof window !== "undefined") {
    try {
      const currentToken = localStorage.getItem("repartoToken")
      if (currentToken === token) {
        return
      }

      localStorage.setItem("repartoToken", token)
      sessionStorage.setItem("repartoToken", token)
      document.cookie = `repartoToken=${token}; path=/; max-age=3600; SameSite=Lax`

      window.dispatchEvent(new CustomEvent("repartoTokenUpdate", { detail: token }))
    } catch (error) {
      console.error("Error al guardar el token:", error)
    }
  }
}

export const getRepartoToken = (): string | null => {
  if (typeof window === "undefined") return null

  try {
    const cookieToken = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("repartoToken="))
      ?.split("=")[1]

    const localToken = localStorage.getItem("repartoToken")
    const sessionToken = sessionStorage.getItem("repartoToken")

    const token = cookieToken || localToken || sessionToken

    if (token) {
      setRepartoToken(token)
    }

    return token
  } catch (error) {
    console.error("Error al obtener el token:", error)
    return null
  }
}

export const removeRepartoToken = () => {
  if (typeof window !== "undefined") {
    try {
      document.cookie = "repartoToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
      localStorage.removeItem("repartoToken")
      sessionStorage.removeItem("repartoToken")
      window.dispatchEvent(new CustomEvent("repartoTokenRemove"))
    } catch (error) {
      console.error("Error al eliminar el token:", error)
    }
  }
}

export const isRepartoTokenValid = async (): Promise<boolean> => {
  const token = getRepartoToken()
  if (!token) return false

  try {
    await jwtVerify(token, getSecretKey())
    return true
  } catch (error) {
    console.error("Error al verificar el token:", error)
    removeRepartoToken()
    return false
  }
}

export const getRepartoData = async (): Promise<DecodedToken | null> => {
  const token = getRepartoToken()
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecretKey())

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
    removeRepartoToken()
    return null
  }
}

export const createRepartoToken = async (registration_id: string, current_step: string): Promise<string> => {
  try {
    console.log("Creando token para:", { registration_id, current_step })

    const token = await new SignJWT({
      registration_id,
      current_step,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(getSecretKey())

    // Guardar el token en todas las ubicaciones
    localStorage.setItem("repartoToken", token)
    sessionStorage.setItem("repartoToken", token)
    document.cookie = `repartoToken=${token}; path=/; max-age=3600; SameSite=Lax`

    // Guardar también el ID y el paso actual en sessionStorage
    sessionStorage.setItem("repartoRegistroId", registration_id)
    sessionStorage.setItem("repartoCurrentStep", current_step)

    return token
  } catch (error) {
    console.error("Error al crear el token de registro:", error)
    throw error
  }
}

export const updateRepartoStep = async (current_step: string): Promise<string | null> => {
  try {
    const data = await getRepartoData()
    if (!data) {
      // Si no hay datos en el token, intentar obtener el ID de registro de sessionStorage
      const registrationId = sessionStorage.getItem("repartoRegistroId")
      if (!registrationId) {
        console.error("No se encontró ID de registro ni en el token ni en sessionStorage")
        return null
      }

      // Crear un nuevo token con el ID de registro y el paso actual
      console.log("Creando nuevo token con ID de sessionStorage:", registrationId)
      return await createRepartoToken(registrationId, current_step)
    }

    // Si hay datos en el token, actualizar el paso actual
    console.log("Actualizando token existente:", data.registration_id, "al paso:", current_step)
    const newToken = await createRepartoToken(data.registration_id, current_step)
    setRepartoToken(newToken)

    // Asegurar que el paso actual se actualice en sessionStorage
    sessionStorage.setItem("repartoCurrentStep", current_step)

    return newToken
  } catch (error) {
    console.error("Error al actualizar el paso:", error)
    return null
  }
}

export const processEncodedToken = async (encodedToken: string): Promise<DecodedToken | null> => {
  try {
    const decodedToken = Buffer.from(encodedToken, "base64").toString()
    setRepartoToken(decodedToken)
    return await getRepartoData()
  } catch (error) {
    console.error("Error al procesar el token codificado:", error)
    return null
  }
}

export function setLocalStorageData(registrationId: string, currentStep: string): void {
  localStorage.setItem(
    "repartoData",
    JSON.stringify({
      registration_id: registrationId,
      current_step: currentStep,
      timestamp: Date.now(),
    }),
  )
}

export const initTokenSyncListener = () => {
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      if (event.key === "repartoToken" && event.newValue) {
        setRepartoToken(event.newValue)
      }
    })

    window.addEventListener("repartoTokenUpdate", (event) => {
      const customEvent = event as CustomEvent<string>
      if (customEvent.detail) {
        setRepartoToken(customEvent.detail)
      }
    })
  }
}
