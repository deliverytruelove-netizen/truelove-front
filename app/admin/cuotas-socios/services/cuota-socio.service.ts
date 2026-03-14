// app/admin/cuotas-socios/services/cuota-socio.service.ts

import type {
  CuotaSocio,
  PagoCuotaSocio,
  EstadisticasPagos,
  CrearCuotaRequest,
  ActualizarCuotaRequest,
} from "../types/cuota-socio.types"

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

// ==================== CUOTAS ====================

export const fetchCuotas = async (): Promise<CuotaSocio[]> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener las cuotas")
  }

  const data = await response.json()
  return data.data
}

export const fetchCuotaActiva = async (): Promise<CuotaSocio> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/activa`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("No hay cuota activa")
  }

  const data = await response.json()
  return data.data
}

export const crearCuota = async (request: CrearCuotaRequest): Promise<CuotaSocio> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al crear la cuota")
  }

  const data = await response.json()
  return data.data
}

export const actualizarCuota = async (id: number, request: ActualizarCuotaRequest): Promise<CuotaSocio> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al actualizar la cuota")
  }

  const data = await response.json()
  return data.data
}

export const eliminarCuota = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al eliminar la cuota")
  }
}

// ==================== PAGOS ====================

export const fetchPagos = async (estado?: string): Promise<PagoCuotaSocio[]> => {
  const url = estado
    ? `${API_URL}/admin/cuotas-socios/pagos?estado=${estado}`
    : `${API_URL}/admin/cuotas-socios/pagos`

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener los pagos")
  }

  const data = await response.json()
  return data.data
}

export const aprobarPago = async (id: number, observaciones?: string): Promise<PagoCuotaSocio> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/pagos/${id}/aprobar`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ observaciones }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al aprobar el pago")
  }

  const data = await response.json()
  return data.data
}

export const rechazarPago = async (id: number, motivo_rechazo: string): Promise<PagoCuotaSocio> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/pagos/${id}/rechazar`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ motivo_rechazo }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al rechazar el pago")
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
  dias_vencimiento: number | null
  monto_esperado: number
}

export const fetchEstadoPagosSocio = async (socioId: number): Promise<EstadoPagosSocio> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/estado-pagos/${socioId}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener estado de pagos")
  }

  const data = await response.json()
  return data.data
}

export const fetchEstadisticas = async (): Promise<EstadisticasPagos> => {
  const response = await fetch(`${API_URL}/admin/cuotas-socios/estadisticas`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener las estadísticas")
  }

  const data = await response.json()
  return data.data
}
