// app\admin\motorizado\services\motorizado.service.ts
import type { Motorizado, DetallesMotorizado } from "../types/motorizado.types";

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export const fetchMotorizados = async (): Promise<Motorizado[]> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No se encontró el token");
  }

  const response = await fetch(`${API_URL}/admin/motorizado`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error en la respuesta del servidor");
  }

  return response.json();
};

export const fetchMotorizadoDetails = async (
  id: number
): Promise<DetallesMotorizado> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No se encontró el token");
  }

  const response = await fetch(`${API_URL}/admin/motorizado/${id}/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener los detalles del motorizado");
  }

  const data = await response.json();
  return data.data;
};

export const changeStateMotorizado = async (id: number): Promise<void> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No se encontró el token");
  }

  const response = await fetch(
    `${API_URL}/admin/motorizado/change/state/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al cambiar el estado del motorizado");
  }
};

export const aprobarMotorizado = async (id: number): Promise<void> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No se encontró el token");
  }

  try {
    const response = await fetch(`${API_URL}/admin/motorizado/${id}/aprobar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Si la respuesta no es ok, lanzamos el error con el mensaje del servidor
    if (!response.ok) {
      // Verificar si es un error de correo duplicado
      if (
        data.message &&
        data.message.includes("correo electrónico ya está registrado")
      ) {
        throw new Error(
          "El correo electrónico ya está registrado en el sistema"
        );
      }
      throw new Error(data.message || "Error al aprobar el motorizado");
    }

    // Verificamos el status en la respuesta
    if (data.status !== "success") {
      throw new Error(data.message || "Error al aprobar el motorizado");
    }

    return;
  } catch (error) {
    // Capturamos cualquier error y lo relanzamos
    if (error instanceof Error) {
      throw error; // Pasamos el error directamente sin añadir prefijo adicional
    }
    throw new Error("Error al aprobar el motorizado");
  }
};

export const deleteMotorizado = async (id: number): Promise<void> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No se encontró el token");
  }

  try {
    const response = await fetch(`${API_URL}/admin/motorizado/${id}/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Si la respuesta no es ok, lanzamos el error con el mensaje del servidor
    if (!response.ok) {
      throw new Error(data.message || "Error al eliminar el motorizado");
    }

    // Verificamos el status en la respuesta
    if (data.status !== "success") {
      throw new Error(data.message || "Error al eliminar el motorizado");
    }

    return;
  } catch (error) {
    // Capturamos cualquier error y lo relanzamos con un mensaje más descriptivo
    if (error instanceof Error) {
      throw error; // Pasamos el error directamente sin añadir prefijo adicional
    }
    throw new Error("Error al eliminar el motorizado");
  }
};
export const actualizarCantidadPedidos = async (id: number, cantidadPedidos: number): Promise<void> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No se encontró el token");
  }

  const response = await fetch(`${API_URL}/admin/motorizado/${id}/actualizar-pedidos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cantidad_pedidos_dias: cantidadPedidos }),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar la cantidad de pedidos");
  }
};
