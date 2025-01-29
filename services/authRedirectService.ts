import { getRegistrationData } from "./registrationTokenService"

export async function handleAuthRedirect() {
  try {
    const data = await getRegistrationData()
    if (!data || !data.token) {
      return "/login"
    }

    // Verificar si el negocio está aprobado
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocios/${data.registration_id}`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    })

    if (!response.ok) {
      return "/login"
    }

    const businessData = await response.json()

    // Si el negocio está aprobado, redirigir a la página de socio aprobado
    if (businessData.aprobado) {
      return "/socio-aprobado"
    }

    // Si no está aprobado, redirigir a la página de verificación
    return "/verificacion-documentos"
  } catch (error) {
    console.error("Error:", error)
    return "/login"
  }
}

