// app\admin\usuarios\types\User.types.ts
export interface User {
  id: number;
  usuario: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string | null;
  estado: number;
  role_id: number;
  businessRegistration?: {
    id: number;
    perfilNegocio?: {
      foto_perfil: string | null;
    };
  };
}