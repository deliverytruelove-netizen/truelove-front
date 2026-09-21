// services/clienteNotificationsService.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export interface Notificacion {
  id: number;
  title: string;
  body: string;
  opened_at: string | null;
  created_at: string;
  [key: string]: unknown;
}

export const fetchNotificaciones = async (
  idCliente: number
): Promise<{ data: Notificacion[]; noLeidas: number }> => {
  const response = await fetch(`${API_URL}/notificaciones/cliente/${idCliente}`);
  if (!response.ok) return { data: [], noLeidas: 0 };
  const json = await response.json();
  return { data: json.data || [], noLeidas: json.no_leidas || 0 };
};

export const marcarTodasLeidas = async (idCliente: number) => {
  await fetch(`${API_URL}/notificaciones/cliente/${idCliente}/marcar-todas-leidas`, { method: "POST" });
};

export const marcarNotificacionLeida = async (notificationId: number) => {
  await fetch(`${API_URL}/notifications/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notification_id: notificationId, status: "opened" }),
  });
};
