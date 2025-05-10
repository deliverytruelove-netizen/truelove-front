// components\registerLocal\types.ts
export interface FormData {
    documentType: string
    documentNumber: string
    name: string
    lastName: string
    businessType: string
    phone: string
    email: string
    antecedentesPenales?: File
    antecedentesPoliciales?: File
    posToDriver?: boolean
  }
  
  export interface BusinessType {
    id: number
    nombre: string
  }
  
  