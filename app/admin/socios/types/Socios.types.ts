export interface Socio {
  id: number;
  name: string;
  lastName: string;
  businessType: string;
  phone: string;
  email: string;
  verification_code: string | null;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DatosBancarios {
  titular_cuenta: string;
  numero_cuenta: string;
  nombre_banco: string;
  tipo_cuenta: string;
}

export interface DatosEstablecimiento {
  nombre_establecimiento: string;
  direccion_completa: string;
  ciudad: string;
  codigo_postal: string;
}

export interface DatosNegocio {
  ruc: string;
  razon_social: string;
}

export interface DetallesSocio {
  id: number;
  personal: {
    name: string;
    lastName: string;
    email: string;
    phone: string;
    businessType: string;
    created_at: string;
  };
  business: {
    nombre: string;
    total_sucursales: number;
    metodo_contacto: string;
    telefono: string;
  } | null;
  businessData: DatosNegocio | null;
  establishment: DatosEstablecimiento | null;
  bankData: DatosBancarios | null;
  cuentaBancaria: {
    titular_cuenta: string;
    dni: string;
    banco: string;
    tipo_cuenta: string;
    numero_cuenta: string;
    imagenes_cuenta: string[];
  } | null;
  aprobado: boolean;
}
