// app\admin\motorizado\services\motorizado.service.ts
import { Motorizado, DetallesMotorizado } from '../types/motorizado.types';

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export const fetchMotorizados = async (): Promise<Motorizado[]> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No se encontró el token');
  }

  const response = await fetch(`${API_URL}/admin/motorizado`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error en la respuesta del servidor');
  }

  return response.json();
};

export const fetchMotorizadoDetails = async (id: number): Promise<DetallesMotorizado> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No se encontró el token');
  }

  const response = await fetch(`${API_URL}/admin/motorizado/${id}/details`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener los detalles del motorizado');
  }

  const data = await response.json();
  return data.data;
};

export const changeStateMotorizado = async (id: number): Promise<void> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No se encontró el token');
  }

  const response = await fetch(`${API_URL}/admin/motorizado/change/state/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al cambiar el estado del motorizado');
  }
};

export const aprobarMotorizado = async (id: number): Promise<void> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No se encontró el token');
  }

  const response = await fetch(`${API_URL}/admin/motorizado/${id}/aprobar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Error al aprobar el motorizado');
  }

  const data = await response.json();
  if (data.status !== 'success') {
    throw new Error(data.message || 'Error al aprobar el motorizado');
  }
};

