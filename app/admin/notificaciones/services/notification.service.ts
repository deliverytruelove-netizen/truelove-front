// app/admin/notificaciones/services/notification.service.ts

import type { NotificationLogResponse, NotificationFilters } from '../types/notification.types';

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export const fetchNotificationLogs = async (filters: NotificationFilters = {}): Promise<NotificationLogResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error('No se encontró el token de autenticación');

  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.app_name) params.append('app_name', filters.app_name);
  if (filters.user_type) params.append('user_type', filters.user_type);
  if (filters.estado) params.append('estado', filters.estado);
  if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
  if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
  if (filters.per_page) params.append('per_page', String(filters.per_page));
  if (filters.page) params.append('page', String(filters.page));

  const response = await fetch(`${API_URL}/admin/notification-logs?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener logs de notificaciones');
  }

  return response.json();
};
