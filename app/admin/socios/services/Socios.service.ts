// Importar los tipos Socio y DetallesSocio
import { Socio, DetallesSocio } from '../types/Socios.types';

// Definir la URL de la API
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

// Función para obtener la lista de socios
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

// Función para obtener los detalles de un socio específico
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

// Función para cambiar el estado de un socio
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

// Función para aprobar un socio
export const aprobarSocio = async (id: number): Promise<void> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No se encontró el token');
  }

  try {
    const response = await fetch(`${API_URL}/admin/socio/${id}/aprobar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Si la respuesta no es ok, lanzamos el error con el mensaje del servidor
    if (!response.ok) {
      throw new Error(data.message || 'Error al aprobar el socio');
    }

    // Verificamos el status en la respuesta
    if (data.status !== 'success') {
      throw new Error(data.message || 'Error al aprobar el socio');
    }

    return;
  } catch (error) {
    // Capturamos cualquier error y lo relanzamos con un mensaje más descriptivo
    if (error instanceof Error) {
      throw new Error(`Error al aprobar el socio: ${error.message}`);
    }
    throw new Error('Error al aprobar el socio');
  }
};

