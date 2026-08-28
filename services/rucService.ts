// services/rucService.ts
export const fetchRucDataService = async (ruc: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_WEB}/documento/ruc/${ruc}`,
    )

    if (!response.ok) {
      throw new Error("Error al consultar el RUC")
    }

    return await response.json()
  }
