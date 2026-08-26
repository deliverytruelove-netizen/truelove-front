// services/pedido-admin.service.ts

import {
  PaginatedResponse,
  PedidoAdmin,
  SolicitudCancelacion,
} from "../types/pedido.types";

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No se encontró el token de autenticación");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const fetchPedidos = async (params?: {
  fechaDesde?: string;
  fechaHasta?: string;
  local?: string;
  estado?: string;
  page?: number;
}): Promise<PaginatedResponse<PedidoAdmin>> => {
  const query = new URLSearchParams();
  if (params?.fechaDesde) query.set("fecha_desde", params.fechaDesde);
  if (params?.fechaHasta) query.set("fecha_hasta", params.fechaHasta);
  if (params?.local) query.set("local", params.local);
  if (params?.estado) query.set("estado", params.estado);
  if (params?.page) query.set("page", String(params.page));

  const response = await fetch(`${API_URL}/admin/pedidos?${query.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener los pedidos");
  }

  return response.json();
};

export const fetchPedido = async (id: number): Promise<PedidoAdmin> => {
  const response = await fetch(`${API_URL}/admin/pedidos/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener el pedido");
  }

  return response.json();
};

export const cambiarEstadoPedido = async (
  id: number,
  estado: number
): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/pedidos/${id}/estado`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al cambiar el estado del pedido");
  }
};

export const actualizarFechaPedido = async (
  id: number,
  fecha: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/pedidos/${id}/fecha`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ fecha }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar la fecha del pedido");
  }
};

export const fetchSolicitudesCancelacionPendientes = async (): Promise<
  SolicitudCancelacion[]
> => {
  const response = await fetch(
    `${API_URL}/admin/pedidos/cancelacion-solicitudes`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener las solicitudes de cancelación");
  }

  return response.json();
};

export const fetchHistorialSolicitudesCancelacion = async (): Promise<
  PaginatedResponse<SolicitudCancelacion>
> => {
  const response = await fetch(
    `${API_URL}/admin/pedidos/cancelacion-solicitudes/history`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener el historial de solicitudes");
  }

  return response.json();
};

export const aprobarSolicitudCancelacion = async (id: number): Promise<void> => {
  const response = await fetch(
    `${API_URL}/admin/pedidos/cancelacion-solicitudes/${id}/approve`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al aprobar la solicitud");
  }
};

export const rechazarSolicitudCancelacion = async (id: number): Promise<void> => {
  const response = await fetch(
    `${API_URL}/admin/pedidos/cancelacion-solicitudes/${id}/reject`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al declinar la solicitud");
  }
};

export const getEstadoInfo = (
  estado: number | null
): { label: string; color: string } => {
  switch (estado) {
    case 0:
      return { label: "Cancelado", color: "bg-red-100 text-red-800" };
    case 1:
      return { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" };
    case 2:
      return { label: "Preparando", color: "bg-blue-100 text-blue-800" };
    case 3:
      return { label: "Listo en local", color: "bg-purple-100 text-purple-800" };
    case 4:
      return { label: "Motorizado asignado", color: "bg-cyan-100 text-cyan-800" };
    case 5:
      return { label: "Motorizado en el local", color: "bg-indigo-100 text-indigo-800" };
    case 6:
      return { label: "En camino", color: "bg-orange-100 text-orange-800" };
    case 7:
      return { label: "Motorizado llegó", color: "bg-teal-100 text-teal-800" };
    case 8:
      return { label: "Entregado", color: "bg-green-100 text-green-800" };
    case 9:
      return { label: "Listo para recoger", color: "bg-indigo-100 text-indigo-800" };
    default:
      return { label: "Sin seguimiento", color: "bg-gray-100 text-gray-800" };
  }
};

export const ESTADOS_PEDIDO = [
  { value: 0, label: "Cancelado" },
  { value: 1, label: "Pendiente" },
  { value: 2, label: "Preparando" },
  { value: 3, label: "Listo en local" },
  { value: 4, label: "Motorizado asignado" },
  { value: 5, label: "Motorizado en el local" },
  { value: 6, label: "En camino" },
  { value: 7, label: "Motorizado llegó" },
  { value: 8, label: "Entregado" },
  { value: 9, label: "Listo para recoger" },
];
