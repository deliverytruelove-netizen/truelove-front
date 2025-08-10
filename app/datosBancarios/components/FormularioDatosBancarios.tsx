// app/datosBancarios/components/FormularioDatosBancarios.tsx
"use client";

import type React from "react";
import { HelpCircle as CircleHelp, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface EstablecimientoDireccion {
  calle: string;
  numero: string;
  codigo_postal: string;
  provincia: string;
  ciudad: string;
  referencia: string | null;
  direccion_completa: string;
}

interface FormularioDatosBancariosProps {
  formData: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    accountType: string;
    documentNumber: string;
    cci: string;
    useBusinessAddress: boolean;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (id: string, value: string) => void;
  handleCheckboxChange: (checked: boolean) => void;
  isLoading: boolean;
  isSaving: boolean;
  establecimientoDireccion: EstablecimientoDireccion | null;
}

export default function FormularioDatosBancarios({
  formData,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
  isLoading,
  isSaving,
  establecimientoDireccion,
}: FormularioDatosBancariosProps) {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {/* Titular de Cuenta */}
      <div className="md:col-span-2">
        <Label htmlFor="accountHolder" className="text-sm font-medium">
          Titular de Cuenta bancaria *
        </Label>
        <div className="relative mt-1">
          <Input
            id="accountHolder"
            placeholder="Nombre completo del titular"
            required
            value={formData.accountHolder}
            onChange={handleInputChange}
            className="pr-10"
            disabled={isLoading || isSaving}
          />
          <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Número de cuenta */}
      <div>
        <Label htmlFor="accountNumber" className="text-sm font-medium">
          Número de cuenta *
        </Label>
        <div className="relative mt-1">
          <Input
            id="accountNumber"
            placeholder="Número de cuenta bancaria"
            required
            value={formData.accountNumber}
            onChange={handleInputChange}
            className="pr-10"
            disabled={isLoading || isSaving}
          />
          <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Nombre del banco */}
      <div>
        <Label htmlFor="bankName" className="text-sm font-medium">
          Nombre del banco *
        </Label>
        <Select
          onValueChange={(value) => handleSelectChange("bankName", value)}
          disabled={isLoading || isSaving}
          value={formData.bankName}
        >
          <SelectTrigger id="bankName" className="mt-1">
            <SelectValue placeholder="Seleccionar banco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bcp">BCP - Banco de Crédito del Perú</SelectItem>
            <SelectItem value="bbva">BBVA Continental</SelectItem>
            <SelectItem value="interbank">Interbank</SelectItem>
            <SelectItem value="scotiabank">Scotiabank Perú</SelectItem>
            <SelectItem value="bif">BIF - Banco Interamericano de Finanzas</SelectItem>
            <SelectItem value="pichincha">Banco Pichincha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de cuenta */}
      <div>
        <Label htmlFor="accountType" className="text-sm font-medium">
          Tipo de Cuenta *
        </Label>
        <Select
          onValueChange={(value) => handleSelectChange("accountType", value)}
          disabled={isLoading || isSaving}
          value={formData.accountType}
        >
          <SelectTrigger id="accountType" className="mt-1">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ahorros">Cuenta de Ahorros</SelectItem>
            <SelectItem value="Corriente">Cuenta Corriente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documento del titular */}
      <div>
        <Label htmlFor="documentNumber" className="text-sm font-medium">
          RUC del titular *
        </Label>
        <div className="relative mt-1">
          <Input
            id="documentNumber"
            placeholder="20123456789"
            required
            value={formData.documentNumber}
            onChange={handleInputChange}
            className="pr-10"
            disabled={isLoading || isSaving}
            maxLength={11}
          />
          <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Debe tener 11 dígitos y comenzar con 20
        </p>
      </div>

      {/* CCI */}
      <div className="md:col-span-2">
        <Label htmlFor="cci" className="text-sm font-medium">
          Código de Cuenta Interbancaria (CCI) *
        </Label>
        <div className="relative mt-1">
          <Input
            id="cci"
            placeholder="00200000000000000000"
            required
            value={formData.cci}
            onChange={handleInputChange}
            className="pr-10"
            disabled={isLoading || isSaving}
            maxLength={20}
          />
          <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Código de 20 dígitos que identifica su cuenta de forma única
        </p>
      </div>

      {/* Checkbox dirección */}
      <div className="md:col-span-2 pt-4 border-t">
        <h3 className="text-md font-semibold mb-4">Dirección de Facturación</h3>
        <div className="flex items-start space-x-3 p-4 rounded-lg border bg-gray-50/50">
          <Checkbox
            id="useBusinessAddress"
            checked={formData.useBusinessAddress}
            onCheckedChange={handleCheckboxChange}
            disabled={isLoading || isSaving}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-2">
            <Label
              htmlFor="useBusinessAddress"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Usar la dirección de mi negocio para facturación
            </Label>
            
            {formData.useBusinessAddress && (
              <div className="mt-3 p-3 bg-white border rounded-md">
                {establecimientoDireccion ? (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium">
                        Dirección del negocio:
                      </p>
                      <p className="text-sm text-gray-600">
                        {establecimientoDireccion.direccion_completa}
                      </p>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cargando dirección del negocio...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <CircleHelp className="h-4 w-4" />
                    <span>No se pudo cargar la dirección</span>
                  </div>
                )}
              </div>
            )}
            
            {!formData.useBusinessAddress && (
              <p className="text-xs text-muted-foreground">
                Podrá configurar una dirección diferente en el siguiente paso
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}