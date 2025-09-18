export interface KilometrosTarifa {
  id: number
  precio_base_diurno: number | string
  precio_base_nocturno: number | string
  precio_maximo: number | string
  distancia_maxima: number | string
  distancia_minima: number | string
  activo: boolean
  nombre: string
  descripcion?: string
  created_at: string
  updated_at: string
}

export interface KilometrosTarifaFormData {
  precio_base_diurno: number
  precio_base_nocturno: number
  precio_maximo: number
  distancia_maxima: number
  distancia_minima: number
  activo: boolean
  nombre: string
  descripcion?: string
}

export interface KilometrosTarifaApiResponse {
  success: boolean
  data?: KilometrosTarifa | KilometrosTarifa[]
  message?: string
  error?: string
  errors?: Record<string, string[]>
}