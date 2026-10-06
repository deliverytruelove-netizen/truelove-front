// app\admin\deudas\types\deudas.types.ts

export type EstadoDeuda = "pendiente" | "pagado" | "anulado";

export interface Deuda {
  id: number;
  cliente_id: number;
  cliente: string | null;
  documento: string | null;
  telefono: string | null;
  pedido_id: number | null;
  motorizado: string | null;
  monto: string;
  motivo: string;
  estado: EstadoDeuda;
  registrado_por: "motorizado" | "admin";
  observaciones_admin: string | null;
  created_at: string;
  gestionada_at: string | null;
}

export interface ConteosDeudas {
  pendiente: number;
  pagado: number;
  anulado: number;
  monto_pendiente: number;
}

export interface FiltrosDeudas {
  estado?: EstadoDeuda;
  q?: string;
  desde?: string;
  hasta?: string;
  page?: number;
}

export interface RespuestaDeudas {
  conteos: ConteosDeudas;
  deudas: {
    data: Deuda[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface ClienteBusqueda {
  id: number;
  nombre: string;
  apellido: string;
  documento: string | null;
  celular: string | null;
}

export interface DatosDeuda {
  cliente_id?: number;
  pedido_id?: number | null;
  monto: number;
  motivo: string;
  observaciones_admin?: string;
}
