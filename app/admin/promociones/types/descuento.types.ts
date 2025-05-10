// app/admin/promociones/types/descuento.types.ts
export interface DescuentoCliente {
  id: number;
  id_cliente: number;
  tipo_descuento: 'porcentaje' | 'monto_fijo' | 'delivery_gratis';
  valor: number;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: boolean;
  cantidad_usos: number;
  usos_disponibles: number | null;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    celular: string;
    documento?: string;
  };
  // Campos adicionales para el frontend
  cliente_nombre?: string;
  cliente_documento?: string;
}

export interface TopCliente {
  id: number;
  nombre: string;
  email: string;
  celular: string;
  documento?: string;
  total_pedidos: number;
  tiene_descuento_activo: boolean;
  descuento: DescuentoCliente | null;
}

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  celular: string;
  documento: string;
  total_pedidos: number;
  tiene_descuento_activo?: boolean;
  descuento?: DescuentoCliente | null;
}