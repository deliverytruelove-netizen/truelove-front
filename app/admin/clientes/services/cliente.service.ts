// app/admin/clientes/services/cliente.service.ts

import type { Cliente, DetallesCliente } from '../types/cliente.types';

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

// Obtener el token de autenticación
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('authToken');
  return token;
};

// Obtener todos los clientes
export const fetchClientes = async (): Promise<Cliente[]> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }

    const response = await fetch(`${API_URL}/admin/cliente`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener clientes');
    }

    const data: Cliente[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error en fetchClientes:', error);
    throw error;
  }
};

// Obtener detalles de un cliente
export const fetchClienteDetails = async (id: number): Promise<DetallesCliente> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }

    const response = await fetch(`${API_URL}/admin/cliente/${id}/details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener detalles del cliente');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error en fetchClienteDetails:', error);
    throw error;
  }
};

// Eliminar un cliente
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }

    const response = await fetch(`${API_URL}/admin/cliente/${id}/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar cliente');
    }
  } catch (error) {
    console.error('Error en deleteCliente:', error);
    throw error;
  }
};
