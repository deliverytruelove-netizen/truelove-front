// services\formDataService.ts

/**
 * Servicio para manejar el almacenamiento temporal de datos del formulario de registro
 */
export const FormDataService = {
  // Claves para el almacenamiento
  KEYS: {
    REGISTRO_BASICO: 'reparto_registro_basico',
    DATOS_PERSONALES: 'reparto_datos_personales',
    CUENTA_BANCARIA: 'reparto_cuenta_bancaria',
    VEHICULO: 'reparto_vehiculo',
  },

  // Guardar datos básicos del registro
  guardarDatosBasicos(datos: Record<string, unknown>) {
    sessionStorage.setItem(this.KEYS.REGISTRO_BASICO, JSON.stringify(datos));
  },

  // Obtener datos básicos del registro
  obtenerDatosBasicos() {
    const datos = sessionStorage.getItem(this.KEYS.REGISTRO_BASICO);
    return datos ? JSON.parse(datos) : null;
  },

  // Guardar datos personales
  guardarDatosPersonales(datos: Record<string, unknown>) {
    sessionStorage.setItem(this.KEYS.DATOS_PERSONALES, JSON.stringify(datos));
  },

  // Obtener datos personales
  obtenerDatosPersonales() {
    const datos = sessionStorage.getItem(this.KEYS.DATOS_PERSONALES);
    return datos ? JSON.parse(datos) : null;
  },

  // Guardar datos bancarios
  guardarCuentaBancaria(datos: Record<string, unknown>) {
    sessionStorage.setItem(this.KEYS.CUENTA_BANCARIA, JSON.stringify(datos));
  },

  // Obtener datos bancarios
  obtenerCuentaBancaria() {
    const datos = sessionStorage.getItem(this.KEYS.CUENTA_BANCARIA);
    return datos ? JSON.parse(datos) : null;
  },

  // Guardar datos del vehículo
  guardarVehiculo(datos: Record<string, unknown>) {
    sessionStorage.setItem(this.KEYS.VEHICULO, JSON.stringify(datos));
  },

  // Obtener datos del vehículo
  obtenerVehiculo() {
    const datos = sessionStorage.getItem(this.KEYS.VEHICULO);
    return datos ? JSON.parse(datos) : null;
  },

  // Obtener todos los datos recopilados
  obtenerTodosLosDatos() {
    return {
      datosBasicos: this.obtenerDatosBasicos(),
      datosPersonales: this.obtenerDatosPersonales(),
      cuentaBancaria: this.obtenerCuentaBancaria(),
      vehiculo: this.obtenerVehiculo(),
    };
  },

  // Limpiar todos los datos almacenados
  limpiarTodosLosDatos() {
    sessionStorage.removeItem(this.KEYS.REGISTRO_BASICO);
    sessionStorage.removeItem(this.KEYS.DATOS_PERSONALES);
    sessionStorage.removeItem(this.KEYS.CUENTA_BANCARIA);
    sessionStorage.removeItem(this.KEYS.VEHICULO);
  }
};
