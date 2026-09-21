// services/clienteLocalesService.ts
export const CLIENTE_LOCALES_STORAGE_KEY = "clienteLocalesInitial";

const API_URL = process.env.NEXT_PUBLIC_API_WEB;
// Los assets (logo/banner) se sirven en /storage sobre la raíz del backend, no bajo /api.
// Se puede apuntar a un host de medios distinto (p. ej. producción) mientras el backend
// local no tenga los archivos subidos, sin cambiar la API de datos.
const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_URL || (API_URL || "").replace(/\/api\/?$/, "");

export interface TipoNegocio {
  id: number;
  nombre: string;
  slug: string;
  activo: number;
  image: string | null;
  orden: number;
}

export interface Local {
  business_registration_id: number;
  nombre_establecimiento: string;
  ruta_logo: string | null;
  calle: string | null;
  numero: string | null;
  codigo_postal: string | null;
  provincia: string | null;
  ciudad: string | null;
  referencia: string | null;
  latitud: number;
  longitud: number;
  direccion_completa: string | null;
  banner: string | null;
  foto_perfil: string | null;
  businessType: string;
  omitir_pago_adelantado: number;
  activo: number;
  estaAbierto?: boolean;
  prioridad?: number;
  distancia: number;
}

// Carpetas de assets conocidas. Además de "/storage/" (disco de Storage),
// varias se guardan directo en la carpeta public/ del backend, y como
// APP_URL en algunos entornos incluye una subcarpeta (ej.
// "https://host/truelove-back/public"), no basta con reescribir el host:
// hay que ubicar dónde empieza la carpeta de assets real y cortar desde ahí.
const ASSET_MARKERS = [
  "/storage/",
  "/logos-negocio/",
  "/banners-negocio/",
  "/fotos-perfil/",
  "/img/categories/",
  "/comprobantes/",
];

export function buildStorageUrl(path: string | null): string | null {
  if (!path) return null;

  if (path.startsWith("http")) {
    for (const marker of ASSET_MARKERS) {
      const idx = path.indexOf(marker);
      if (idx !== -1) {
        return `${STORAGE_BASE_URL}${path.slice(idx)}`;
      }
    }
    // Sin ninguna carpeta conocida: solo se reescribe el host, se conserva
    // el path tal cual (mejor esfuerzo).
    try {
      const url = new URL(path);
      return `${STORAGE_BASE_URL}${url.pathname}${url.search}`;
    } catch {
      return path;
    }
  }

  if (path.startsWith("storage/") || path.startsWith("/storage/")) {
    const relative = path.replace(/^\/?storage\//, "");
    return `${STORAGE_BASE_URL}/storage/${relative}`;
  }

  const relative = path.replace(/^\/+/, "");
  return `${STORAGE_BASE_URL}/${relative}`;
}

export const fetchTiposNegocio = async (): Promise<TipoNegocio[]> => {
  const response = await fetch(`${API_URL}/get/tipo/negocio`);
  if (!response.ok) return [];
  return response.json();
};

export class LocalesError extends Error {}

async function fetchLocales(url: string): Promise<Local[]> {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new LocalesError(data.error || "No se pudieron cargar los locales");
  }

  return Array.isArray(data) ? data : [];
}

export const fetchLocalesTop = (idCliente: number) =>
  fetchLocales(`${API_URL}/get/locales/top/${idCliente}`);

export const fetchLocalesByCategory = (idCliente: number, category: string) =>
  fetchLocales(`${API_URL}/get/locales/${idCliente}/${encodeURIComponent(category)}`);

export const searchLocales = (idCliente: number, term: string) =>
  fetchLocales(`${API_URL}/busqueda/locales/${idCliente}/${encodeURIComponent(term)}`);

export interface Banner {
  id: number;
  titulo: string;
  subtitulo: string;
  color_fondo: string;
  texto_boton: string;
  url_boton: string | null;
  url_imagen: string | null;
  estado: number;
}

export const fetchBanners = async (): Promise<Banner[]> => {
  const response = await fetch(`${API_URL}/banners`);
  if (!response.ok) return [];
  return response.json();
};

export type TipoDestinoPromocion = "pantalla" | "restaurante" | "categoria" | "";

export interface Promocion {
  id: number;
  titulo: string;
  subtitulo: string;
  imagen: string;
  estado: number;
  tipo_destino: TipoDestinoPromocion;
  pantalla: string | null;
  destino_id: number | null;
}

export const fetchPromociones = async (page = 1): Promise<Promocion[]> => {
  const response = await fetch(`${API_URL}/promociones?page=${page}`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const fetchLocalById = async (idLocal: number): Promise<Local | null> => {
  const response = await fetch(`${API_URL}/get/local/${idLocal}`);
  if (!response.ok) return null;
  return response.json();
};
