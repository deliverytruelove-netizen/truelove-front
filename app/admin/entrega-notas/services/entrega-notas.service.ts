// app\admin\entrega-notas\services\entrega-notas.service.ts

import { FiltrosNotas, RespuestaNotas } from "../types/entrega-notas.types";

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

const manejarError = async (response: Response, mensaje: string) => {
  const data = await response.json().catch(() => ({}));
  throw new Error(data.message || data.error || mensaje);
};

export const fetchEntregaNotas = async (
  filtros: FiltrosNotas
): Promise<RespuestaNotas> => {
  const params = new URLSearchParams();
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.q) params.set("q", filtros.q);
  if (filtros.con_foto) params.set("con_foto", "1");
  params.set("page", String(filtros.page ?? 1));

  const response = await fetch(
    `${API_URL}/admin/entrega-notas?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  if (!response.ok) await manejarError(response, "Error al obtener las notas");
  return response.json();
};

export const aprobarNota = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/entrega-notas/${id}/aprobar`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) await manejarError(response, "Error al aprobar la nota");
};

export const rechazarNota = async (
  id: number,
  motivo?: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/entrega-notas/${id}/rechazar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ motivo: motivo || null }),
  });
  if (!response.ok) await manejarError(response, "Error al rechazar la nota");
};

export const eliminarNota = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/entrega-notas/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) await manejarError(response, "Error al eliminar la nota");
};
