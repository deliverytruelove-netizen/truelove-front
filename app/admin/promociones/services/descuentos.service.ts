// app/admin/promociones/services/descuentos.service.ts
import axios from "axios";
import { DescuentoCliente, TopCliente, Cliente } from "../types/descuento.types";

const API_URL = process.env.NEXT_PUBLIC_API_WEB || " ";

export const getDescuentos = async (): Promise<DescuentoCliente[]> => {
  const response = await axios.get(`${API_URL}/descuentos/clientes`);
  return response.data;
};

export const getTopClientes = async (): Promise<TopCliente[]> => {
  const response = await axios.get(`${API_URL}/clientes/top-completados`);
  return response.data.data;
};

export const buscarClientes = async (query: string): Promise<Cliente[]> => {
  const response = await axios.get(`${API_URL}/clientes/buscar?query=${encodeURIComponent(query)}`);
  return response.data.data;
};

export const createDescuento = async (data: Partial<DescuentoCliente>): Promise<DescuentoCliente> => {
  const response = await axios.post(`${API_URL}/descuentos/clientes`, data);
  return response.data.descuento;
};

export const updateDescuento = async (id: number, data: Partial<DescuentoCliente>): Promise<DescuentoCliente> => {
  const response = await axios.put(`${API_URL}/descuentos/clientes/${id}`, data);
  return response.data.descuento;
};

export const deleteDescuento = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/descuentos/clientes/${id}`);
};

export const getClienteDescuentos = async (idCliente: number): Promise<DescuentoCliente[]> => {
  const response = await axios.get(`${API_URL}/descuentos/cliente/${idCliente}`);
  return response.data;
};

export const aplicarDescuento = async (codigo: string, montoTotal: number, costoDelivery: number) => {
  const response = await axios.post(`${API_URL}/descuentos/aplicar`, {
    codigo,
    monto_total: montoTotal,
    costo_delivery: costoDelivery
  });
  return response.data;
};

export const getEstadisticasDescuentos = async () => {
  const response = await axios.get(`${API_URL}/descuentos/estadisticas`);
  return response.data.estadisticas;
};