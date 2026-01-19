// app/admin/clientes/types/cliente.types.ts

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  celular: string | null;
  fecha_nacimiento: string;
  genero: string;
  nacionalidad: string;
  foto_perfil: string | null;
  dni_photo: string | null;
  selfie_photo: string | null;
  token_fmc: string | null;
  password: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClienteDireccion {
  id: number;
  direccion: string;
  referencia: string | null;
  alias: string | null;
  departamento: string;
  coordenadas: string | null;
  latitud: string | null;
  longitud: string | null;
  created_at: string;
}

export interface UltimoPedido {
  id: number;
  fecha: string;
  estado: string;
  total: number;
}

export interface DetallesCliente {
  id: number;
  personal: {
    nombre: string;
    apellido: string;
    nombre_completo: string;
    email: string;
    documento: string;
    celular: string | null;
    fecha_nacimiento: string;
    genero: string;
    nacionalidad: string;
    foto_perfil: string | null;
    dni_photo: string | null;
    selfie_photo: string | null;
    created_at: string;
    updated_at: string;
  };
  direcciones: ClienteDireccion[];
  estadisticas: {
    total_pedidos: number;
    pedidos_completados: number;
    pedidos_cancelados: number;
    ultimo_pedido: UltimoPedido | null;
  };
}
