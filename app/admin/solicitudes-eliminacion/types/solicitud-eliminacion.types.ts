// types/solicitud-eliminacion.types.ts

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  celular?: string;
}

export interface ProcessedBy {
  id: number;
  name: string;
  email: string;
}

export interface SolicitudEliminacion {
  id: number;
  cliente_id: number;
  request_id: string;
  motivo: string | null;
  status: "pending" | "approved" | "rejected";
  verification_code: string;
  code_verified_at: string | null;
  requested_at: string;
  processed_at: string | null;
  processed_by: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  cliente: Cliente;
  processedBy?: ProcessedBy;
}

export interface EstadisticasSolicitudes {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface RechazarSolicitudRequest {
  admin_notes: string;
}

export interface AprobarSolicitudRequest {
  admin_notes?: string;
}
