// app/datosBancarios/components/FormularioDatosBancarios.tsx
"use client"

import type React from "react"
import { CircleHelp, Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface EstablecimientoDireccion {
  calle: string
  numero: string
  codigo_postal: string
  provincia: string
  ciudad: string
  referencia: string | null
  direccion_completa: string
}

interface FormularioDatosBancariosProps {
  formData: {
    accountHolder: string
    accountNumber: string
    bankName: string
    accountType: string
    documentNumber: string
    cci: string
    useBusinessAddress: boolean
  }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectChange: (id: string, value: string) => void
  handleCheckboxChange: (checked: boolean) => void
  isLoading: boolean
  isSaving: boolean
  establecimientoDireccion: EstablecimientoDireccion | null
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
    <Card className="w-full shadow-sm border border-gray-200 bg-white">
    <CardHeader className="pb-4">
      <CardTitle className="text-2xl font-bold text-gray-900">Datos Bancarios</CardTitle>
    </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="accountHolder">
              Titular de Cuenta bancaria <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="accountHolder"
                placeholder="Nombre del titular"
                required
                value={formData.accountHolder}
                onChange={handleInputChange}
                className="pr-10"
                disabled={isLoading || isSaving}
              />
              <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              Número de cuenta bancaria <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="accountNumber"
                placeholder="Número de cuenta"
                required
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="pr-10"
                disabled={isLoading || isSaving}
              />
              <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">
              Nombre del banco <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => handleSelectChange("bankName", value)}
              disabled={isLoading || isSaving}
              value={formData.bankName}
              defaultValue={formData.bankName}
            >
              <SelectTrigger id="bankName">
                <SelectValue placeholder="Seleccionar banco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bcp">BCP</SelectItem>
                <SelectItem value="bbva">BBVA</SelectItem>
                <SelectItem value="interbank">Interbank</SelectItem>
                <SelectItem value="scotiabank">Scotiabank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">
              Tipo de Cuenta Bancaria <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => handleSelectChange("accountType", value)}
              disabled={isLoading || isSaving}
              value={formData.accountType}
              defaultValue={formData.accountType}
            >
              <SelectTrigger id="accountType">
                <SelectValue placeholder="Seleccionar tipo de cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ahorros">Cuenta de Ahorros</SelectItem>
                <SelectItem value="Corriente">Cuenta Corriente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber">
              Documento del titular (RUC) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="documentNumber"
                placeholder="Número de RUC"
                required
                value={formData.documentNumber}
                onChange={handleInputChange}
                className="pr-10"
                disabled={isLoading || isSaving}
              />
              <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cci">
              Código de Cuenta Interbancaria (CCI) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="cci"
                placeholder="Número de CCI"
                required
                value={formData.cci}
                onChange={handleInputChange}
                className="pr-10"
                disabled={isLoading || isSaving}
              />
              <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-start space-x-3 pt-4">
            <Checkbox
              id="useBusinessAddress"
              checked={formData.useBusinessAddress}
              onCheckedChange={handleCheckboxChange}
              disabled={isLoading || isSaving}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="useBusinessAddress"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mi dirección de facturación es la misma que la dirección del negocio
              </label>
              {formData.useBusinessAddress && (
                <>
                  {establecimientoDireccion ? (
                    <p className="text-sm text-muted-foreground">{establecimientoDireccion.direccion_completa}</p>
                  ) : isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando dirección...
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No se pudo cargar la dirección</p>
                  )}
                </>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
