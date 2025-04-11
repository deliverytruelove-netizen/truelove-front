// services/rucService.ts
export const fetchRucDataService = async (ruc: string) => {
    const response = await fetch(
      `https://dniruc.apisperu.com/api/v1/ruc/${ruc}?token=${process.env.NEXT_PUBLIC_API_TOKEN}`,
    )
  
    if (!response.ok) {
      throw new Error("Error al consultar el RUC")
    }
  
    return await response.json()
  }
  