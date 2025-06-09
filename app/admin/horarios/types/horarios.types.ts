// app\admin\horarios\types\horarios.types.ts
export interface HorarioBloque {
  id?: number;
  grupo_id?: number;
  dia_semana: string | string[];
  hora_inicio: string;
  hora_fin: string;
  tipo: 'trabajo' | 'descanso' | 'almuerzo';
  descripcion?: string;
  color?: string;
  orden?: number;
}

export interface Motorizado {
  id: number;
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
}

export interface HorarioGrupo {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: 'grupal' | 'individual';
  motorizado_individual_id?: number;
  bloques: HorarioBloque[];
  motorizados?: Motorizado[];
  motorizado_individual?: Motorizado;
  created_at?: string;
  updated_at?: string;
}

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export const DIAS_SEMANA: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const DIAS_LABELS = {
  lunes: 'Lunes',
  martes: 'Martes', 
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

export const TIPO_BLOQUE_COLORS = {
  trabajo: '#3B82F6',
  descanso: '#F59E0B', 
  almuerzo: '#10B981'
};

export const TIPO_BLOQUE_LABELS = {
  trabajo: 'Trabajo',
  descanso: 'Descanso',
  almuerzo: 'Almuerzo'
};