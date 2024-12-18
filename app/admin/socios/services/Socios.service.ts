import { Socio, DetallesSocio } from '../types/Socios.types';

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export const fetchSocios = async (): Promise<Socio[]> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No se encontró el token');
  }

  const response = await fetch(`${API_URL}/admin/socio`, {
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

export const fetchSocioDetails = async (id: number): Promise<DetallesSocio> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No se encontró el token');
  }

  const response = await fetch(`${API_URL}/admin/socio/${id}/details`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener los detalles del socio');
  }

  const data = await response.json();
  return data.data;
};

export const changeStateSocio = async (id: number): Promise<void> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No se encontró el token');
  }

  const response = await fetch(`${API_URL}/admin/socio/change/state/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al cambiar el estado del socio');
  }
};

export const aprobarSocio = async (id: number): Promise<void> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No se encontró el token');
  }

  const response = await fetch(`${API_URL}/admin/socio/${id}/aprobar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Error al aprobar el socio');
  }

  const data = await response.json();
  if (data.status !== 'success') {
    throw new Error(data.message || 'Error al aprobar el socio');
  }
};

