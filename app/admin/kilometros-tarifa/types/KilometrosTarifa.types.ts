export interface KilometrosTarifa {
  id: number
  precio_base_diurno: number | string
  precio_base_nocturno: number | string
  precio_por_km_diurno: number | string
  precio_por_km_nocturno: number | string
  precio_maximo: number | string | null
  distancia_maxima: number | string | null
  distancia_minima: number | string | null
  activo: boolean
  nombre: string
  descripcion?: string
  created_at: string
  updated_at: string
}

export interface KilometrosTarifaFormData {
  precio_base_diurno: number
  precio_base_nocturno: number
  precio_por_km_diurno: number
  precio_por_km_nocturno: number
  precio_maximo: number | null
  distancia_maxima: number | null
  distancia_minima: number | null
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

// Nuevos tipos para el sistema de rangos
export interface TarifaRango {
  id?: number
  tarifa_configuracion_id?: number
  distancia_desde: number | string
  distancia_hasta: number | string
  precio_diurno: number | string
  precio_nocturno: number | string
  created_at?: string
  updated_at?: string
}

export interface TarifaConfiguracion {
  id: number
  nombre: string
  descripcion?: string
  hora_inicio_nocturno: string
  hora_fin_nocturno: string
  activo: boolean
  rangos?: TarifaRango[]
  business_registration_id?: number | null
  modo_tarifa?: 'rangos' | 'precio_por_km'
  // Campos para modo precio_por_km
  precio_base_diurno?: number | string
  precio_base_nocturno?: number | string
  precio_por_km_diurno?: number | string
  precio_por_km_nocturno?: number | string
  precio_maximo?: number | string | null
  created_at: string
  updated_at: string
}

export interface LocalConConfig {
  id: number
  nombre: string
  tiene_config_propia: boolean
  config?: TarifaConfiguracion | null
}

export interface CalculadoraRequest {
  id_local: number
  id_cliente: number
}

export interface CalculadoraResponse {
  success: boolean
  data?: {
    distancia_km: number
    precio_calculado: string | number
    modo_tarifa: 'rangos' | 'precio_por_km'
    rango_aplicado?: {
      distancia_desde: string | number
      distancia_hasta: string | number | null
      precio_diurno: string | number
      precio_nocturno: string | number
    } | null
    horario_nocturno?: { inicio: string; fin: string }
    config_nombre?: string
    local: {
      id: number
      nombre: string
      tiene_config_propia: boolean
    }
    cliente: {
      id: number
      nombre: string
      direccion: string
    }
  }
  message?: string
}

export interface LocalOption {
  id: number
  nombre: string
  coordenadas: string
}

export interface ClienteOption {
  id: number
  nombre: string
  direccion: string
}