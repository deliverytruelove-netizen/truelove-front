// app/socio/admin/cuotas/types/pago-cuota.types.ts

export interface CuotaActiva {
  id: number
  periodicidad: "diario" | "semanal" | "quincenal" | "mensual"
  monto_cuota: number | string // El backend puede enviar string
  numero_cuenta: string
  tipo_cuenta?: string
  banco?: string
  metodos_pago_disponibles?: string[]
  fecha_inicio: string
  fecha_fin?: string
  descripcion?: string
  dia_pago?: number // Día del mes para realizar el pago (1-31)
  dia_pago_nota?: string // Notas explicativas sobre el día de pago
}

export interface MiPago {
  id: number
  cuota_socio_id: number
  comprobante_pago?: string
  estado_pago: "pendiente" | "aprobado" | "rechazado"
  fecha_pago: string
  monto_pagado: number | string // El backend puede enviar string
  metodo_pago?: string
  numero_operacion?: string
  observaciones?: string
  motivo_rechazo?: string
  created_at: string
  cuota?: CuotaActiva
}

export interface SubirComprobanteRequest {
  cuota_socio_id: number
  comprobante_pago: File
  fecha_pago: string
  monto_pagado: number
  metodo_pago: string
  numero_operacion?: string
  observaciones?: string
}

export interface Periodo {
  id: number
  negocio_id: number
  cuota_socio_id: number
  numero_periodo: number
  periodo_inicio: string
  periodo_fin: string
  fecha_vencimiento: string
  monto_esperado: number | string // El backend puede enviar string
  estado: "pendiente" | "pagado" | "vencido" | "en_revision"
  pago_id?: number
  notificado_vencimiento: boolean
  created_at: string
  updated_at: string
  dias_para_vencer?: number
  esta_vencido?: boolean
  pago?: MiPago
}

export interface PeriodoActual {
  periodo: Periodo
  puede_pagar: boolean
  mensaje?: string
}

export interface VerificarAccesoResponse {
  puede_acceder: boolean
  can_access: boolean
  motivo?: string | null
  mensaje?: string | null
  message?: string | null
  dias_vencimiento?: number | null
  periodo?: Periodo
}
