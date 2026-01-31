const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export interface Pedido {
  id: number;
  id_cliente: number;
  id_local: number;
  id_motorizado?: number;
  latitud: string;
  longitud: string;
  created_at: string;
  updated_at: string;
  detalle: string;
  local: string;
  direccion_local: string;
  direccion_entrega: string;
  cliente: string;
  celular: string;
  lat_local: string;
  lon_local: string;
  ultimo_estado_tracking: string;
  estado: string;
}

export const fetchPedidos = async (
  fecha: string = "hoy",
): Promise<Pedido[]> => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    // SIEMPRE obtener el socioId del objeto user para evitar usar valores cacheados incorrectos
    let socioId: string | null = null;
    const userStr = localStorage.getItem("user");

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Primero intentar obtener el ID del businessRegistration
        if (user && user.businessRegistration && user.businessRegistration.id) {
          socioId = user.businessRegistration.id.toString();
        }
        // Si no hay businessRegistration, usar el ID del usuario
        else if (user && user.id) {
          socioId = user.id.toString();
        }

        // Actualizar el socioId en localStorage si se obtuvo correctamente
        if (socioId) {
          const storedSocioId = localStorage.getItem("socioId");
          // Solo actualizar si es diferente para evitar escrituras innecesarias
          if (storedSocioId !== socioId) {
            localStorage.setItem("socioId", socioId);
            console.log(`SocioId actualizado de ${storedSocioId} a ${socioId}`);
          }
        }
      } catch (e) {
        console.error("Error al parsear datos de usuario:", e);
      }
    }

    if (!socioId) {
      throw new Error(
        "No se encontró el ID del socio en los datos del usuario",
      );
    }

    const response = await fetch(
      `${API_URL}/socio/pedidos/${socioId}?tipo=finalizados&fecha=${fecha}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener los pedidos");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en fetchPedidos:", error);
    throw error;
  }
};

export const actualizarEstadoPedido = async (
  pedidoId: number,
  estado: number,
): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    const response = await fetch(
      `${API_URL}/socio/pedidos/update-estado/${pedidoId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al actualizar el estado del pedido",
      );
    }

    return;
  } catch (error) {
    console.error("Error en actualizarEstadoPedido:", error);
    throw error;
  }
};

export const getEstadoLabel = (
  estado: string,
): { label: string; color: string } => {
  switch (estado) {
    case "Pendiente":
      return { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" };
    case "Aceptado":
      return { label: "Aceptado", color: "bg-blue-100 text-blue-800" };
    case "En preparación":
      return {
        label: "En preparación",
        color: "bg-indigo-100 text-indigo-800",
      };
    case "Listo para entrega":
      return {
        label: "Listo para entrega",
        color: "bg-purple-100 text-purple-800",
      };
    case "En camino":
      return { label: "En camino", color: "bg-orange-100 text-orange-800" };
    case "Entregado":
      return { label: "Entregado", color: "bg-green-100 text-green-800" };
    case "Cancelado":
      return { label: "Cancelado", color: "bg-red-100 text-red-800" };
    default:
      return { label: "Sin seguimiento", color: "bg-gray-100 text-gray-800" };
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// =====================================================
// PEDIDOS ACTIVOS - Sistema en tiempo real
// =====================================================

export interface PedidoDetalle {
  id: number;
  pedido_id: number;
  nombre: string;
  cantidad: number;
  precio: string;
  tipo: string;
}

export interface PedidoTracking {
  id: number;
  pedido_id: number;
  estado: string;
  created_at: string;
}

export interface PedidoActivo extends Pedido {
  detalleArray: PedidoDetalle[];
  trackings: PedidoTracking[];
  motorizado: string;
  celular_motorizado: string;
  nota: string;
  tipo_pago: string;
  tipo_pedido: number;
  requiere_confirmacion_local: boolean;
  foto_pago: string | null;
  tiempo: number;
  precio_delivery: string;
  subtotal: string;
  descuento: string;
}

function getSocioId(): string {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user?.businessRegistration?.id) {
        return user.businessRegistration.id.toString();
      }
      if (user?.id) {
        return user.id.toString();
      }
    } catch (e) {
      console.error("Error al parsear datos de usuario:", e);
    }
  }
  throw new Error("No se encontró el ID del socio");
}

function getAuthToken(): string {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No se encontró el token de autenticación");
  return token;
}

export const fetchPedidosActivos = async (): Promise<PedidoActivo[]> => {
  const token = getAuthToken();
  const socioId = getSocioId();

  const response = await fetch(
    `${API_URL}/socio/pedidos/${socioId}?tipo=activos&fecha=hoy`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener pedidos activos");
  }

  return response.json();
};

export const actualizarEstadoPedidoActivo = async (
  pedidoId: number,
  estado: number,
  tiempo?: number,
): Promise<void> => {
  const token = getAuthToken();

  const body: { estado: number; tiempo?: number } = { estado };
  if (tiempo !== undefined) body.tiempo = tiempo;

  // Estado 0 (cancelar/rechazar) usa la ruta pública PUT igual que el app Flutter
  // Los demás estados usan la ruta autenticada POST
  const isCancel = estado === 0;
  const url = isCancel
    ? `${API_URL}/socio/update/estado/pedido/${pedidoId}`
    : `${API_URL}/socio/pedidos/update-estado/${pedidoId}`;
  const method = isCancel ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar el estado");
  }
};

export const getEstadoNumerico = (estado: string | number): number => {
  return typeof estado === "string" ? parseInt(estado, 10) : estado;
};

export const getEstadoActivoLabel = (
  estado: number,
): { label: string; color: string; bgColor: string } => {
  switch (estado) {
    case 0:
      return {
        label: "Cancelado",
        color: "text-red-700",
        bgColor: "bg-red-100",
      };
    case 1:
      return {
        label: "Nuevo Pedido",
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
      };
    case 2:
      return {
        label: "Preparando",
        color: "text-blue-700",
        bgColor: "bg-blue-100",
      };
    case 3:
      return {
        label: "Listo en local",
        color: "text-purple-700",
        bgColor: "bg-purple-100",
      };
    case 9:
      return {
        label: "Listo para recoger",
        color: "text-indigo-700",
        bgColor: "bg-indigo-100",
      };
    default:
      return {
        label: `Estado ${estado}`,
        color: "text-gray-700",
        bgColor: "bg-gray-100",
      };
  }
};
