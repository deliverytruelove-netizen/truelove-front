// services/clienteProfileService.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export type ProfileFieldType =
  | "nombre"
  | "apellido"
  | "fecha_nacimiento"
  | "genero"
  | "email"
  | "celular"
  | "celular_whatsapp";

export const updateClienteField = async (idCliente: number, tipo: ProfileFieldType, valor: string) => {
  const response = await fetch(`${API_URL}/update-info-cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id_cliente: idCliente, tipo, valor }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "No se pudo actualizar el dato");
  }
  return data;
};

export const updateClienteDireccion = async (
  idCliente: number,
  direccion: string,
  // [lng, lat], igual que GoogleMapsLocation.center
  center: [number, number]
) => {
  const response = await fetch(`${API_URL}/update-direccion`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      idCliente,
      direccion,
      // El backend espera coordinates[0]=latitud, coordinates[1]=longitud
      // (mismo criterio ya usado en el registro web).
      selectedPosition: { coordinates: [center[1], center[0]] },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar la dirección");
  }
  return data;
};

export const deleteClienteAccount = async (idCliente: number) => {
  const response = await fetch(`${API_URL}/delete-account-app`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id_cliente: idCliente }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "No se pudo eliminar la cuenta");
  }
  return data;
};
