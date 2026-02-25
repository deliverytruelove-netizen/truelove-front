// components\registerLocal\FormFields.tsx
"use client";

import type React from "react";
import type { FormData, BusinessType } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormFieldsProps {
  formData: FormData;
  businessTypes: BusinessType[];
  isFieldsLocked: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handlePhoneChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  setFormData: (data: FormData) => void;
}

export const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  businessTypes,
  isFieldsLocked,
  handleInputChange,
  handlePhoneChange,
  setFormData,
}) => {
  const handleDocumentTypeChange = (value: string) => {
    const nuevoTipoDocumento = value;

    const datosLimpios: FormData = {
      documentType: nuevoTipoDocumento,
      documentNumber: "",
      name: "",
      lastName: "",
      businessType: "",
      phone: "+51",
      email: "",
      posToDriver: 0,
      entrega_documento_venta: 0,
      omitir_pago_adelantado: false,
    };

    setFormData(datosLimpios);
  };

  const handleSelectChange = (name: string, value: string) => {
    handleInputChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div className="space-y-4">
      {/* Información Personal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="documentType">Tipo de Documento *</Label>
          <Select
            value={formData.documentType}
            onValueChange={(value) => handleDocumentTypeChange(value)}
          >
            <SelectTrigger id="documentType" className="w-full">
              <SelectValue placeholder="Seleccione tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DNI">DNI</SelectItem>
              <SelectItem value="RUC">RUC</SelectItem>
              <SelectItem value="CARNET_EXTRANJERIA">
                Carnet de Extranjería
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="documentNumber">Número de Documento *</Label>
          <Input
            id="documentNumber"
            type="text"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleInputChange}
            required
            maxLength={formData.documentType === "RUC" ? 11 : 20}
            placeholder="Número de documento"
            className="bg-white/50 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Campos de Nombre/Apellido o Razón Social según tipo de documento */}
      {formData.documentType === "RUC" ? (
        <div className="space-y-1">
          <Label htmlFor="name">Razón Social *</Label>
          <Input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isFieldsLocked}
            placeholder="Ingrese la razón social"
            className="bg-white/50 backdrop-blur-sm"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isFieldsLocked}
              placeholder="Ingrese su nombre"
              className="bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              disabled={isFieldsLocked}
              placeholder="Ingrese su apellido"
              className="bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="businessType">Tipo de negocio *</Label>
        <Select
          value={formData.businessType}
          onValueChange={(value) => handleSelectChange("businessType", value)}
        >
          <SelectTrigger id="businessType" className="w-full">
            <SelectValue placeholder="Seleccione tipo de negocio" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {businessTypes.map((type) => (
              <SelectItem key={type.id} value={type.nombre}>
                {type.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Información de Contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            required
            placeholder="Número de teléfono"
            className="bg-white/50 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Correo Electrónico *</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Correo electrónico"
            className="bg-white/50 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Configuración de Servicios */}
      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="posToDriver">¿Deseas facilitar tu máquina POS al driver?</Label>
          <Select
            value={formData.posToDriver.toString()}
            onValueChange={(value) => {
              setFormData({
                ...formData,
                posToDriver: parseInt(value, 10),
              });
            }}
          >
            <SelectTrigger id="posToDriver" className="w-full">
              <SelectValue placeholder="Seleccione una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No facilitar POS</SelectItem>
              <SelectItem value="1">POS Estilos</SelectItem>
              <SelectItem value="2">POS Visa</SelectItem>
              <SelectItem value="3">Ambos POS </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Esta opción permite que el repartidor use tu dispositivo para cobros con tarjeta a los clientes.
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="entrega_documento_venta">¿Emites documentos de venta (facturas/boletas)?</Label>
          <Select
            value={formData.entrega_documento_venta.toString()}
            onValueChange={(value) => {
              setFormData({
                ...formData,
                entrega_documento_venta: parseInt(value, 10),
              });
            }}
          >
            <SelectTrigger id="entrega_documento_venta" className="w-full">
              <SelectValue placeholder="Seleccione una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No emito documentos de venta</SelectItem>
              <SelectItem value="1">Sí emito Boleta de venta</SelectItem>
              <SelectItem value="2">Sí emito Factura de venta</SelectItem>
              <SelectItem value="3">Sí emito Ambos</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Esta opción indica si tu negocio puede emitir facturas o boletas para las entregas.
            Ideal para carritos ambulantes que no cuentan con sistema de facturación.
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <input
            type="checkbox"
            id="omitir_pago_adelantado"
            checked={formData.omitir_pago_adelantado}
            onChange={(e) => {
              setFormData({
                ...formData,
                omitir_pago_adelantado: e.target.checked,
              });
            }}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
          />
          <div>
            <Label htmlFor="omitir_pago_adelantado" className="cursor-pointer">
              Omitir pago adelantado al cliente
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Si activas esta opción, no se le cobrará adelantado al cliente ni se mostrará
              tu nombre y número de Yape/Plin en la app. Ideal para negocios que prefieren
              manejar el cobro directamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};