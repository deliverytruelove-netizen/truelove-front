// app\admin\mensajes\types\WhatsappStats.types.ts
export interface WhatsappCuenta {
  nombre: string | null
  telefono: string | null
  calidad: string | null
}

export interface WhatsappStats {
  mensajes_enviados_mes: number
  mensajes_gratuitos_mes: number
  cargos_aproximados_mensajes: number
  llamadas_mes: number
  duracion_promedio_llamadas_seg: number
  cargos_aproximados_llamadas: number
  cuenta: WhatsappCuenta
}
