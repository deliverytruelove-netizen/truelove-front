import { getRegistrationToken } from "./registrationTokenService"

// Tipos para los datos del registros
export interface RegistrationData {
  // Datos del formulario inicial
  personalData?: {
    documentType: string
    documentNumber: string
    name: string
    lastName: string
    businessType: string
    phone: string
    email: string
    posToDriver: boolean
    antecedentesPenales?: File
    antecedentesPoliciales?: File
  }

  // Datos del negocio
  businessData?: {
    businessName: string
    businessType: string
    category: string
    branches: number
    isStreetLocation: string
    contactMethod: string
    phoneNumber: string
  }

  // Datos de ubicación
  locationData?: {
    businessName: string
    street: string
    number: string
    postalCode: string
    province: string
    city: string
    reference?: string
    coordinates: [number, number]
    fullAddress: string
  }

  // Datos clave del negocio
  keyBusinessData?: {
    ruc: string
    razonSocial: string
  }

  // Datos bancarios
  bankData?: {
    bankName: string
    accountType: string
    accountNumber: string
    cciNumber: string
  }

  // Plan seleccionado
  selectedPlan?: {
    planId: string
    planName: string
  }

  // Términos aceptados
  termsAccepted?: boolean
}

const STORAGE_KEY = "registration_draft_data"

// Guardar datos en localStorage
export const saveRegistrationData = (data: Partial<RegistrationData>) => {
  try {
    const existingData = getRegistrationData()
    const updatedData = { ...existingData, ...data }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
    return updatedData
  } catch (error) {
    console.error("Error saving registration data:", error)
    return null
  }
}

// Obtener datos del localStorage
export const getRegistrationData = (): RegistrationData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error("Error getting registration data:", error)
    return {}
  }
}

// Limpiar datos del localStorage
export const clearRegistrationData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing registration data:", error)
  }
}

// Validar si el email/documento ya existe (sin guardar)
export const validateRegistrationData = async (email: string, documentNumber: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/validate-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        documentNumber,
      }),
    })

    const data = await response.json()
    return {
      isValid: response.ok,
      errors: data.errors || [],
      message: data.message,
    }
  } catch (error) {
    console.error("Error validating registration data:", error)
    return {
      isValid: false,
      errors: ["Error de conexión"],
      message: "Error al validar los datos",
    }
  }
}

// Enviar código de verificación (sin guardar datos)
export const sendVerificationCode = async (email: string, name: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/send-verification-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
      }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      message: data.message,
      verificationId: data.verification_id,
    }
  } catch (error) {
    console.error("Error sending verification code:", error)
    return {
      success: false,
      message: "Error al enviar el código de verificación",
    }
  }
}

// Verificar código de email
export const verifyEmailCode = async (email: string, code: string, verificationId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/verify-email-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
        verification_id: verificationId,
      }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      message: data.message,
    }
  } catch (error) {
    console.error("Error verifying email code:", error)
    return {
      success: false,
      message: "Error al verificar el código",
    }
  }
}

// Guardar todos los datos al final del proceso
export const submitCompleteRegistration = async () => {
  try {
    const registrationData = getRegistrationData()
    const token = getRegistrationToken()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/complete-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(registrationData),
    })

    const data = await response.json()

    if (response.ok) {
      // Limpiar datos del localStorage después del éxito
      clearRegistrationData()
    }

    return {
      success: response.ok,
      message: data.message,
      registrationId: data.registration_id,
    }
  } catch (error) {
    console.error("Error submitting complete registration:", error)
    return {
      success: false,
      message: "Error al completar el registro",
    }
  }
}

// Guardar progreso actual (para el botón "Guardar y salir")
export const saveCurrentProgress = async (currentStep: string) => {
  try {
    const registrationData = getRegistrationData()
    const token = getRegistrationToken()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/save-progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...registrationData,
        currentStep,
      }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      message: data.message,
    }
  } catch (error) {
    console.error("Error saving progress:", error)
    return {
      success: false,
      message: "Error al guardar el progreso",
    }
  }
}
