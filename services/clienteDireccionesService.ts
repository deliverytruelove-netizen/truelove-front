// services/clienteDireccionesService.ts
// Múltiples direcciones del cliente. La "activa" es la que usa el resto del sistema.
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export interface DireccionCliente {
  id: number;
  alias: string | null;
  direccion: string;
  referencia: string | null;
  departamento: string | null;
  latitud: number | null;
  longitud: number | null;
  activa: boolean;
}

export interface DireccionPayload {
  direccion: string;
  // [lng, lat], igual que GoogleMapsLocation.center
  center: [number, number];
  alias?: string | null;
  referencia?: string | null;
  departamento?: string | null;
}

const headers = { "Content-Type": "application/json", Accept: "application/json" };

const leer = async <T>(response: Response, porDefecto: string): Promise<T> => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || porDefecto);
  return data as T;
};

const cuerpo = (p: DireccionPayload) => ({
  direccion: p.direccion,
  selectedPosition: { coordinates: [p.center[0], p.center[1]] },
  alias: p.alias ?? null,
  referencia: p.referencia ?? null,
  departamento: p.departamento ?? null,
});

export const fetchDirecciones = async (idCliente: number): Promise<DireccionCliente[]> => {
  const response = await fetch(`${API_URL}/clientes/${idCliente}/direcciones`, { headers });
  return leer<DireccionCliente[]>(response, "No se pudieron cargar las direcciones");
};

export const crearDireccion = async (idCliente: number, payload: DireccionPayload) => {
  const response = await fetch(`${API_URL}/clientes/${idCliente}/direcciones`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...cuerpo(payload), activar: true }),
  });
  return leer<DireccionCliente>(response, "No se pudo guardar la dirección");
};

export const actualizarDireccion = async (idCliente: number, id: number, payload: DireccionPayload) => {
  const response = await fetch(`${API_URL}/clientes/${idCliente}/direcciones/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(cuerpo(payload)),
  });
  return leer<DireccionCliente>(response, "No se pudo actualizar la dirección");
};

export const activarDireccion = async (idCliente: number, id: number) => {
  const response = await fetch(`${API_URL}/clientes/${idCliente}/direcciones/${id}/activar`, {
    method: "POST",
    headers,
  });
  return leer<DireccionCliente>(response, "No se pudo cambiar la dirección");
};

export const eliminarDireccion = async (idCliente: number, id: number) => {
  const response = await fetch(`${API_URL}/clientes/${idCliente}/direcciones/${id}`, {
    method: "DELETE",
    headers,
  });
  return leer<{ success: boolean }>(response, "No se pudo eliminar la dirección");
};
