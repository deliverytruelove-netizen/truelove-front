import axios from 'axios';
import { Socio } from '../types/Socios.types';

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export const fetchSocios = async (): Promise<Socio[]> => {
  // Obtén el token del almacenamiento local o de las cookies
  const token = localStorage.getItem('authToken'); // O usa cookies si es el caso

  // Si no hay token, puedes lanzar un error o manejarlo de otra manera
  if (!token) {
    throw new Error('No token found');
  }

  // Realiza la solicitud fetch con el token en los encabezados
  const response = await fetch(API_URL + '/admin/socio', {
    method: 'GET', // Método GET para obtener usuarios
    headers: {
      'Authorization': `Bearer ${token}`,  // Agregar el token Bearer a los headers
      'Content-Type': 'application/json',  // Establecer el tipo de contenido
    },
  });

  // Verifica si la respuesta fue correcta
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  // Retorna los datos como JSON
  return response.json();
};


export const changeStateSocio = async (socio: number): Promise<void> => {
  // Obtén el token desde el localStorage o las cookies
  const token = localStorage.getItem('authToken'); // O usa cookies si es el caso

  if (!token) {
    throw new Error('No token found');
  }

  await axios.post(API_URL + `/admin/socio/change/state/${socio}`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,  // Agregar el token Bearer
      'Content-Type': 'application/json',  // Establecer tipo de contenido si es necesario
    }
  });
};