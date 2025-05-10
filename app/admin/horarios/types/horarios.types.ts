// app/admin/horarios/types/horarios.types.ts
export interface Rango {
dia_semana: ('lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo' | 'todos')[];
  hora_inicio: string;
  hora_fin: string;
}
  
  export interface Motorizado {
    id: number;
    nombres: string;
    apellidos: string;
    celular: string;
    email: string;
  }
  
  export interface Grupo {
    id: number;
    nombre: string;
    descripcion?: string;
    rangos: Rango[];
    motorizados: Motorizado[];
    created_at?: string;
    updated_at?: string;
  }