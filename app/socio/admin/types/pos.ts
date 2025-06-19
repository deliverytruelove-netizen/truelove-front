export interface POSSettings {
  posToDriver: number;
  entrega_documento_venta: number;
}

export interface BusinessRegistration {
  id: number;
  documentType: string;
  documentNumber: string;
  name: string;
  lastName: string;
  businessType: string;
  phone: string;
  email: string;
  posToDriver: number;
  entrega_documento_venta: number;
}