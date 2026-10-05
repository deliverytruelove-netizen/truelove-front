// app\admin\entrega-notas\types\entrega-notas.types.ts

export type EstadoNota = "pendiente" | "aprobada" | "rechazada";

export interface RepartidorNota {
  id: number;
  nombre: string;
  celular: string | null;
  foto: string | null;
}

export interface EntregaNota {
  id: number;
  nota: string | null;
  foto_url: string | null;
  estado: EstadoNota;
  motivo_rechazo: string | null;
  revisada_at: string | null;
  latitud: string;
  longitud: string;
  pedido_id: number | null;
  direccion: string | null;
  referencia: string | null;
  repartidor: RepartidorNota | null;
  created_at: string;
}

export interface ConteosNotas {
  pendiente: number;
  aprobada: number;
  rechazada: number;
}

export interface FiltrosNotas {
  estado?: EstadoNota;
  q?: string;
  con_foto?: boolean;
  page?: number;
}

export interface RespuestaNotas {
  conteos: ConteosNotas;
  notas: {
    data: EntregaNota[];
    current_page: number;
    last_page: number;
    total: number;
  };
}
