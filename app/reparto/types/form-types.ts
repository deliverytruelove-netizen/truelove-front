

// app\reparto\types\form-types.ts
export interface FormData {
  departamento: string
  vehiculo: string
  tipoDocumento: string
  nroDocumento: string
  nombres: string
  apellidos: string
  celular: string
  email: string
  mayorEdad: string
  aceptaPolitica: boolean
  documentoImagenFrente: string | null
  documentoImagenReverso: string | null
  documentosAdicionales: DocumentoAdicional[]
}

export interface DocumentInfo {
  nombres?: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  razonSocial?: string
}

export interface DocumentoAdicional{
  nombre: string
  archivo : string
  tipo: string
}