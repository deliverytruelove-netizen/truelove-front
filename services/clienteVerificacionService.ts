// services/clienteVerificacionService.ts
// Verificación del número de contacto del cliente con un código por WhatsApp.
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

const headers = { "Content-Type": "application/json", Accept: "application/json" };

/** Celular peruano: 9 dígitos que empiezan con 9. */
export const esCelularValido = (numero: string) => /^9\d{8}$/.test(numero);

export interface EnvioCodigo {
  /** La cuota de WhatsApp se agotó: se continúa sin verificar. */
  verificacionOmitida: boolean;
  /** Código que el servidor espera (la comprobación final la hace el servidor). */
  codigo: string | null;
  canal: "whatsapp" | "sms";
  envioId: number | null;
}

export class VerificacionError extends Error {
  /** Segundos que faltan para poder pedir otro código (límite del servidor). */
  reintentarEn?: number;
  constructor(message: string, reintentarEn?: number) {
    super(message);
    this.reintentarEn = reintentarEn;
  }
}

export const enviarCodigoCelular = async (numero: string): Promise<EnvioCodigo> => {
  const response = await fetch(`${API_URL}/send-code-phone`, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone: numero, acepta_omitir: true }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new VerificacionError(
      data.message || data.error || `No pudimos enviar el código (${response.status}). Inténtalo de nuevo.`,
      typeof data.reintentar_en === "number" ? data.reintentar_en : undefined
    );
  }

  return {
    verificacionOmitida: data.verificacion_omitida === true,
    codigo: data.verification_code != null ? String(data.verification_code) : null,
    canal: data.canal === "sms" ? "sms" : "whatsapp",
    envioId: typeof data.envio_id === "number" ? data.envio_id : null,
  };
};

export interface EstadoEnvio {
  entregado: boolean;
  fallido: boolean;
  sinWhatsapp: boolean;
}

/** Meta acepta el envío aunque el número no tenga WhatsApp y avisa del fallo después. */
export const estadoEnvioCodigo = async (envioId: number): Promise<EstadoEnvio | null> => {
  try {
    const response = await fetch(`${API_URL}/send-code-phone/${envioId}/estado`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      entregado: data.entregado === true,
      fallido: data.fallido === true,
      sinWhatsapp: data.sin_whatsapp === true,
    };
  } catch {
    return null;
  }
};

/** El servidor comprueba el código y marca el número del cliente como validado. */
export const validarNumeroCliente = async (idCliente: number, numero: string, codigo: string | null): Promise<boolean> => {
  if (!codigo) return false;
  try {
    const response = await fetch(`${API_URL}/clientes/${idCliente}/validar-numero`, {
      method: "POST",
      headers,
      body: JSON.stringify({ numero, codigo }),
    });
    const data = await response.json().catch(() => ({}));
    return response.ok && data.numero_validado === true;
  } catch {
    return false;
  }
};
