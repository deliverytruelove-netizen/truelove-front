// app\admin\tiposNegocio\services\TiposNegocio.service.ts

import { TipoNegocio, Categoria, TipoNegocioFormData, CategoriaFormData, ApiResponse } from '../types/TiposNegocio.types';

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No se encontró el token');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ========== TIPOS DE NEGOCIO ==========

/**
 * Obtener todos los tipos de negocio
 */
export const fetchTiposNegocio = async (): Promise<TipoNegocio[]> => {
  const response = await fetch(`${API_URL}/admin/tipos-negocio/admin/all`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener los tipos de negocio');
  }

  const data: ApiResponse<TipoNegocio[]> = await response.json();
  return data.data;
};

/**
 * Crear un nuevo tipo de negocio
 */
export const createTipoNegocio = async (formData: TipoNegocioFormData): Promise<TipoNegocio> => {
  const response = await fetch(`${API_URL}/admin/tipos-negocio/admin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });

  const data: ApiResponse<TipoNegocio> = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al crear el tipo de negocio');
  }

  return data.data;
};

/**
 * Actualizar un tipo de negocio
 */
export const updateTipoNegocio = async (id: number, formData: TipoNegocioFormData): Promise<TipoNegocio> => {
  const response = await fetch(`${API_URL}/admin/tipos-negocio/admin/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });

  const data: ApiResponse<TipoNegocio> = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar el tipo de negocio');
  }

  return data.data;
};

/**
 * Eliminar un tipo de negocio
 */
export const deleteTipoNegocio = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/tipos-negocio/admin/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar el tipo de negocio');
  }
};

/**
 * Cambiar estado de un tipo de negocio (activar/desactivar)
 */
export const toggleTipoNegocioStatus = async (id: number): Promise<TipoNegocio> => {
  const response = await fetch(`${API_URL}/admin/tipos-negocio/admin/${id}/toggle-status`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data: ApiResponse<TipoNegocio> = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al cambiar el estado');
  }

  return data.data;
};

// ========== CATEGORÍAS ==========

/**
 * Obtener todas las categorías de un tipo de negocio
 */
export const fetchCategorias = async (tipoNegocioId: number): Promise<Categoria[]> => {
  const response = await fetch(`${API_URL}/admin/categorias/admin/tipo/${tipoNegocioId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener las categorías');
  }

  const data: ApiResponse<Categoria[]> = await response.json();
  return data.data;
};

/**
 * Crear una nueva categoría
 */
export const createCategoria = async (formData: CategoriaFormData): Promise<Categoria> => {
  const response = await fetch(`${API_URL}/admin/categorias/admin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });

  const data: ApiResponse<Categoria> = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al crear la categoría');
  }

  return data.data;
};

/**
 * Actualizar una categoría
 */
export const updateCategoria = async (id: number, formData: Omit<CategoriaFormData, 'tipo_negocio_id'>): Promise<Categoria> => {
  const response = await fetch(`${API_URL}/admin/categorias/admin/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });

  const data: ApiResponse<Categoria> = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar la categoría');
  }

  return data.data;
};

/**
 * Eliminar una categoría
 */
export const deleteCategoria = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/categorias/admin/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar la categoría');
  }
};

/**
 * Cambiar estado de una categoría (activar/desactivar)
 */
export const toggleCategoriaStatus = async (id: number): Promise<Categoria> => {
  const response = await fetch(`${API_URL}/admin/categorias/admin/${id}/toggle-status`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data: ApiResponse<Categoria> = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al cambiar el estado');
  }

  return data.data;
};
