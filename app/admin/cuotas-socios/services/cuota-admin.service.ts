// app/admin/cuotas-socios/services/cuota-admin.service.ts

import type { Periodo } from "@/app/socio/admin/cuotas/types/pago-cuota.types"
import type { CalculoPeriodoResponse, DetallePeriodoResponse } from "../types/cuota-socio.types"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")
  if (!token) {
    throw new Error("No se encontró el token")
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
}

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
  fecha_inicio: string
  fecha_fin?: string
  descripcion?: string
  estado: "activo" | "inactivo"
  dia_pago?: number // Día del mes para realizar el pago (1-31)
  dia_pago_nota?: string // Notas explicativas sobre el día de pago
}

export const fetchCuotasActivas = async (): Promise<CuotaSocio[]> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener las cuotas activas")
  }

  const data = await response.json()
  return data.data
}

export const asignarCuotaASocio = async (socioId: number, cuotaId: number, cantidadPeriodos: number = 12, fechaInicio?: string, diaPago?: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/asignar-cuota`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      socio_id: socioId,
      cuota_socio_id: cuotaId,
      cantidad_periodos: cantidadPeriodos,
      fecha_inicio: fechaInicio,
      dia_pago: diaPago,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al asignar cuota")
  }
}

export const removerCuotaDeSocio = async (socioId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/remover-cuota/${socioId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al remover cuota")
  }
}

export const verPeriodosDeSocio = async (socioId: number): Promise<Periodo[]> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/periodos/${socioId}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener los períodos del socio")
  }

  const data = await response.json()
  return data.data
}

export const obtenerDetalleCuota = async (cuotaId: number): Promise<CuotaSocio> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/${cuotaId}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener el detalle de la cuota")
  }

  const data = await response.json()
  return data.data
}

export interface EstadoPagosSocio {
  tiene_cuota: boolean
  cuota?: CuotaSocio
  periodos_vencidos: number
  periodos_pendientes: number
  periodos_pagados: number
  total_adeudado: number
  esta_al_dia: boolean
  dias_vencimiento?: number
}

export const obtenerEstadoPagosSocio = async (socioId: number): Promise<EstadoPagosSocio> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/estado-pagos/${socioId}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener el estado de pagos del socio")
  }

  const data = await response.json()
  return data.data
}

export const actualizarDiaPago = async (cuotaId: number, diaPago: number, diaPagoNota?: string): Promise<CuotaSocio> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/${cuotaId}/actualizar-dia-pago`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      dia_pago: diaPago,
      dia_pago_nota: diaPagoNota,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al actualizar día de pago")
  }

  const data = await response.json()
  return data.data
}

// ==================== NUEVOS ENDPOINTS PARA COMISIONES POR PORCENTAJE ====================

/**
 * Calcular manualmente la cuota/comisión de un período específico
 */
export const calcularPeriodo = async (periodoId: number): Promise<CalculoPeriodoResponse> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/calcular-periodo/${periodoId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al calcular el período")
  }

  return await response.json()
}

/**
 * Calcular todas las cuotas pendientes de un socio
 */
export const calcularCuotasSocio = async (socioId: number): Promise<unknown> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/calcular-socio/${socioId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al calcular las cuotas del socio")
  }

  return await response.json()
}

/**
 * Calcular cuotas para todos los socios de una cuota específica
 */
export const calcularTodasLasCuotas = async (cuotaId: number): Promise<unknown> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/calcular-todos/${cuotaId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al calcular las cuotas")
  }

  return await response.json()
}

/**
 * Obtener detalle completo de un período con cálculos
 */
export const obtenerDetallePeriodo = async (periodoId: number): Promise<DetallePeriodoResponse> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/detalle-periodo/${periodoId}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al obtener el detalle del período")
  }

  return await response.json()
}
