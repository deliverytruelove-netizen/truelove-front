// app/socio/admin/cuotas/services/pago-cuota.service.ts

import type {
  CuotaActiva,
  MiPago,
  SubirComprobanteRequest,
  Periodo,
  PeriodoActual,
  VerificarAccesoResponse,
} from "../types/pago-cuota.types"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")
  if (!token) {
    throw new Error("No se encontró el token")
  }
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const fetchCuotaActiva = async (): Promise<CuotaActiva> => {
  const response = await fetch(`${API_URL}/socio/cuota-activa`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "No hay cuota activa")
  }

  const data = await response.json()
  return data.data
}

export const subirComprobante = async (request: SubirComprobanteRequest): Promise<MiPago> => {
  const formData = new FormData()
  formData.append("cuota_socio_id", request.cuota_socio_id.toString())
  formData.append("comprobante_pago", request.comprobante_pago)
  formData.append("fecha_pago", request.fecha_pago)
  formData.append("monto_pagado", request.monto_pagado.toString())
  formData.append("metodo_pago", request.metodo_pago)
  if (request.numero_operacion) {
    formData.append("numero_operacion", request.numero_operacion)
  }
  if (request.observaciones) {
    formData.append("observaciones", request.observaciones)
  }

  const response = await fetch(`${API_URL}/socio/subir-comprobante`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al subir comprobante")
  }

  const data = await response.json()
  return data.data
}

export const fetchMisPagos = async (): Promise<MiPago[]> => {
  const response = await fetch(`${API_URL}/socio/mis-pagos`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener el historial de pagos")
  }

  const data = await response.json()
  return data.data
}

export const fetchMiPeriodoActual = async (): Promise<PeriodoActual> => {
  const response = await fetch(`${API_URL}/socio/mi-periodo-actual`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "No se pudo obtener el período actual")
  }

  const data = await response.json()
  return data.data
}

export const fetchMisPeriodos = async (): Promise<Periodo[]> => {
  const response = await fetch(`${API_URL}/socio/mis-periodos`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener los períodos")
  }

  const data = await response.json()
  return data.data
}

export const verificarAcceso = async (): Promise<VerificarAccesoResponse> => {
  const response = await fetch(`${API_URL}/socio/verificar-acceso`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al verificar acceso")
  }

  const data = await response.json()
  return data.data
}

export interface PedidoPeriodo {
  id: number
  codigo: string | null
  cliente: string | null
  fecha: string
  subtotal: number
  comision: number
  neto: number
  num_productos: number
}

export interface PedidosPeriodoResponse {
  pedidos: PedidoPeriodo[]
  porcentaje: number | null
  periodo_inicio: string
  periodo_fin: string
}

export const fetchPedidosPeriodo = async (periodoId: number): Promise<PedidosPeriodoResponse> => {
  const response = await fetch(`${API_URL}/socio/pedidos-periodo/${periodoId}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener los pedidos del período")
  }

  const data = await response.json()
  return data.data
}

export const subirComprobantePeriodo = async (
  periodoId: number,
  comprobante: File,
  monto: number,
  metodoPago: string,
  numeroOperacion?: string,
  observaciones?: string,
): Promise<MiPago> => {
  const formData = new FormData()
  formData.append("periodo_id", periodoId.toString())
  formData.append("comprobante_pago", comprobante)
  formData.append("fecha_pago", new Date().toISOString().split("T")[0])
  formData.append("monto_pagado", monto.toString())
  formData.append("metodo_pago", metodoPago)
  if (numeroOperacion) {
    formData.append("numero_operacion", numeroOperacion)
  }
  if (observaciones) {
    formData.append("observaciones", observaciones)
  }

  const response = await fetch(`${API_URL}/socio/subir-comprobante-periodo`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al subir comprobante")
  }

  const data = await response.json()
  return data.data
}
