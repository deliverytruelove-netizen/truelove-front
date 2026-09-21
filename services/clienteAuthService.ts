// services/clienteAuthService.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  celular?: string | null;
  celular_whatsapp?: string | null;
  genero?: string;
  fecha_nacimiento?: string;
  nacionalidad?: string;
  foto_perfil?: string | null;
  direccion?: string | null;
  [key: string]: unknown;
}

interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

class ClienteAuthError extends Error {
  constructor(message: string, public fieldErrors?: Record<string, string[]>) {
    super(message);
  }
}

async function request<T>(endpoint: string, body: Record<string, unknown>, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}/web/cliente/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data: (T & ApiErrorPayload) | ApiErrorPayload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const payload = data as ApiErrorPayload;
    const firstFieldError = payload.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    throw new ClienteAuthError(firstFieldError || payload.message || "Ocurrió un error inesperado", payload.errors);
  }

  return data as T;
}

export interface LoginResponse {
  token: string;
  cliente: Cliente;
}

export const clienteLogin = (email: string, password: string) =>
  request<LoginResponse>("login", { email, password });

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  genero: string;
  documento: string;
  nacionalidad: string;
  email: string;
  celular?: string;
  celular_whatsapp?: string;
}

export const clienteRegister = (payload: RegisterPayload) =>
  request<LoginResponse>("register", { ...payload });

export const clienteSendCode = async (email: string) => {
  // El backend responde HTTP 200 incluso cuando el correo ya está
  // registrado (solo cambia el campo "status" dentro del JSON), así que
  // hay que detectar ese caso explícitamente: si no viene el código, es
  // que el registro fue rechazado (p. ej. correo ya existente).
  const response = await request<{
    message: string;
    status?: number;
    verification_code?: string | number;
  }>("send-code", { email });

  if (response.verification_code === undefined || response.verification_code === null) {
    throw new ClienteAuthError(response.message || "No se pudo enviar el código de verificación");
  }

  // El backend devuelve verification_code como número (random_int); se
  // normaliza a string para poder compararlo con lo que escribe el usuario.
  return { ...response, verification_code: String(response.verification_code) };
};

export const clienteForgotPasswordSendCode = async (email: string) => {
  const response = await request<{
    success: boolean;
    message: string;
    verification_code?: string | number;
    id?: number;
  }>("forgot-password/send-code", { email });

  if (!response.success || response.verification_code === undefined || !response.id) {
    throw new ClienteAuthError(response.message || "No se pudo enviar el código de verificación");
  }

  response.verification_code = String(response.verification_code);

  return response as { success: boolean; message: string; verification_code: string; id: number };
};

export const clienteResetPassword = (id: number, password: string) =>
  request<LoginResponse>("forgot-password/reset", { id, password });

export const clienteLogout = async (token: string) => {
  await fetch(`${API_URL}/web/cliente/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
};

export interface DniLookupResult {
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

export const lookupDni = async (documento: string): Promise<DniLookupResult | null> => {
  const response = await fetch(`${API_URL}/get-dni`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ documento }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // El DNI ya registrado es un error de negocio a mostrar al usuario;
    // los demás (RENIEC no encontró datos, etc.) simplemente no autocompletan.
    if (response.status === 400) {
      throw new ClienteAuthError(data.message || "El DNI ya se encuentra registrado");
    }
    return null;
  }

  return data;
};

export interface UpdateProfilePayload {
  idCliente: number;
  direccion: string;
  departamento: string;
  referencia?: string;
  alias?: string;
  celular?: string;
  celular_whatsapp?: string;
  selectedPosition: { coordinates: [number, number] };
}

export const clienteUpdateProfile = async (payload: UpdateProfilePayload) => {
  const response = await fetch(`${API_URL}/update-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ClienteAuthError(data.message || "No se pudo guardar la ubicación");
  }
  return data;
};

export const clienteMe = async (token: string): Promise<Cliente> => {
  const response = await fetch(`${API_URL}/web/cliente/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ClienteAuthError("Sesión expirada");
  }

  const data = await response.json();
  return data.cliente as Cliente;
};

export { ClienteAuthError };
