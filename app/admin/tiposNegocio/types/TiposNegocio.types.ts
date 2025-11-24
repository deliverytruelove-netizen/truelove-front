// app\admin\tiposNegocio\types\TiposNegocio.types.ts

export interface TipoNegocio {
  id: number;
  nombre: string;
  slug: string;
  activo: boolean;
  categorias_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  tipo_negocio_id: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TipoNegocioFormData {
  nombre: string;
}

export interface CategoriaFormData {
  nombre: string;
  tipo_negocio_id: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}
