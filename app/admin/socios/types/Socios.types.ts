// app\admin\socios\types\Socios.types.ts
export interface Socio {
  id: number
  name: string
  lastName: string
  businessType: string
  phone: string
  email: string
  verification_code: string | null
  email_verified_at: string | null
  created_at: string | null
  updated_at: string | null
  aprobado?: boolean
  estado?: number
  user_id?: number
  documentType?: string
  documentNumber?: string
 
}

export interface DatosBancarios {
  titular_cuenta: string
  numero_cuenta: string
  nombre_banco: string
  tipo_cuenta: string
}

export interface DatosEstablecimiento {
  nombre_establecimiento: string
  direccion_completa: string
  ciudad: string
  codigo_postal: string
}

export interface DatosNegocio {
  ruc: string
  razon_social: string
}

export interface DocumentosPdfExtranjero {
  antecedentes_penales_pdf: string
  antecedentes_policiales_pdf: string
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface BusinessInfo {
  nombre: string;
  total_sucursales: number;
  metodo_contacto: string;
  telefono: string;
  tipo_pago_digital: number;
  numero_pago_digital: string | null;
  nombre_titular_pago_digital: string | null;
}

export interface DetallesSocio {
  id: number
  personal: {
    name: string
    lastName: string
    email: string
    phone: string
    businessType: string
    created_at: string
    posToDriver: number
    entrega_documento_venta: number
    cuota_socio_id?: number | null
    fecha_asignacion_cuota?: string | null
  }
  documentosPdfExtranjero: DocumentosPdfExtranjero | null
  business: BusinessInfo | null

  businessData: DatosNegocio | null
  establishment: DatosEstablecimiento | null
  bankData: DatosBancarios | null
  cuentaBancaria: {
    titular_cuenta: string
    dni: string
    banco: string
    tipo_cuenta: string
    numero_cuenta: string
    imagenes_cuenta: string[]
  } | null
  aprobado?: boolean
  documentType?: string
  documentNumber?: string
}

export interface SocioCompleto extends Socio {
  personal: boolean
  business: boolean //negocio
  businessData: boolean //datosClaves
  establishment: boolean //establecimiento
  bankData: boolean
  cuentaBancaria: boolean
}
export type BankAccountFormData = {
  titular_cuenta: string;
  dni: string;
  banco_id: number;
  tipo_cuenta_id: number;
  numero_cuenta: string;
  imagenes_cuenta?: File[];
};


export interface BankAccountUpdateData {
  titular_cuenta: string;
  dni: string;
  banco_id: number;
  tipo_cuenta_id: number;
  numero_cuenta: string;
  documentos?: File[];
}
// Agregar al final del archivo, antes de la última llave de cierre
export interface BusinessInfoFormData {
  nombre: string;
  total_sucursales: number;
  metodo_contacto: string;
  telefono: string;
  tipo_pago_digital: number;
  numero_pago_digital?: string;
  nombre_titular_pago_digital?: string;
}



export interface DatosNegocioFormData {
  ruc: string;
  razon_social: string;
}

export interface DatosBancariosFormData {
  titular_cuenta: string;
  numero_cuenta: string;
  nombre_banco: string;
  tipo_cuenta: string;
  documento_titular: string;
  codigo_cci?: string;
}
