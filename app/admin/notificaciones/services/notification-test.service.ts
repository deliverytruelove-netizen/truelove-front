// app/admin/notificaciones/services/notification-test.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export interface TestLiveActivityParams {
  token: string;
  id_pedido: string;
  estado: string;
  tiempo: string;
  progress: string;
}

export interface TestPushParams {
  token: string;
  sonido: string; // 'true' or 'false'
  channel_id: string; // 'pedidos_v7' for motorizado, 'pedidos_v3' for socio
}

export const sendLiveActivityTest = async (data: TestLiveActivityParams) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/test-live-activity`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`, // Optional if route is public, but good practice
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al enviar Live Activity');
  }

  return response.json();
};

export const sendPushTest = async (data: TestPushParams) => {
  const token = getAuthToken();
  
  const formData = new FormData();
  formData.append('token', data.token);
  formData.append('sonido', data.sonido);
  formData.append('channel_id', data.channel_id);

  const response = await fetch(`${API_URL}/prueba-notificacion`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    // Some endpoints might return text or empty on success, check content type
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar Push');
    }
    throw new Error('Error al enviar Push');
  }

  // Handle various response types
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return { success: true };
};
