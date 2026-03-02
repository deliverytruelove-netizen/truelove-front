// app/admin/cuotas-socios/types/cuota-socio.types.ts

export interface CuotaSocio {
  id: number
  periodicidad: "diario" | "semanal" | "quincenal" | "mensual"
  tipo_cuota: "monto_fijo" | "porcentaje"
  monto_cuota: number
  porcentaje_comision?: number | null
  minimo_pedidos?: number | null
  exonerar_si_menos_pedidos?: boolean
  monto_minimo?: number | null
  monto_uso_app?: number | null
  monto_maximo?: number | null
  numero_cuenta: string
  tipo_cuenta?: string
  banco?: string
  metodos_pago_disponibles?: string[]
  numero_yape?: string | null
  titular_yape?: string | null
  estado: "activo" | "inactivo"
  fecha_inicio: string
  fecha_fin?: string
  descripcion?: string
  dia_pago?: number | null
  dia_pago_nota?: string | null
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
  tipo_cuota: "monto_fijo" | "porcentaje"
  monto_cuota?: number
  porcentaje_comision?: number
  minimo_pedidos?: number
  exonerar_si_menos_pedidos?: boolean
  monto_minimo?: number
  monto_uso_app?: number
  monto_maximo?: number
  numero_cuenta: string
  tipo_cuenta?: string
  banco?: string
  metodos_pago_disponibles?: string[]
  numero_yape?: string
  titular_yape?: string
  descripcion?: string
  estado?: "activo" | "inactivo"
  dia_pago?: number
}

export interface ActualizarCuotaRequest {
  periodicidad?: "diario" | "semanal" | "quincenal" | "mensual"
  tipo_cuota?: "monto_fijo" | "porcentaje"
  monto_cuota?: number
  porcentaje_comision?: number
  minimo_pedidos?: number
  exonerar_si_menos_pedidos?: boolean
  monto_minimo?: number
  monto_uso_app?: number
  monto_maximo?: number
  numero_cuenta?: string
  tipo_cuenta?: string
  banco?: string
  metodos_pago_disponibles?: string[]
  numero_yape?: string
  titular_yape?: string
  estado?: "activo" | "inactivo"
  fecha_inicio?: string
  fecha_fin?: string
  descripcion?: string
  dia_pago?: number
}

// Tipos para períodos de cuotas
export interface PeriodoCuotaSocio {
  id: number
  cuota_socio_id: number
  socio_id: number
  periodo_inicio: string
  periodo_fin: string
  monto_esperado: number
  total_ventas: number
  cantidad_pedidos: number
  monto_calculado?: number | null
  fecha_calculo?: string | null
  estado: string
  fecha_vencimiento: string
  created_at: string
  updated_at: string
  cuota?: CuotaSocio
}

// Respuesta del cálculo de período
export interface CalculoPeriodoResponse {
  success: boolean
  message: string
  data: {
    periodo_id: number
    total_ventas: number
    cantidad_pedidos: number
    monto_calculado: number
    monto_esperado: number
    fecha_calculo: string
  }
}

// Respuesta del detalle de período
export interface DetallePeriodoResponse {
  success: boolean
  data: {
    periodo: PeriodoCuotaSocio
    detalle_calculo: {
      total_ventas: number
      cantidad_pedidos: number
      tipo_cuota: string
      porcentaje_comision?: number
      minimo_pedidos?: number
      exonerar_si_menos_pedidos?: boolean
      monto_minimo?: number
      monto_calculado: number
      monto_esperado: number
    }
  }
}
