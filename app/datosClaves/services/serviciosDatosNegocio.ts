// app/datosClaves/services/serviciosDatosNegocio.ts
import { getRegistrationToken } from "@/services/registrationTokenService"

// Función para cargar datos existentes
export const fetchExistingBusinessData = async (businessRegistrationId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/datos-clave-negocio/${businessRegistrationId}`, {
      headers: {
        Authorization: `Bearer ${getRegistrationToken()}`,
      },
    })

    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error("Error al obtener datos clave del negocio")
      }
      return null
    }

    const data = await response.json()
    console.log("Datos clave existentes:", data)
    return data
  } catch (error) {
    console.error("Error fetching business key data:", error)
    return null
  }
}

// Función para guardar o actualizar datos del negocio
export const saveBusinessKeyData = async (businessRegistrationId: string, ruc: string, razonSocial: string) => {
  // Verificar si ya existen datos para este registro
  const existingData = await fetchExistingBusinessData(businessRegistrationId)

  // URL y método según si es actualización o creación
  const url = existingData
    ? `${process.env.NEXT_PUBLIC_API_WEB}/datos-clave-negocio/${existingData.id}`
    : `${process.env.NEXT_PUBLIC_API_WEB}/datos-clave-negocio`

  const method = existingData ? "PUT" : "POST"

  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${getRegistrationToken()}`,
    },
    body: JSON.stringify({
      ruc: ruc,
      razon_social: razonSocial,
      business_registration_id: businessRegistrationId,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al guardar los datos")
  }

  return data
}
