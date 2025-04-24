// Tipos para pedidos
export interface Pedido {
    id: number
    direccion_entrega: string
    estado: string
    tiempo_estimado: number
    cliente: string
    celular: string
    total: string
    detalle: string
    local: string
    direccion_local: string
    lat_local: number
    lon_local: number
    latitud: number
    longitud: number
  }
  
  // Tipos para estadísticas
  export interface EstadisticasData {
    totalPedidos: number
    pedidosEntregados: number
    tiempoPromedio: number
    calificacion: number
    cambioTotal: number
    cambioEntregados: number
    cambioTiempo: number
    cambioCalificacion: number
  }
  
  // Tipos para usuario
  export interface Usuario {
    id: number
    name: string
    email: string
    usuario: string
    email_verified_at?: string | null
    estado?: boolean
    created_at?: string
    updated_at?: string
    role_id?: number
    foto_perfil?: string
  }
  
  export interface Repartidor {
    id: number
    nombres: string
    apellidos: string
    email: string
    celular: string
    departamento: string
    vehiculo: string
    tipo_documento: string
    nro_documento: string
    mayor_edad: boolean
    acepta_politica: boolean
    documento_imagen_frente?: string
    documento_imagen_reverso?: string
    estado: boolean
    aprobado: boolean
    created_at: string
    updated_at: string
    username?: string | null
    password?: string | null
    user_id: number
  }
  
  export interface PerfilData {
    usuario: Usuario
    repartidor: Repartidor
  }
  