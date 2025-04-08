"use client"

import type * as React from "react"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormData } from "../../types/form-types"
import { DocumentoImagenes } from "./DocumentoImagenes"

interface StepThreeProps {
  formData: FormData
  updateFormData: (field: keyof FormData, value: FormData[keyof FormData]) => void
  isLoading: boolean
  handleDocumentChange: (value: string) => Promise<void>
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, side: "frente" | "reverso") => Promise<void>
  previewImageFrente: string | null
  previewImageReverso: string | null
  fileInputRefFrente: React.RefObject<HTMLInputElement>
  fileInputRefReverso: React.RefObject<HTMLInputElement>
  isMobile: boolean
  setIsCameraOpenFrente: (isOpen: boolean) => void
  setIsCameraOpenReverso: (isOpen: boolean) => void
}

export function StepThree({
  formData,
  updateFormData,
  isLoading,
  handleDocumentChange,
  handleFileUpload,
  previewImageFrente,
  previewImageReverso,
  fileInputRefFrente,
  fileInputRefReverso,
  isMobile,
  setIsCameraOpenFrente,
  setIsCameraOpenReverso,
}: StepThreeProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tipoDocumento">Tipo de documento</Label>
        <Select
          value={formData.tipoDocumento}
          onValueChange={(value) => {
            updateFormData("tipoDocumento", value)
            updateFormData("nroDocumento", "")
            updateFormData("nombres", "")
            updateFormData("apellidos", "")
            updateFormData("documentoImagenFrente", null)
            updateFormData("documentoImagenReverso", null)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Elige tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DNI">DNI</SelectItem>
            <SelectItem value="RUC">RUC</SelectItem>
            <SelectItem value="CE">Carnet de Extranjería</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="nroDocumento">Número de documento</Label>
        <div className="relative">
          <Input
            id="nroDocumento"
            value={formData.nroDocumento}
            onChange={(e) => handleDocumentChange(e.target.value)}
            required
            maxLength={formData.tipoDocumento === "RUC" ? 11 : 20}
            className={isLoading ? "pr-10" : ""}
            disabled={isLoading}
          />
          {isLoading && <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {(formData.tipoDocumento === "DNI" || formData.tipoDocumento === "CE") && (
        <DocumentoImagenes
          previewImageFrente={previewImageFrente}
          previewImageReverso={previewImageReverso}
          fileInputRefFrente={fileInputRefFrente}
          fileInputRefReverso={fileInputRefReverso}
          handleFileUpload={handleFileUpload}
          isMobile={isMobile}
          setIsCameraOpenFrente={setIsCameraOpenFrente}
          setIsCameraOpenReverso={setIsCameraOpenReverso}
        />
      )}

      <div>
        <Label htmlFor="nombres">{formData.tipoDocumento === "RUC" ? "Razón Social" : "Nombres"}</Label>
        <Input
          id="nombres"
          value={formData.nombres}
          onChange={(e) => updateFormData("nombres", e.target.value)}
          required
          readOnly={formData.tipoDocumento !== "CE"}
        />
      </div>

      {formData.tipoDocumento !== "RUC" && (
        <div>
          <Label htmlFor="apellidos">Apellidos</Label>
          <Input
            id="apellidos"
            value={formData.apellidos}
            onChange={(e) => updateFormData("apellidos", e.target.value)}
            required
            readOnly={formData.tipoDocumento !== "CE"}
          />
        </div>
      )}

      <div>
        <Label>¿Tienes más de 18 años?</Label>
        <RadioGroup
          value={formData.mayorEdad}
          onValueChange={(value) => updateFormData("mayorEdad", value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="si" id="si" />
            <Label htmlFor="si">Sí</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Código</Label>
          <Select defaultValue="+51">
            <SelectTrigger>
              <SelectValue placeholder="+51" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+51">+51</SelectItem>
              <SelectItem value="+54">+54</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label htmlFor="celular">Número de celular</Label>
          <Input
            id="celular"
            type="tel"
            value={formData.celular}
            onChange={(e) => updateFormData("celular", e.target.value)}
            required
            maxLength={9}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          required
        />
      </div>

      <div className="flex items-start space-x-2 ">
        <Checkbox
          id="politica"
          checked={formData.aceptaPolitica}
          onCheckedChange={(checked: boolean) => updateFormData("aceptaPolitica", checked)}
        />
        <Label htmlFor="politica" className="text-sm text-gray-500">
          Estoy de acuerdo con la política de privacidad y acepto ser contactado por canales de terceros.
        </Label>
      </div>
    </div>
  )
}

