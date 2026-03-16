// app/admin/notificaciones/types/notification.types.ts

export interface NotificationLog {
  id: number;
  fcm_token: string;
  app_name: string | null;
  user_id: number | null;
  user_type: string | null;
  title: string | null;
  body: string | null;
  data: Record<string, unknown> | null;
  sent_at: string | null;
  received_at: string | null;
  opened_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  enviados: number;
  recibidos: number;
  abiertos: number;
}

export interface NotificationLogResponse {
  data: NotificationLog[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: NotificationStats;
}

export interface NotificationFilters {
  search?: string;
  app_name?: string;
  user_type?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  per_page?: number;
  page?: number;
}
