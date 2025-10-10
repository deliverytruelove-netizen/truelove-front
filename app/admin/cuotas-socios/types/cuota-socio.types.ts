// app/admin/cuotas-socios/types/cuota-socio.types.ts

export interface CuotaSocio {
  id: number
  periodicidad: "diario" | "semanal" | "quincenal" | "mensual"
  monto_cuota: number
  numero_cuenta: string
  tipo_cuenta?: string
  banco?: string
  metodos_pago_disponibles?: string[]
  estado: "activo" | "inactivo"
  fecha_inicio: string
  fecha_fin?: string
  descripcion?: string
  created_at: string
  updated_at: string
}

export interface PagoCuotaSocio {
  id: number
  cuota_socio_id: number
  socio_id: number
  comprobante_pago?: string
  estado_pago: "pendiente" | "aprobado" | "rechazado"
  fecha_pago: string
  monto_pagado: number
  metodo_pago?: string
  numero_operacion?: string
  observaciones?: string
  fecha_aprobacion?: string
  aprobado_por?: number
  motivo_rechazo?: string
  created_at: string
  updated_at: string
  cuota?: CuotaSocio
  socio?: {
    id: number
    name: string
    lastName: string
    email: string
    phone: string
  }
}

export interface EstadisticasPagos {
  total_pagos: number
  pagos_pendientes: number
  pagos_aprobados: number
  pagos_rechazados: number
  monto_total_aprobado: number
  monto_pendiente: number
}

export interface CrearCuotaRequest {
  periodicidad: "diario" | "semanal" | "quincenal" | "mensual"
  monto_cuota: number
  numero_cuenta: string
  tipo_cuenta?: string
  banco?: string
  metodos_pago_disponibles?: string[]
  descripcion?: string
  estado?: "activo" | "inactivo"
}

export interface ActualizarCuotaRequest {
  periodicidad?: "diario" | "semanal" | "quincenal" | "mensual"
  monto_cuota?: number
  numero_cuenta?: string
  tipo_cuenta?: string
  banco?: string
  metodos_pago_disponibles?: string[]
  estado?: "activo" | "inactivo"
  fecha_inicio?: string
  fecha_fin?: string
  descripcion?: string
}
