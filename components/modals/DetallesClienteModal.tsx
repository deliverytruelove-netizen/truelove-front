// components/modals/DetallesClienteModal.tsx
"use client";

import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import type { DetallesCliente } from "@/app/admin/clientes/types/cliente.types";
import Image from "next/image";

interface DetallesClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetallesCliente | null;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

export const DetallesClienteModal: React.FC<DetallesClienteModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Encabezado fijo */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Detalles del Cliente
          </h2>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-red-600" />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 col-span-2">
                  {data.personal.foto_perfil ? (
                    <Image
                      src={data.personal.foto_perfil}
                      alt={data.personal.nombre_completo}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{data.personal.nombre_completo}</p>
                    <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-300">
                      {data.personal.genero}
                    </Badge>
                  </div>
                </div>

                <InfoItem
                  icon={<Calendar className="w-5 h-5" />}
                  label="Fecha de Nacimiento"
                  value={`${formatDate(data.personal.fecha_nacimiento)} (${calcularEdad(data.personal.fecha_nacimiento)} años)`}
                />
                <InfoItem
                  icon={<User className="w-5 h-5" />}
                  label="Documento"
                  value={data.personal.documento}
                />
                <InfoItem
                  icon={<User className="w-5 h-5" />}
                  label="Nacionalidad"
                  value={data.personal.nacionalidad}
                />
                <InfoItem
                  icon={<Mail className="w-5 h-5" />}
                  label="Email"
                  value={data.personal.email}
                />
                <InfoItem
                  icon={<Phone className="w-5 h-5" />}
                  label="Celular"
                  value={data.personal.celular || "No especificado"}
                />
              </div>
            </div>

            {/* Direcciones */}
            {data.direcciones && data.direcciones.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Direcciones Registradas ({data.direcciones.length})
                </h3>
                <div className="space-y-3">
                  {data.direcciones.map((direccion, index) => (
                    <div key={direccion.id} className="bg-gray-50 p-4 rounded-lg border">
                      <p className="font-medium mb-2">
                        {direccion.alias || `Dirección ${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">{direccion.direccion}</p>
                      {direccion.referencia && (
                        <p className="text-sm text-gray-500">
                          <strong>Referencia:</strong> {direccion.referencia}
                        </p>
                      )}
                      {direccion.departamento && (
                        <p className="text-sm text-gray-500">
                          <strong>Departamento:</strong> {direccion.departamento}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estadísticas de Pedidos */}
            {/* <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-red-600" />
                Estadísticas de Pedidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                  <svg className="h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-2xl font-bold">{data.estadisticas.total_pedidos}</p>
                  <p className="text-sm text-gray-600">Total de Pedidos</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                  <svg className="h-8 w-8 text-green-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-2xl font-bold">{data.estadisticas.pedidos_completados}</p>
                  <p className="text-sm text-gray-600">Completados</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
                  <svg className="h-8 w-8 text-red-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-2xl font-bold">{data.estadisticas.pedidos_cancelados}</p>
                  <p className="text-sm text-gray-600">Cancelados</p>
                </div>
              </div>

              {data.estadisticas.ultimo_pedido && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
                  <p className="font-semibold mb-3">Último Pedido</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">ID</p>
                      <p className="font-medium">#{data.estadisticas.ultimo_pedido.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estado</p>
                      <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-300">
                        {data.estadisticas.ultimo_pedido.estado || "Sin estado"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha</p>
                      <p className="font-medium">{formatDate(data.estadisticas.ultimo_pedido.fecha)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium">S/ {data.estadisticas.ultimo_pedido.total?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div> */}

            {/* Fechas de Registro */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Información de Registro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={<Calendar className="w-5 h-5" />}
                  label="Fecha de Registro"
                  value={formatDate(data.personal.created_at)}
                />
                <InfoItem
                  icon={<Calendar className="w-5 h-5" />}
                  label="Última Actualización"
                  value={formatDate(data.personal.updated_at)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pie fijo */}
        <div className="bg-gray-50 border-t p-6 flex justify-end rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
