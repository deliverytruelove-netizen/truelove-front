// types/pedido.types.ts

export interface PedidoTracking {
  id: number;
  pedido_id: number;
  estado: number;
  created_at: string;
}

export interface PedidoAdmin {
  id: number;
  id_local: number;
  id_cliente: number;
  id_motorizado: number | null;
  ultimo_estado_tracking: number | null;
  estado_label: string;
  local: string | null;
  cliente: string | null;
  celular_cliente: string | null;
  motorizado_nombre: string | null;
  subtotal: number;
  precio_delivery: number;
  descuento: number;
  created_at: string;
  updated_at: string;
  trackings?: PedidoTracking[];
  solicitud_cancelacion_pendiente: SolicitudCancelacion | null;
}

export interface SolicitudCancelacion {
  id: number;
  pedido_id: number;
  estado_pedido_al_solicitar: number;
  motivo: string;
  status: "pending" | "approved" | "rejected";
  solicitado_por_socio_id: number | null;
  revisado_por_admin_id: number | null;
  revisado_at: string | null;
  created_at: string;
  updated_at: string;
  pedido?: {
    id: number;
    local: string | null;
    cliente: string | null;
  };
  revisor?: {
    id: number;
    name: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}
