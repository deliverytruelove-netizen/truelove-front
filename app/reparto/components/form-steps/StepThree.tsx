"use client"

import type * as React from "react"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    </div>
  )
}
