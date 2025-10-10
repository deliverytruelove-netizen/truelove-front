// app/admin/cuotas-socios/services/cuota-admin.service.ts

import type { Periodo } from "@/app/socio/admin/cuotas/types/pago-cuota.types"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")
  if (!token) {
    throw new Error("No se encontró el token")
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

export interface CuotaSocio {
  id: number
  periodicidad: "diario" | "semanal" | "quincenal" | "mensual"
  monto_cuota: number
  numero_cuenta: string
  tipo_cuenta?: string
  banco?: string
  metodos_pago_disponibles?: string[]
  fecha_inicio: string
  fecha_fin?: string
  descripcion?: string
  estado: "activo" | "inactivo"
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

export const asignarCuotaASocio = async (socioId: number, cuotaId: number, cantidadPeriodos: number = 12, fechaInicio?: string): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/asignar-cuota`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      socio_id: socioId,
      cuota_socio_id: cuotaId,
      cantidad_periodos: cantidadPeriodos,
      fecha_inicio: fechaInicio,
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
