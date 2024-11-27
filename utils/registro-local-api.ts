const API_BASE_URL = process.env.NEXT_PUBLIC_API_WEB

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL must be set')
}

interface RegisterBusinessData {
  documentType: string
  documentNumber: string
  name: string
  lastName: string
  businessType: string
  phone: string
  email: string
}

export async function registerBusiness(formData: RegisterBusinessData) {
  try {
    const cleanEmail = formData.email.trim().toLowerCase()
    
    // Simple email validation
    if (!cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Email inválido')
    }

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        phone: formData.phone.replace(/\D/g, ''),
        email: cleanEmail // Send email directly without encryption
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || data.error || 'Error en el registro del negocio')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en el registro:', error)
    throw error instanceof Error 
      ? error 
      : new Error('Error al conectar con el servidor')
  }
}

