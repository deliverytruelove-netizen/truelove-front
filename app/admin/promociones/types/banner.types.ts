// app\admin\promociones\types\banner.types.ts
export interface Banner {
    id?: number
    titulo: string
    subtitulo: string
    color_fondo: string
    texto_boton: string
    url_boton: string
    url_imagen?: string | File
    estado: boolean
  }
  