// services/solicitud-eliminacion.service.ts

import {
  SolicitudEliminacion,
  EstadisticasSolicitudes,
  RechazarSolicitudRequest,
  AprobarSolicitudRequest,
} from "../types/solicitud-eliminacion.types";

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No se encontró el token de autenticación");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * Obtener solicitudes pendientes
 */
export const fetchSolicitudesPendientes = async (): Promise<
  SolicitudEliminacion[]
> => {
  const response = await fetch(
    `${API_URL}/admin/cliente-deletion-requests`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener solicitudes pendientes");
  }

  const data = await response.json();
  return data.data;
};

/**
 * Obtener historial de solicitudes (aprobadas y rechazadas)
 */
export const fetchHistorialSolicitudes = async (
  status?: "approved" | "rejected"
): Promise<{ data: SolicitudEliminacion[]; total: number }> => {
  const url = status
    ? `${API_URL}/admin/cliente-deletion-requests/history?status=${status}`
    : `${API_URL}/admin/cliente-deletion-requests/history`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener el historial");
  }

  const result = await response.json();
  return result.data;
};

/**
 * Obtener estadísticas
 */
export const fetchEstadisticas = async (): Promise<EstadisticasSolicitudes> => {
  const response = await fetch(
    `${API_URL}/admin/cliente-deletion-requests/stats`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener estadísticas");
  }

  const data = await response.json();
  return data.data;
};

/**
 * Aprobar solicitud
 */
export const aprobarSolicitud = async (
  id: number,
  request?: AprobarSolicitudRequest
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/admin/cliente-deletion-requests/${id}/approve`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request || {}),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al aprobar la solicitud");
  }
};

/**
 * Rechazar solicitud
 */
export const rechazarSolicitud = async (
  id: number,
  request: RechazarSolicitudRequest
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/admin/cliente-deletion-requests/${id}/reject`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al rechazar la solicitud");
  }
};
