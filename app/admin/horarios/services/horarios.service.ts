// src/services/horarios.service.ts
import axios from "axios";
import type { HorarioGrupo, HorarioBloque, Motorizado } from "../types/horarios.types";

const API_URL = process.env.NEXT_PUBLIC_API_WEB ;

// Función auxiliar para obtener headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * Obtiene todos los grupos de horarios
 */
export const fetchGruposHorarios = async (): Promise<HorarioGrupo[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/admin/horarios`, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener grupos de horarios:", error);
    throw error;
  }
};

/**
 * Obtiene un grupo de horarios específico
 */
export const fetchGrupoHorario = async (id: number): Promise<HorarioGrupo> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/admin/horarios/${id}`, { headers });
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener grupo de horario ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene horarios grupales
 */
export const fetchHorariosGrupales = async (): Promise<HorarioGrupo[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/admin/horarios/grupales`, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener horarios grupales:", error);
    throw error;
  }
};

/**
 * Obtiene horarios individuales
 */
export const fetchHorariosIndividuales = async (): Promise<HorarioGrupo[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/admin/horarios/individuales`, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener horarios individuales:", error);
    throw error;
  }
};

/**
 * Crea un nuevo grupo de horarios
 */
export const createGrupoHorario = async (grupo: {
  nombre: string;
  descripcion?: string;
  tipo: 'grupal' | 'individual';
  motorizado_individual_id?: number;
  bloques: Omit<HorarioBloque, 'id' | 'grupo_id'>[];
  motorizados?: number[];
}): Promise<HorarioGrupo> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/admin/horarios`, grupo, { headers });
    return response.data.data;
  } catch (error) {
    console.error("Error al crear grupo de horario:", error);
    throw error;
  }
};

/**
 * Actualiza un grupo de horarios existente
 */
export const updateGrupoHorario = async (
  id: number,
  grupo: {
    nombre: string;
    descripcion?: string;
    bloques: HorarioBloque[];
    motorizados?: number[];
  }
): Promise<HorarioGrupo> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`${API_URL}/admin/horarios/${id}`, grupo, { headers });
    return response.data.data;
  } catch (error) {
    console.error(`Error al actualizar grupo de horario ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un grupo de horarios
 */
export const deleteGrupoHorario = async (id: number): Promise<void> => {
  try {
    const headers = getAuthHeaders();
    await axios.delete(`${API_URL}/admin/horarios/${id}`, { headers });
  } catch (error) {
    console.error(`Error al eliminar grupo de horario ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los motorizados disponibles
 */
export const fetchMotorizadosDisponibles = async (): Promise<Motorizado[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/admin/horarios/motorizados/disponibles`, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener motorizados disponibles:", error);
    throw error;
  }
};

/**
 * Obtiene horario de un motorizado específico
 */
export const fetchHorarioMotorizado = async (motorizadoId: number): Promise<{ data: HorarioGrupo | null, tipo: string }> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/admin/horarios/motorizado/${motorizadoId}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener horario del motorizado ${motorizadoId}:`, error);
    throw error;
  }
};