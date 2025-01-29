

interface BusinessData {
  nombre: string
  // Añade otros campos según necesites
}


export const fetchSocioData = async (registrationId: string): Promise<BusinessData> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocios/${registrationId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
  
      if (!response.ok) {
        throw new Error("Error al obtener datos del negocio")
      }
  
      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }
  
  

export const createSocioToken = async (registrationId: string): Promise<string> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/socios/${registrationId}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Error al crear el token del socio")
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error("Error:", error)
    throw error
  }
}

