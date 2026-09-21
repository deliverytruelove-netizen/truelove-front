// services/clientePedidosService.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export interface PedidoItem {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: number;
  estado: string;
  estado_numero: number;
  fecha_entrega: string;
  hora_entrega: string;
  local: string;
  logo: string;
  total: number;
  cantidad: number;
  items: PedidoItem[];
  direccion: string;
  created_at: string;
  requiere_confirmacion_local: boolean;
  existeCalificacion: boolean;
  tipo_pedido: string;
  paga_con: string | null;
}

export const fetchPedidosCliente = async (idCliente: number): Promise<Pedido[]> => {
  const response = await fetch(`${API_URL}/pedidos/cliente/${idCliente}`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

// Mismo texto que el helper estadoPedido() del backend (app/Helpers/helpers.php).
export const ESTADO_PEDIDO_TEXTO: Record<number, string> = {
  0: "Cancelado",
  1: "Pendiente",
  2: "Preparando tu pedido",
  3: "¡Pedido listo!",
  4: "Motorizado asignado",
  5: "Motorizado en el local",
  6: "Pedido en camino",
  7: "¡El motorizado llegó!",
  8: "Pedido entregado",
  9: "Listo para recoger",
};

export interface PedidoDetalleItem {
  id: number;
  pedido_id: number;
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio: string;
  tipo: "item" | "adicional";
  created_at: string;
  updated_at: string;
}

export interface PedidoTracking {
  id: number;
  pedido_id: number;
  estado: number;
  created_at: string;
  updated_at: string;
}

export interface PedidoDetalle {
  id: number;
  id_local: number;
  id_cliente: number;
  id_motorizado: number | null;
  latitud: string | null;
  longitud: string | null;
  direccion: string | null;
  referencia: string | null;
  nota: string | null;
  id_tipo_pago: number | null;
  tipo_comprobante: string | null;
  documento: string | null;
  precio_delivery: string;
  requiere_confirmacion_local: boolean;
  subtotal: string;
  descuento: string;
  codigo: string | null;
  foto_pago: string | null;
  tipo_pedido: number; // 0 = delivery, 1 = pickup
  paga_con: string | null;
  created_at: string;
  motorizado: string;
  celular_motorizado: string;
  foto_motorizado: string | null;
  detalle: string;
  detalleArray: PedidoDetalleItem[];
  ultimo_estado_tracking: number | string;
  estado: string;
  local: string;
  direccion_local: string;
  direccion_entrega: string;
  cliente: string;
  celular: string;
  trackings: PedidoTracking[];
}

export const fetchPedidoDetalle = async (idPedido: number): Promise<PedidoDetalle | null> => {
  const response = await fetch(`${API_URL}/get/pedidos/${idPedido}`);
  if (!response.ok) return null;
  return response.json();
};

export interface RepetirOrdenItem {
  id: number;
  name: string;
  category: string;
  image: string | null;
  price: string;
  discountedPrice: number;
  quantity: number;
}

export const repetirOrden = async (idPedido: number): Promise<RepetirOrdenItem[]> => {
  const response = await fetch(`${API_URL}/cliente/repetir/orden/${idPedido}`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const submitRating = async (payload: {
  id_pedido: number;
  restaurant_rating: number;
  restaurant_comment?: string;
}) => {
  const response = await fetch(`${API_URL}/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export interface Cupon {
  id: number;
  id_cliente: number;
  tipo_descuento: "porcentaje" | "monto_fijo" | "delivery_gratis";
  valor: string;
  codigo: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: boolean;
  cantidad_usos: number;
  usos_disponibles: number | null;
  descripcion: string | null;
}

export const fetchCuponesCliente = async (idCliente: number): Promise<Cupon[]> => {
  const response = await fetch(`${API_URL}/descuentos/cliente/${idCliente}`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export function formatCuponValor(cupon: Cupon): string {
  if (cupon.tipo_descuento === "delivery_gratis") return "Delivery gratis";
  if (cupon.tipo_descuento === "monto_fijo") return `S/ ${Number(cupon.valor).toFixed(2)} de descuento`;
  return `${Number(cupon.valor)}% de descuento`;
}
