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

  // ✅ VERIFICAR ESPACIO DISPONIBLE
  verificarEspacioDisponible(): { disponible: boolean; usado: number; total: number } {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);

      // Calcular espacio usado
      let usado = 0;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          if (value) {
            usado += key.length + value.length;
          }
        }
      }

      // Límite aproximado de sessionStorage (5MB)
      const total = 5 * 1024 * 1024;
      const disponible = usado < total * 0.8; // 80% del límite

      return { disponible, usado, total };
    } catch (e) {
      return { disponible: false, usado: 0, total: 0 };
    }
  },

  // ✅ GUARDAR CON VALIDACIÓN DE ESPACIO
  guardarDatosBasicos(datos: Record<string, unknown>) {
    try {
      const datosString = JSON.stringify(datos);
      const tamano = new Blob([datosString]).size;
      
      // Verificar si hay espacio suficiente
      const { disponible, usado, total } = this.verificarEspacioDisponible();
      
      if (!disponible || (usado + tamano) > total * 0.9) {
        throw new Error(`No hay suficiente espacio. Usado: ${(usado / 1024 / 1024).toFixed(2)}MB de ${(total / 1024 / 1024).toFixed(2)}MB`);
      }

      sessionStorage.setItem(this.KEYS.REGISTRO_BASICO, datosString);
      console.log(`✅ Datos básicos guardados: ${(tamano / 1024).toFixed(0)}KB`);
    } catch (error) {
      console.error('❌ Error al guardar datos básicos:', error);
      throw error;
    }
  },

  // Obtener datos básicos del registro
  obtenerDatosBasicos() {
    const datos = sessionStorage.getItem(this.KEYS.REGISTRO_BASICO);
    return datos ? JSON.parse(datos) : null;
  },

  // ✅ GUARDAR DATOS PERSONALES CON VALIDACIÓN
  guardarDatosPersonales(datos: Record<string, unknown>) {
    try {
      const datosString = JSON.stringify(datos);
      const tamano = new Blob([datosString]).size;
      
      sessionStorage.setItem(this.KEYS.DATOS_PERSONALES, datosString);
      console.log(`✅ Datos personales guardados: ${(tamano / 1024).toFixed(0)}KB`);
    } catch (error) {
      console.error('❌ Error al guardar datos personales:', error);
      throw error;
    }
  },

  // Obtener datos personales
  obtenerDatosPersonales() {
    const datos = sessionStorage.getItem(this.KEYS.DATOS_PERSONALES);
    return datos ? JSON.parse(datos) : null;
  },

  // ✅ GUARDAR DATOS BANCARIOS CON VALIDACIÓN
  guardarCuentaBancaria(datos: Record<string, unknown>) {
    try {
      const datosString = JSON.stringify(datos);
      const tamano = new Blob([datosString]).size;
      
      sessionStorage.setItem(this.KEYS.CUENTA_BANCARIA, datosString);
      console.log(`✅ Cuenta bancaria guardada: ${(tamano / 1024).toFixed(0)}KB`);
    } catch (error) {
      console.error('❌ Error al guardar cuenta bancaria:', error);
      throw error;
    }
  },

  // Obtener datos bancarios
  obtenerCuentaBancaria() {
    const datos = sessionStorage.getItem(this.KEYS.CUENTA_BANCARIA);
    return datos ? JSON.parse(datos) : null;
  },

  // ✅ GUARDAR DATOS DEL VEHÍCULO CON VALIDACIÓN
  guardarVehiculo(datos: Record<string, unknown>) {
    try {
      const datosString = JSON.stringify(datos);
      const tamano = new Blob([datosString]).size;
      
      // Validar tamaño antes de guardar
      if (tamano > 4 * 1024 * 1024) {
        throw new Error(`Los datos del vehículo son muy pesados: ${(tamano / 1024 / 1024).toFixed(2)}MB. Máximo: 4MB`);
      }
      
      sessionStorage.setItem(this.KEYS.VEHICULO, datosString);
      console.log(`✅ Vehículo guardado: ${(tamano / 1024).toFixed(0)}KB`);
    } catch (error) {
      console.error('❌ Error al guardar vehículo:', error);
      throw error;
    }
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

  // ✅ LIMPIAR TODOS LOS DATOS ALMACENADOS
  limpiarTodosLosDatos() {
    try {
      sessionStorage.removeItem(this.KEYS.REGISTRO_BASICO);
      sessionStorage.removeItem(this.KEYS.DATOS_PERSONALES);
      sessionStorage.removeItem(this.KEYS.CUENTA_BANCARIA);
      sessionStorage.removeItem(this.KEYS.VEHICULO);
      
      // Limpiar también los tokens y pasos
      sessionStorage.removeItem('repartoRegistroId');
      sessionStorage.removeItem('repartoCurrentStep');
      sessionStorage.removeItem('repartoToken');
      
      console.log('🧹 Todos los datos de reparto limpiados');
    } catch (error) {
      console.error('❌ Error al limpiar datos:', error);
    }
  },

  // ✅ OBTENER ESTADÍSTICAS DE ALMACENAMIENTO
  obtenerEstadisticas() {
    const stats = {
      datosBasicos: 0,
      datosPersonales: 0,
      cuentaBancaria: 0,
      vehiculo: 0,
      total: 0,
    };

    try {
      const basicos = sessionStorage.getItem(this.KEYS.REGISTRO_BASICO);
      if (basicos) stats.datosBasicos = new Blob([basicos]).size;

      const personales = sessionStorage.getItem(this.KEYS.DATOS_PERSONALES);
      if (personales) stats.datosPersonales = new Blob([personales]).size;

      const bancaria = sessionStorage.getItem(this.KEYS.CUENTA_BANCARIA);
      if (bancaria) stats.cuentaBancaria = new Blob([bancaria]).size;

      const vehiculo = sessionStorage.getItem(this.KEYS.VEHICULO);
      if (vehiculo) stats.vehiculo = new Blob([vehiculo]).size;

      stats.total = stats.datosBasicos + stats.datosPersonales + stats.cuentaBancaria + stats.vehiculo;

      console.log('📊 Estadísticas de almacenamiento:', {
        datosBasicos: `${(stats.datosBasicos / 1024).toFixed(0)}KB`,
        datosPersonales: `${(stats.datosPersonales / 1024).toFixed(0)}KB`,
        cuentaBancaria: `${(stats.cuentaBancaria / 1024).toFixed(0)}KB`,
        vehiculo: `${(stats.vehiculo / 1024).toFixed(0)}KB`,
        total: `${(stats.total / 1024).toFixed(0)}KB`,
      });

      return stats;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return stats;
    }
  },
  // Agregar esta función al final del objeto FormDataService
esVehiculoSinDocumentoMotorizado() {
  const datosBasicos = this.obtenerDatosBasicos();
  const vehiculo = datosBasicos?.vehiculo;
  return vehiculo === "BICICLETA" || vehiculo === "MOTO ELECTRICA";
}
};
