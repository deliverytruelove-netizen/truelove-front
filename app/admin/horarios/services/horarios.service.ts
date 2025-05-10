// app/admin/horarios/services/horarios.service.ts
import axios from "axios";
import type { Grupo, Rango, Motorizado } from "../types/horarios.types";

const API_URL = process.env.NEXT_PUBLIC_API_WEB;

/**
 * Obtiene todos los grupos de horarios
 * @returns Lista de grupos de horarios
 */
export const fetchGruposHorarios = async (): Promise<Grupo[]> => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("authToken");

    // Verificar si existe el token
    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    // Configuración de headers para las peticiones
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Obtener los grupos de horarios
    const response = await axios.get(`${API_URL}/admin/horarios`, { headers });
    
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener grupos de horarios:", error);
    throw error;
  }
};

/**
 * Obtiene un grupo de horarios específico
 * @param id ID del grupo
 * @returns Datos del grupo
 */
export const fetchGrupoHorario = async (id: number): Promise<Grupo> => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get(`${API_URL}/admin/horarios/${id}`, { headers });
    
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener grupo de horario ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo grupo de horarios
 * @param grupo Datos del grupo a crear
 * @returns Grupo creado
 */
export const createGrupoHorario = async (grupo: {
  nombre: string;
  descripcion?: string;
  rangos: Omit<Rango, "id">[];
  motorizados?: number[];
}): Promise<Grupo> => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(`${API_URL}/admin/horarios`, grupo, { headers });
    
    return response.data.data;
  } catch (error) {
    console.error("Error al crear grupo de horario:", error);
    throw error;
  }
};

/**
 * Actualiza un grupo de horarios existente
 * @param id ID del grupo
 * @param grupo Datos actualizados del grupo
 * @returns Grupo actualizado
 */
export const updateGrupoHorario = async (
  id: number,
  grupo: {
    nombre: string;
    descripcion?: string;
    rangos: (Rango | Omit<Rango, "id">)[];
    motorizados?: number[];
  }
): Promise<Grupo> => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.put(`${API_URL}/admin/horarios/${id}`, grupo, { headers });
    
    return response.data.data;
  } catch (error) {
    console.error(`Error al actualizar grupo de horario ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un grupo de horarios
 * @param id ID del grupo a eliminar
 */
export const deleteGrupoHorario = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    await axios.delete(`${API_URL}/admin/horarios/${id}`, { headers });
  } catch (error) {
    console.error(`Error al eliminar grupo de horario ${id}:`, error);
    throw error;
  }
};

/**
 * Asigna motorizados a un grupo de horarios
 * @param grupoId ID del grupo
 * @param motorizadosIds IDs de los motorizados a asignar
 * @returns Motorizados asignados
 */
export const asignarMotorizados = async (
  grupoId: number,
  motorizadosIds: number[]
): Promise<Motorizado[]> => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      `${API_URL}/admin/horarios/${grupoId}/asignar`,
      { motorizados: motorizadosIds },
      { headers }
    );
    
    return response.data.data;
  } catch (error) {
    console.error(`Error al asignar motorizados al grupo ${grupoId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los motorizados disponibles
 * @returns Lista de motorizados disponibles
 */
export const fetchMotorizadosDisponibles = async (): Promise<Motorizado[]> => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get(`${API_URL}/admin/horarios/motorizados/disponibles`, { headers });
    
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener motorizados disponibles:", error);
    throw error;
  }
};