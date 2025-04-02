// app\admin\motorizado\types\motorizado.types.ts
export interface Motorizado {
  id: number;
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
  tipo_documento: string;
  nro_documento: string;
  estado: boolean;
  aprobado: boolean;
  created_at: string;
  documento_imagen?: string;
}

export interface DetallesMotorizado {
  id: number;
  personal: {
    name: string;
    lastName: string;
    email: string;
    phone: string;
    tipo_documento: string;
    nro_documento: string;
    created_at: string;
    documento_imagen_frente?: string;
    documento_imagen_reverso?: string;
  };
  datosPersonales: {
    fecha_nacimiento: string;
    genero: string;
    url_selfie: string;
    departamento?:string;
    distrito: string;
    provincia: string;
  } | null;
  datosBancarios: {
    titular: string;
    dni: string;
    banco: string;
    tipo_cuenta: string;
    numero_cuenta: string;
    imagen_cuenta?: string; 
  } | null;
  registroVehiculo: {
    placa: string;
    licencia_conducir: string;
    seguro: string;
    tarjeta_propiedad: string;
    imagen_placa: string;
    imagen_licencia: string;
    imagen_seguro: string;
    imagen_tarjeta_propiedad: string;
  } | null;
  aprobado: boolean;
}
