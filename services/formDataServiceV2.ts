// services/formDataServiceV2.ts
/**
 * Servicio mejorado que usa IndexedDB para archivos
 * y sessionStorage solo para datos de texto
 */

import { indexedDBService } from './indexedDBService';

export const FormDataServiceV2 = {
  // Claves para sessionStorage (solo datos de texto)
  KEYS: {
    REGISTRO_BASICO: 'reparto_registro_basico_v2',
    DATOS_PERSONALES: 'reparto_datos_personales_v2',
    CUENTA_BANCARIA: 'reparto_cuenta_bancaria_v2',
    VEHICULO: 'reparto_vehiculo_v2',
  },

  // IDs para archivos en IndexedDB
  FILE_IDS: {
    DOCUMENTO_FRENTE: 'doc_frente',
    DOCUMENTO_REVERSO: 'doc_reverso',
    SELFIE: 'selfie',
    IMAGEN_BANCARIA: 'imagen_bancaria',
    PLACA: 'placa',
    LICENCIA: 'licencia',
    SEGURO: 'seguro',
    TARJETA_PROPIEDAD: 'tarjeta_propiedad',
  },

  // ✅ GUARDAR DATOS BÁSICOS (sin imágenes)
  async guardarDatosBasicos(datos: Record<string, unknown>) {
    try {
      // Separar datos de texto de las imágenes
      const { 
        documentoImagenFrente, 
        documentoImagenReverso, 
        documentosAdicionales,
        ...datosTexto 
      } = datos;

      // Guardar solo texto en sessionStorage
      sessionStorage.setItem(this.KEYS.REGISTRO_BASICO, JSON.stringify(datosTexto));

      // Guardar imágenes en IndexedDB
      if (documentoImagenFrente && typeof documentoImagenFrente === 'string') {
        await indexedDBService.guardarImagenDesdeBase64(
          this.FILE_IDS.DOCUMENTO_FRENTE,
          documentoImagenFrente,
          'documento_frente.jpg'
        );
      }

      if (documentoImagenReverso && typeof documentoImagenReverso === 'string') {
        await indexedDBService.guardarImagenDesdeBase64(
          this.FILE_IDS.DOCUMENTO_REVERSO,
          documentoImagenReverso,
          'documento_reverso.jpg'
        );
      }

      // Guardar PDFs adicionales
      if (Array.isArray(documentosAdicionales)) {
        for (let i = 0; i < documentosAdicionales.length; i++) {
          const doc = documentosAdicionales[i];
          if (doc.archivo) {
            await indexedDBService.guardarImagenDesdeBase64(
              `pdf_adicional_${i}`,
              doc.archivo,
              doc.nombre
            );
          }
        }
        // Guardar solo metadata de PDFs
        const pdfMetadata = documentosAdicionales.map((doc, i) => ({
          id: `pdf_adicional_${i}`,
          nombre: doc.nombre,
          tipo: doc.tipo,
          categoria: doc.categoria,
        }));
        sessionStorage.setItem('reparto_pdfs_metadata', JSON.stringify(pdfMetadata));
      }

      console.log('✅ Datos básicos guardados (texto en sessionStorage, archivos en IndexedDB)');
    } catch (error) {
      console.error('❌ Error al guardar datos básicos:', error);
      throw error;
    }
  },

  // ✅ OBTENER DATOS BÁSICOS (reconstruir con imágenes)
  async obtenerDatosBasicos() {
    try {
      const datosTexto = sessionStorage.getItem(this.KEYS.REGISTRO_BASICO);
      if (!datosTexto) return null;

      const datos = JSON.parse(datosTexto);

      // Obtener imágenes de IndexedDB
      const documentoFrente = await indexedDBService.obtenerArchivoBase64(this.FILE_IDS.DOCUMENTO_FRENTE);
      const documentoReverso = await indexedDBService.obtenerArchivoBase64(this.FILE_IDS.DOCUMENTO_REVERSO);

      // Obtener PDFs adicionales
      const pdfMetadataStr = sessionStorage.getItem('reparto_pdfs_metadata');
      let documentosAdicionales = [];
      if (pdfMetadataStr) {
        const pdfMetadata = JSON.parse(pdfMetadataStr);
        documentosAdicionales = await Promise.all(
          pdfMetadata.map(async (meta: { id: string; nombre: string; tipo: string; categoria: string }) => ({
            nombre: meta.nombre,
            archivo: await indexedDBService.obtenerArchivoBase64(meta.id),
            tipo: meta.tipo,
            categoria: meta.categoria,
          }))
        );
      }

      return {
        ...datos,
        documentoImagenFrente: documentoFrente,
        documentoImagenReverso: documentoReverso,
        documentosAdicionales,
      };
    } catch (error) {
      console.error('❌ Error al obtener datos básicos:', error);
      return null;
    }
  },

  // ✅ GUARDAR DATOS PERSONALES (con selfie)
  async guardarDatosPersonales(datos: Record<string, unknown>) {
    const { selfie, ...datosTexto } = datos;

    sessionStorage.setItem(this.KEYS.DATOS_PERSONALES, JSON.stringify(datosTexto));

    if (selfie && typeof selfie === 'string') {
      try {
        await indexedDBService.guardarImagenDesdeBase64(
          this.FILE_IDS.SELFIE,
          selfie,
          'selfie.jpg'
        );
      } catch (imgError) {
        console.warn('⚠️ No se pudo guardar selfie en IndexedDB, continuando:', imgError);
      }
    }

    console.log('✅ Datos personales guardados');
  },

  // ✅ OBTENER DATOS PERSONALES
  async obtenerDatosPersonales() {
    try {
      const datosTexto = sessionStorage.getItem(this.KEYS.DATOS_PERSONALES);
      if (!datosTexto) return null;

      const datos = JSON.parse(datosTexto);
      const selfie = await indexedDBService.obtenerArchivoBase64(this.FILE_IDS.SELFIE);

      return { ...datos, selfie };
    } catch (error) {
      console.error('❌ Error al obtener datos personales:', error);
      return null;
    }
  },

  // ✅ GUARDAR CUENTA BANCARIA (con imagen)
  async guardarCuentaBancaria(datos: Record<string, unknown>) {
    try {
      const { imagen_cuenta, ...datosTexto } = datos;

      sessionStorage.setItem(this.KEYS.CUENTA_BANCARIA, JSON.stringify(datosTexto));

      if (imagen_cuenta && typeof imagen_cuenta === 'string') {
        await indexedDBService.guardarImagenDesdeBase64(
          this.FILE_IDS.IMAGEN_BANCARIA,
          imagen_cuenta,
          'imagen_bancaria.jpg'
        );
      }

      console.log('✅ Cuenta bancaria guardada');
    } catch (error) {
      console.error('❌ Error al guardar cuenta bancaria:', error);
      throw error;
    }
  },

  // ✅ OBTENER CUENTA BANCARIA
  async obtenerCuentaBancaria() {
    try {
      const datosTexto = sessionStorage.getItem(this.KEYS.CUENTA_BANCARIA);
      if (!datosTexto) return null;

      const datos = JSON.parse(datosTexto);
      const imagen_cuenta = await indexedDBService.obtenerArchivoBase64(this.FILE_IDS.IMAGEN_BANCARIA);

      return { ...datos, imagen_cuenta };
    } catch (error) {
      console.error('❌ Error al obtener cuenta bancaria:', error);
      return null;
    }
  },

  // ✅ GUARDAR VEHÍCULO (con 4 imágenes)
  async guardarVehiculo(datos: Record<string, unknown>) {
    try {
      const {
        placa_imagen,
        licenciaConducir_imagen,
        seguro_imagen,
        tarjetaPropiedad_imagen,
        ...datosTexto
      } = datos;

      sessionStorage.setItem(this.KEYS.VEHICULO, JSON.stringify(datosTexto));

      // Guardar las 4 imágenes
      if (placa_imagen && typeof placa_imagen === 'string') {
        await indexedDBService.guardarImagenDesdeBase64(this.FILE_IDS.PLACA, placa_imagen, 'placa.jpg');
      }
      if (licenciaConducir_imagen && typeof licenciaConducir_imagen === 'string') {
        await indexedDBService.guardarImagenDesdeBase64(this.FILE_IDS.LICENCIA, licenciaConducir_imagen, 'licencia.jpg');
      }
      if (seguro_imagen && typeof seguro_imagen === 'string') {
        await indexedDBService.guardarImagenDesdeBase64(this.FILE_IDS.SEGURO, seguro_imagen, 'seguro.jpg');
      }
      if (tarjetaPropiedad_imagen && typeof tarjetaPropiedad_imagen === 'string') {
        await indexedDBService.guardarImagenDesdeBase64(this.FILE_IDS.TARJETA_PROPIEDAD, tarjetaPropiedad_imagen, 'tarjeta.jpg');
      }

      console.log('✅ Vehículo guardado');
    } catch (error) {
      console.error('❌ Error al guardar vehículo:', error);
      throw error;
    }
  },

  // ✅ OBTENER VEHÍCULO
  async obtenerVehiculo() {
    try {
      const datosTexto = sessionStorage.getItem(this.KEYS.VEHICULO);
      if (!datosTexto) return null;

      const datos = JSON.parse(datosTexto);

      // Obtener las 4 imágenes
      const [placa_imagen, licenciaConducir_imagen, seguro_imagen, tarjetaPropiedad_imagen] = await Promise.all([
        indexedDBService.obtenerArchivoBase64(this.FILE_IDS.PLACA),
        indexedDBService.obtenerArchivoBase64(this.FILE_IDS.LICENCIA),
        indexedDBService.obtenerArchivoBase64(this.FILE_IDS.SEGURO),
        indexedDBService.obtenerArchivoBase64(this.FILE_IDS.TARJETA_PROPIEDAD),
      ]);

      return {
        ...datos,
        placa_imagen,
        licenciaConducir_imagen,
        seguro_imagen,
        tarjetaPropiedad_imagen,
      };
    } catch (error) {
      console.error('❌ Error al obtener vehículo:', error);
      return null;
    }
  },

  // ✅ OBTENER TODOS LOS DATOS
  async obtenerTodosLosDatos() {
    return {
      datosBasicos: await this.obtenerDatosBasicos(),
      datosPersonales: await this.obtenerDatosPersonales(),
      cuentaBancaria: await this.obtenerCuentaBancaria(),
      vehiculo: await this.obtenerVehiculo(),
    };
  },

  // ✅ LIMPIAR TODO
  async limpiarTodosLosDatos() {
    try {
      // Limpiar sessionStorage
      sessionStorage.removeItem(this.KEYS.REGISTRO_BASICO);
      sessionStorage.removeItem(this.KEYS.DATOS_PERSONALES);
      sessionStorage.removeItem(this.KEYS.CUENTA_BANCARIA);
      sessionStorage.removeItem(this.KEYS.VEHICULO);
      sessionStorage.removeItem('reparto_pdfs_metadata');
      sessionStorage.removeItem('repartoRegistroId');
      sessionStorage.removeItem('repartoCurrentStep');
      sessionStorage.removeItem('repartoToken');

      // Limpiar IndexedDB
      await indexedDBService.limpiarTodo();

      console.log('🧹 Todos los datos limpiados (sessionStorage + IndexedDB)');
    } catch (error) {
      console.error('❌ Error al limpiar datos:', error);
    }
  },

  // ✅ OBTENER ESTADÍSTICAS
  async obtenerEstadisticas() {
    const sessionStorageSize = new Blob([
      sessionStorage.getItem(this.KEYS.REGISTRO_BASICO) || '',
      sessionStorage.getItem(this.KEYS.DATOS_PERSONALES) || '',
      sessionStorage.getItem(this.KEYS.CUENTA_BANCARIA) || '',
      sessionStorage.getItem(this.KEYS.VEHICULO) || '',
    ]).size;

    const indexedDBStats = await indexedDBService.obtenerEstadisticas();

    console.log('📊 Estadísticas totales:', {
      sessionStorage: `${(sessionStorageSize / 1024).toFixed(0)}KB`,
      indexedDB: `${(indexedDBStats.tamanoTotal / 1024 / 1024).toFixed(2)}MB`,
      archivos: indexedDBStats.cantidad,
    });

    return {
      sessionStorageSize,
      indexedDBSize: indexedDBStats.tamanoTotal,
      totalArchivos: indexedDBStats.cantidad,
    };
  },

  // ✅ VERIFICAR SI ES VEHÍCULO SIN DOCUMENTO MOTORIZADO
  esVehiculoSinDocumentoMotorizado() {
    const datosBasicos = sessionStorage.getItem(this.KEYS.REGISTRO_BASICO);
    if (!datosBasicos) return false;
    
    const datos = JSON.parse(datosBasicos);
    const vehiculo = datos?.vehiculo;
    return vehiculo === "BICICLETA" || vehiculo === "MOTO ELECTRICA";
  },
};
