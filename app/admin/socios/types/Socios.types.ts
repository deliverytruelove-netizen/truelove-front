export interface Socio {
  id: number;
  name: string;
  lastName: string;
  businessType: string;
  phone: string;
  email: string;
  verification_code: string | null;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}