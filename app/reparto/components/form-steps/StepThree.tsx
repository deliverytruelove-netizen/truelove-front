// app\reparto\components\form-steps\StepThree.tsx
"use client"

import type * as React from "react"
import { Loader2, Upload, X } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { FormData } from "../../types/form-types"
import { DocumentoImagenes } from "./DocumentoImagenes"

interface StepThreeProps {
  formData: FormData
  updateFormData: (field: keyof FormData, value: FormData[keyof FormData]) => void
  isLoading: boolean
  handleDocumentChange: (value: string) => Promise<void>
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, side: "frente" | "reverso") => Promise<void>
  handleDocumentoAdicionalUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  previewImageFrente: string | null
  previewImageReverso: string | null
  fileInputRefFrente: React.RefObject<HTMLInputElement>
  fileInputRefReverso: React.RefObject<HTMLInputElement>
  fileInputRefAdicional: React.RefObject<HTMLInputElement>
  isMobile: boolean
  setIsCameraOpenFrente: (isOpen: boolean) => void
  setIsCameraOpenReverso: (isOpen: boolean) => void
  isUploading: boolean
}

export function StepThree({
  formData,
  updateFormData,
  isLoading,
  handleDocumentChange,
  handleFileUpload,
  handleDocumentoAdicionalUpload,
  previewImageFrente,
  previewImageReverso,
  fileInputRefFrente,
  fileInputRefReverso,
  fileInputRefAdicional,
  isMobile,
  setIsCameraOpenFrente,
  setIsCameraOpenReverso,
  isUploading,
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
        <div>
          {/* <div className="flex justify-between items-center mb-2">
            <Label>Imágenes del documento</Label>
            <span className="text-sm text-gray-500">(Opcional)</span>
          </div> */}
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
        </div>
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

      {/* Sección de documentos adicionales */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <Label>Documentos adicionales</Label>
          <span className="text-sm text-gray-500">(Opcional, máx. 2MB)</span>
        </div>
        
        <div className="space-y-3">
          {formData.documentosAdicionales?.map((doc, index) => (
            <div key={index} className="flex items-center justify-between border p-2 rounded">
              <div className="truncate max-w-[80%]">{doc.nombre}</div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const nuevosDocumentos = [...formData.documentosAdicionales];
                  nuevosDocumentos.splice(index, 1);
                  updateFormData("documentosAdicionales", nuevosDocumentos);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <input
            type="file"
            id="documentoAdicional"
            ref={fileInputRefAdicional}
            onChange={handleDocumentoAdicionalUpload}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => fileInputRefAdicional.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir documento adicional (PDF, máx. 2MB)
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 mt-1">
            Consejo: Para reducir el tamaño de tus PDFs, puedes usar herramientas en línea como 
            <a href="https://smallpdf.com/compress-pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
              SmallPDF
            </a> o 
            <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
              iLovePDF
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}