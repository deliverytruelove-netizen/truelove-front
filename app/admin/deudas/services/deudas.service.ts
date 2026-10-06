// app\admin\deudas\services\deudas.service.ts

import {
  ClienteBusqueda,
  DatosDeuda,
  EstadoDeuda,
  FiltrosDeudas,
  RespuestaDeudas,
} from "../types/deudas.types";

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No se encontró el token de autenticación");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
};

const manejarError = async (response: Response, mensaje: string): Promise<never> => {
  const data = await response.json().catch(() => ({}));
  const detalle =
    data.message ||
    data.error ||
    (data.errors ? Object.values(data.errors).flat().join(" ") : "");
  throw new Error(detalle || mensaje);
};

export const fetchDeudas = async (filtros: FiltrosDeudas): Promise<RespuestaDeudas> => {
  const params = new URLSearchParams();
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.q) params.set("q", filtros.q);
  if (filtros.desde) params.set("desde", filtros.desde);
  if (filtros.hasta) params.set("hasta", filtros.hasta);
  params.set("page", String(filtros.page ?? 1));

  const response = await fetch(`${API_URL}/admin/deudas?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await manejarError(response, "Error al obtener las deudas");
  return response.json();
};

export const buscarClientes = async (q: string): Promise<ClienteBusqueda[]> => {
  const response = await fetch(
    `${API_URL}/admin/deudas/buscar-clientes?q=${encodeURIComponent(q)}`,
    { headers: getAuthHeaders() }
  );
  if (!response.ok) await manejarError(response, "Error al buscar clientes");
  return response.json();
};

export const crearDeuda = async (datos: DatosDeuda): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/deudas`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(datos),
  });
  if (!response.ok) await manejarError(response, "Error al crear la deuda");
};

export const actualizarDeuda = async (
  id: number,
  datos: Partial<DatosDeuda> & { estado?: EstadoDeuda }
): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/deudas/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(datos),
  });
  if (!response.ok) await manejarError(response, "Error al actualizar la deuda");
};

export const eliminarDeuda = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/deudas/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) await manejarError(response, "Error al eliminar la deuda");
};
