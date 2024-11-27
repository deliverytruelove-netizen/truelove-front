export interface ReviewData {
    datos_negocio: {
      nombre: string
      tipo: string
      categoria: string
      total_sucursales: number
      metodo_contacto: string
      telefono: string
      es_local_calle: boolean
    }
    direccion_negocio: {
      nombre_establecimiento: string
      calle: string
      numero: string
      codigo_postal: string
      ciudad: string
      provincia: string
      referencia: string | null
      direccion_completa: string
      latitud: string
      longitud: string
    }
    datos_legales: {
      razon_social: string
      ruc: string
    }
    datos_bancarios: {
      titular_cuenta: string
      numero_cuenta: string
      nombre_banco: string
      tipo_cuenta: string
      documento_titular: string
      codigo_cci: string
      usar_direccion_negocio: boolean
    }
  }
  
  