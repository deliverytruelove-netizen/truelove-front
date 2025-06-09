// app\admin\coutas-drivers\types\couta.types.ts
export interface CuotaMotorizado {
  id: number
  motorizado_id: number
  semana_inicio: string
  semana_fin: string
  monto_cuota: number
  estado_pago: "pendiente" | "pagado" | "vencido"
  fecha_pago?: string
  fecha_vencimiento: string
  observaciones?: string
  metodo_pago?: string
  comprobante_pago?: string
  created_at: string
  updated_at: string
  motorizado: {
    id: number
    nombres: string
    apellidos: string
    email: string
    celular: string
  }
  dias_vencimiento?: number
}

export interface EstadisticasCuotas {
  total_cuotas: number
  cuotas_pagadas: number
  cuotas_pendientes: number
  cuotas_vencidas: number
  monto_total: number
  monto_cobrado: number
  monto_pendiente: number
}

export interface MotorizadoAprobado {
  id: number
  nombres: string
  apellidos: string
  email: string
  celular: string
}

export interface GenerarCuotasRequest {
  monto_cuota: number
  fecha_vencimiento: string
  motorizado_ids?: number[]
}

export interface MarcarPagadaRequest {
  metodo_pago: string
  observaciones?: string
  comprobante_pago?: string
}
