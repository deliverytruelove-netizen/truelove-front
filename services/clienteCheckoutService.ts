// services/clienteCheckoutService.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export interface MedioPago {
  id: number;
  nombre: string;
  estado: number;
}

export const fetchMediosPago = async (idEmpresa: number): Promise<MedioPago[]> => {
  const response = await fetch(`${API_URL}/get/medios/pago/${idEmpresa}`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const fetchPrecioDelivery = async (idLocal: number, idCliente: number): Promise<number> => {
  const response = await fetch(`${API_URL}/get/precio/delivery/${idLocal}/${idCliente}`);
  if (!response.ok) return 0;
  const data = await response.json();
  return Number(data) || 0;
};

export type TipoDescuento = "porcentaje" | "monto_fijo" | "delivery_gratis";

export interface CuponValidado {
  success: boolean;
  tipo?: TipoDescuento;
  valor?: string;
  message?: string;
}

export const validarCupon = async (codigo: string, idCliente: number): Promise<CuponValidado> => {
  const response = await fetch(`${API_URL}/validar/cupon/descuento/${encodeURIComponent(codigo)}/${idCliente}`);
  const data = await response.json().catch(() => ({}));
  return { success: response.ok && data.success, ...data };
};

export interface PedidoItemPayload {
  id: number;
  name: string;
  price: number;
  quantity: number;
  selectedAdicionales: {
    grupoId: number;
    items: { id: number; titulo: string; precio: number }[];
  }[];
}

export interface CrearPedidoPayload {
  id_local: number;
  id_cliente: number;
  latitud: number;
  longitud: number;
  nota: string;
  id_tipo_pago: number;
  tipo_comprobante: string;
  documento?: string;
  precio_delivery: number;
  descuento: number;
  subtotal: number;
  codigo?: string;
  paga_con: number | "exacto";
  tipo_entrega: "delivery" | "pickup";
  items: PedidoItemPayload[];
}

export interface CrearPedidoResponse {
  status: "success" | "error";
  pedido_id?: number;
  requiere_confirmacion?: boolean;
  precio_delivery?: number;
  message?: string;
}

export const crearPedido = async (payload: CrearPedidoPayload): Promise<CrearPedidoResponse> => {
  const response = await fetch(`${API_URL}/confirmar-pedido`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export interface VerificarConfirmacion {
  requiere_confirmacion: boolean;
  numero_local: string;
  tipo_pago_digital: "Yape" | "Plin" | "Ninguno";
  titular: string;
  estado: number;
  omitir_pago_adelantado: boolean;
}

export const fetchVerificarConfirmacion = async (pedidoId: number): Promise<VerificarConfirmacion | null> => {
  const response = await fetch(`${API_URL}/pedidos/${pedidoId}/verificar-confirmacion`);
  if (!response.ok) return null;
  return response.json();
};

export const uploadPaymentProof = async (pedidoId: number, file: File) => {
  const formData = new FormData();
  formData.append("pedido_id", String(pedidoId));
  formData.append("payment_proof", file);

  const response = await fetch(`${API_URL}/upload-payment-proof`, {
    method: "POST",
    body: formData,
  });
  return response.json();
};
