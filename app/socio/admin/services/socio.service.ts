// app\socio\admin\services\socio.service.ts
import type { DetallesSocio, BankAccountFormData, ApiResponse } from "@/app/admin/socios/types/Socios.types";

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

// Obtener el token de autenticación
const getAuthToken = () => {
  // Obtener el token de las cookies
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1];

  if (cookieToken) {
    return cookieToken.startsWith("Bearer ")
      ? cookieToken
      : `Bearer ${cookieToken}`;
  }

  // Si no está en las cookies, intentar obtenerlo del localStorage
  const localStorageToken = localStorage.getItem("authToken");

  if (localStorageToken) {
    return localStorageToken.startsWith("Bearer ")
      ? localStorageToken
      : `Bearer ${localStorageToken}`;
  }

  return null;
};

export const socioService = {
  // Obtener perfil del socio autenticado
  getProfile: async (): Promise<ApiResponse<DetallesSocio>> => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(`${API_URL}/socio/perfil`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al obtener el perfil del socio"
        );
      }

      return response.json() as Promise<ApiResponse<DetallesSocio>>;
    } catch (error) {
      console.error("Error en getProfile:", error);
      throw error;
    }
  },

  // Obtener pedidos del socio
  getPedidos: async (socioId: string): Promise<unknown[]> => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(`${API_URL}/socio/pedidos/${socioId}`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al obtener los pedidos");
      }

      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      console.error("Error en getPedidos:", error);
      throw error;
    }
  },

  // Actualizar estado de pedido
  updateEstadoPedido: async (
    pedidoId: string,
    estado: string
  ): Promise<ApiResponse<unknown>> => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(
        `${API_URL}/socio/pedidos/update-estado/${pedidoId}`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ estado }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar el estado del pedido"
        );
      }

      return response.json() as Promise<ApiResponse<unknown>>;
    } catch (error) {
      console.error("Error en updateEstadoPedido:", error);
      throw error;
    }
  },

  // Actualizar información personal
  updatePersonalInfo: async (data: {
    documentNumber: string;
    name: string;
    lastName: string;
    email: string;
    phone: string;
    posToDriver: number;
    entrega_documento_venta: number;
  }): Promise<ApiResponse<unknown>> => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await fetch(`${API_URL}/socio/personal-info`, {
        method: 'PUT',
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar la información personal")
      }

      return response.json() as Promise<ApiResponse<unknown>>
    } catch (error) {
      console.error("Error en updatePersonalInfo:", error)
      throw error
    }
  },

  // Actualizar datos del negocio
  updateBusinessInfo: async (data: {
    nombre: string;
    total_sucursales: number;
    metodo_contacto: string;
    telefono: string;
    tipo_pago_digital: number;
    numero_pago_digital?: string | null;
    nombre_titular_pago_digital?: string | null;
  }): Promise<ApiResponse<unknown>> => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await fetch(`${API_URL}/socio/business-info`, {
        method: 'PUT',
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar los datos del negocio")
      }

      return response.json() as Promise<ApiResponse<unknown>>
    } catch (error) {
      console.error("Error en updateBusinessInfo:", error)
      throw error
    }
  },

  // Actualizar establecimiento
  updateEstablishment: async (data: {
    nombre_establecimiento: string;
    calle: string;
    numero: string;
    codigo_postal: string;
    provincia: string;
    ciudad: string;
    referencia?: string;
    latitud?: number;
    longitud?: number;
  }): Promise<ApiResponse<unknown>> => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await fetch(`${API_URL}/socio/establishment`, {
        method: 'PUT',
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el establecimiento")
      }

      return response.json() as Promise<ApiResponse<unknown>>
    } catch (error) {
      console.error("Error en updateEstablishment:", error)
      throw error
    }
  },

  // Actualizar datos legales (RUC)
  updateBusinessData: async (data: {
    ruc: string;
    razon_social: string;
  }): Promise<ApiResponse<unknown>> => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await fetch(`${API_URL}/socio/business-key-info`, {
        method: 'PUT',
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar los datos legales")
      }

      return response.json() as Promise<ApiResponse<unknown>>
    } catch (error) {
      console.error("Error en updateBusinessData:", error)
      throw error
    }
  },

  // Actualizar datos bancarios DECLARADOS (DatosBancarios)
  updateBankData: async (data: {
    titular_cuenta: string;
    numero_cuenta: string;
    nombre_banco: string;
    tipo_cuenta: string;
    documento_titular: string;
    codigo_cci?: string;
  }): Promise<ApiResponse<unknown>> => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await fetch(`${API_URL}/socio/bank-data`, {
        method: 'PUT',
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar los datos bancarios")
      }

      return response.json() as Promise<ApiResponse<unknown>>
    } catch (error) {
      console.error("Error en updateBankData:", error)
      throw error
    }
  },

  // Actualizar contraseña del socio autenticado
  updatePassword: async (password: string): Promise<ApiResponse<unknown>> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(`${API_URL}/socio/change-password`, {
        method: 'PUT',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la contraseña');
      }

      return response.json() as Promise<ApiResponse<unknown>>;
    } catch (error) {
      console.error('Error en updatePassword:', error);
      throw error;
    }
  },

updateBankAccount: async (data: BankAccountFormData): Promise<ApiResponse<unknown>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    const bodyToSend = new FormData();

    bodyToSend.append('titular_cuenta', data.titular_cuenta);
    bodyToSend.append('dni', data.dni);
    bodyToSend.append('banco_id', data.banco_id.toString());
    bodyToSend.append('tipo_cuenta_id', data.tipo_cuenta_id.toString());
    bodyToSend.append('numero_cuenta', data.numero_cuenta);

    if (data.imagenes_cuenta && data.imagenes_cuenta.length > 0) {
      data.imagenes_cuenta.forEach((file) => {
        bodyToSend.append('imagenes_cuenta[]', file);
      });
    }
    
    

    const response = await fetch(`${API_URL}/socio/bank-account`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: "application/json",
      },
      body: bodyToSend
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error del backend:", errorData);
      throw new Error(errorData.message || "Error al actualizar la cuenta bancaria");
    }

    return response.json() as Promise<ApiResponse<unknown>>;
  } catch (error) {
    console.error("Error en updateBankAccount:", error);
    throw error;
  }
},


  // Obtener bancos
  getBancos: async (): Promise<{ id: number; nombre: string }[]> => {
    try {
      const response = await fetch(`${API_URL}/bancos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener bancos");
      }

      return response.json();
    } catch (error) {
      console.error("Error en getBancos:", error);
      throw error;
    }
  },

  // Obtener tipos de cuenta
  getTiposCuenta: async (): Promise<{ id: number; nombre: string }[]> => {
    try {
      const response = await fetch(`${API_URL}/tipos-cuenta`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener tipos de cuenta");
      }

      return response.json();
    } catch (error) {
      console.error("Error en getTiposCuenta:", error);
      throw error;
    }
  },

  // Actualizar estado del local (activo/inactivo)
  actualizarEstadoLocal: async (localId: number, activo: boolean): Promise<{ success: boolean }> => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const response = await fetch(`${API_URL}/socio/estado`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id: localId, activo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el estado del local");
      }

      return response.json();
    } catch (error) {
      console.error("Error en actualizarEstadoLocal:", error);
      throw error;
    }
  },

};