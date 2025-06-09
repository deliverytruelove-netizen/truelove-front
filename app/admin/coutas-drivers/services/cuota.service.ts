// app\admin\coutas-drivers\services\cuota.service.ts
import type {
  CuotaMotorizado,
  EstadisticasCuotas,
  MotorizadoAprobado,
  GenerarCuotasRequest,
  MarcarPagadaRequest,
} from "../types/cuota.types"

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

export const fetchCuotas = async (filters?: {
  estado_pago?: string
  motorizado_id?: number
  semana_inicio?: string
  semana_fin?: string
}): Promise<CuotaMotorizado[]> => {
  const queryParams = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString())
      }
    })
  }

  const url = `${API_URL}/admin/cuotas-motorizados${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener las cuotas")
  }

  const data = await response.json()
  return data.data
}

export const generarCuotasSemanal = async (request: GenerarCuotasRequest): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/cuotas-motorizados/generar-semanal`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al generar las cuotas")
  }
}

export const marcarCuotaPagada = async (id: number, request: MarcarPagadaRequest): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/cuotas-motorizados/${id}/marcar-pagada`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al marcar la cuota como pagada")
  }
}

export const revertirPagoCuota = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/cuotas-motorizados/${id}/revertir-pago`, {
    method: "POST",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al revertir el pago")
  }
}

export const fetchEstadisticasCuotas = async (filters?: {
  fecha_inicio?: string
  fecha_fin?: string
}): Promise<EstadisticasCuotas> => {
  const queryParams = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString())
      }
    })
  }

  const url = `${API_URL}/admin/cuotas-motorizados/estadisticas${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener las estadísticas")
  }

  const data = await response.json()
  return data.data
}

export const fetchMotorizadosAprobados = async (): Promise<MotorizadoAprobado[]> => {
  const response = await fetch(`${API_URL}/admin/cuotas-motorizados/motorizados-aprobados`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener los motorizados")
  }

  const data = await response.json()
  return data.data
}

export const actualizarCuota = async (
  id: number,
  request: {
    monto_cuota: number
    fecha_vencimiento: string
    observaciones?: string
  },
): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/cuotas-motorizados/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al actualizar la cuota")
  }
}

export const eliminarCuota = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/cuotas-motorizados/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al eliminar la cuota")
  }
}
