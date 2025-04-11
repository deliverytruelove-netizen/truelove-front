// app/datosBancarios/services/serviciosDatosBancarios.ts
import { getRegistrationToken } from "@/services/registrationTokenService"

interface EstablecimientoDireccion {
  calle: string
  numero: string
  codigo_postal: string
  provincia: string
  ciudad: string
  referencia: string | null
  direccion_completa: string
}

interface EstablecimientoDireccionResponse {
  direccion: EstablecimientoDireccion
  establecimiento_id: string
}

// Función para cargar datos existentes
export const fetchExistingData = async (businessRegistrationId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/datos-bancarios/${businessRegistrationId}`, {
      headers: {
        Authorization: `Bearer ${getRegistrationToken()}`,
      },
    })

    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error("Error al obtener datos bancarios del negocio")
      }
      return null
    }

    const data = await response.json()
    console.log("Datos Bancarios existentes:", data)
    return data
  } catch (error) {
    console.error("Error fetching business key data:", error)
    return null
  }
}

// Función para obtener la dirección del establecimiento
export const fetchEstablecimientoDireccion = async (
  registrationId: string,
): Promise<EstablecimientoDireccionResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/establecimiento/${registrationId}/direccion`, {
      headers: {
        Authorization: `Bearer ${getRegistrationToken()}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || `Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    if (data && data.direccion) {
      return {
        direccion: data.direccion,
        establecimiento_id: data.establecimiento_id,
      }
    } else {
      throw new Error("La respuesta del servidor no contiene la dirección esperada")
    }
  } catch (error) {
    console.error("Error al obtener la dirección:", error)
    throw error
  }
}

// Función para guardar datos bancarios
export const saveBankData = async (
  registrationId: string,
  formData: {
    accountHolder: string
    accountNumber: string
    bankName: string
    accountType: string
    documentNumber: string
    cci: string
    useBusinessAddress: boolean
  },
  establecimientoId: string | null,
  existingData: {
    id?: string | number
  } | null,
) => {
  const url = existingData
    ? `${process.env.NEXT_PUBLIC_API_WEB}/datos-bancarios/${existingData.id}`
    : `${process.env.NEXT_PUBLIC_API_WEB}/datos-bancarios`

  const method = existingData ? "PUT" : "POST"

  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getRegistrationToken()}`,
    },
    body: JSON.stringify({
      titular_cuenta: formData.accountHolder,
      numero_cuenta: formData.accountNumber,
      nombre_banco: formData.bankName,
      tipo_cuenta: formData.accountType,
      documento_titular: formData.documentNumber,
      codigo_cci: formData.cci,
      usar_direccion_negocio: formData.useBusinessAddress,
      establecimiento_id: establecimientoId,
      business_registration_id: registrationId,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.mensaje || "Error al guardar los datos bancarios")
  }

  return await response.json()
}
