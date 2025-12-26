// services/indexedDBService.ts
/**
 * Servicio para almacenar archivos en IndexedDB
 * Mucho más eficiente que base64 en sessionStorage
 */

const DB_NAME = 'TrueLoveRepartoDB';
const DB_VERSION = 1;
const STORE_NAME = 'archivos';

interface ArchivoGuardado {
  id: string;
  blob: Blob;
  nombre: string;
  tipo: string;
  timestamp: number;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  // ✅ INICIALIZAR BASE DE DATOS
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Crear object store si no existe
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  // ✅ GUARDAR ARCHIVO (BLOB)
  async guardarArchivo(id: string, blob: Blob, nombre: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const archivo: ArchivoGuardado = {
        id,
        blob,
        nombre,
        tipo: blob.type,
        timestamp: Date.now(),
      };

      const request = store.put(archivo);

      request.onsuccess = () => {
        const tamanoKB = (blob.size / 1024).toFixed(0);
        console.log(`✅ Archivo guardado en IndexedDB: ${nombre} (${tamanoKB}KB)`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ✅ OBTENER ARCHIVO
  async obtenerArchivo(id: string): Promise<ArchivoGuardado | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // ✅ OBTENER ARCHIVO COMO BASE64 (para enviar al backend)
  async obtenerArchivoBase64(id: string): Promise<string | null> {
    const archivo = await this.obtenerArchivo(id);
    if (!archivo) return null;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(archivo.blob);
    });
  }

  // ✅ OBTENER ARCHIVO COMO URL (para preview)
  async obtenerArchivoURL(id: string): Promise<string | null> {
    const archivo = await this.obtenerArchivo(id);
    if (!archivo) return null;
    return URL.createObjectURL(archivo.blob);
  }

  // ✅ ELIMINAR ARCHIVO
  async eliminarArchivo(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`🗑️ Archivo eliminado: ${id}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ✅ LIMPIAR TODOS LOS ARCHIVOS
  async limpiarTodo(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🧹 Todos los archivos eliminados de IndexedDB');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ✅ OBTENER ESTADÍSTICAS
  async obtenerEstadisticas(): Promise<{ cantidad: number; tamanoTotal: number }> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const archivos = request.result as ArchivoGuardado[];
        const tamanoTotal = archivos.reduce((sum, archivo) => sum + archivo.blob.size, 0);
        
        console.log('📊 Estadísticas IndexedDB:', {
          cantidad: archivos.length,
          tamanoTotal: `${(tamanoTotal / 1024 / 1024).toFixed(2)}MB`,
        });

        resolve({ cantidad: archivos.length, tamanoTotal });
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ✅ GUARDAR IMAGEN DESDE BASE64
  async guardarImagenDesdeBase64(id: string, base64: string, nombre: string): Promise<void> {
    // Convertir base64 a Blob
    const response = await fetch(base64);
    const blob = await response.blob();
    return this.guardarArchivo(id, blob, nombre);
  }

  // ✅ GUARDAR IMAGEN DESDE FILE
  async guardarImagenDesdeFile(id: string, file: File): Promise<void> {
    return this.guardarArchivo(id, file, file.name);
  }
}

// Exportar instancia única
export const indexedDBService = new IndexedDBService();
