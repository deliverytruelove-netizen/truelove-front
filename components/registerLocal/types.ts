// components\registerLocal\types.ts
export interface FormData {
    documentType: string
    documentNumber: string
    name: string
    lastName: string
    businessType: string
    phone: string
    email: string
    posToDriver: number
    entrega_documento_venta: number;
  }
  
  export interface BusinessType {
    id: number
    nombre: string
  }
  
  