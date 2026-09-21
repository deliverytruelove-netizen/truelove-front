// services/clienteMenuService.ts
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

export interface MenuItem {
  id: number;
  empresa_id: number;
  titulo: string;
  descripcion: string | null;
  foto: string | null;
  precio: string;
  status: string;
}

export interface MenuCategoria {
  nombre: string;
  items: MenuItem[];
}

export const fetchMenuCategorias = async (empresaId: number): Promise<MenuCategoria[]> => {
  const response = await fetch(`${API_URL}/listar/menus/categoria/${empresaId}`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export interface GrupoItem {
  id: number;
  menu_id: number;
  empresa_id: number;
  titulo: string;
  descripcion: string | null;
  foto: string | null;
  precio: string;
  status: string;
}

export interface Grupo {
  id: number;
  empresa_id: number;
  nombre: string;
  minimo: number;
  maximo: number;
  estado: string;
  items: GrupoItem[];
}

export const fetchAdicionales = async (empresaId: number, menuId: number): Promise<Grupo[]> => {
  const response = await fetch(`${API_URL}/get/menu/adicionales/${empresaId}?menu_id=${menuId}`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};
