// app\admin\metodo-pago\types\metodo-pago.types.ts
export interface MetodoPago {
    id?: number
    nombre: string
    estado: boolean
  }
  // Interfaces para manejo de errores
export interface ValidationError {
  validationErrors: Record<string, string[]>
}

export interface ApiError extends Error {
  validationErrors?: Record<string, string[]>
}