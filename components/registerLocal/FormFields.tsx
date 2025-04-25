"use client"

import type React from "react"
import type { FormData, BusinessType } from "./types"
import { useState } from "react"
import { Upload, FileText, AlertCircle } from "lucide-react"


import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormFieldsProps {
  formData: FormData
  businessTypes: BusinessType[]
  isFieldsLocked: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  setFormData: (data: FormData) => void
  currentStep: number
}

export const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  businessTypes,
  isFieldsLocked,
  handleInputChange,
  handlePhoneChange,
  setFormData,
  currentStep,
}) => {
  const [fileErrors, setFileErrors] = useState({
    antecedentesPenales: "",
    antecedentesPoliciales: "",
  })

  const handleDocumentTypeChange = (value: string) => {
    const nuevoTipoDocumento = value

    const datosLimpios: FormData = {
      documentType: nuevoTipoDocumento,
      documentNumber: "",
      name: "",
      lastName: "",
      businessType: "",
      phone: "+51",
      email: "",
      antecedentesPenales: undefined,
      antecedentesPoliciales: undefined,
    }

    setFormData(datosLimpios)
  }

  // Función auxiliar para manejar cambios en el Select de shadcn
  const handleSelectChange = (name: string, value: string) => {
    handleInputChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    setFileErrors((prev) => ({ ...prev, [name]: "" }))

    if (files && files.length > 0) {
      const file = files[0]

      // Validar tipo de archivo
      if (file.type !== "application/pdf") {
        setFileErrors((prev) => ({ ...prev, [name]: "Solo se permiten archivos PDF" }))
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFileErrors((prev) => ({ ...prev, [name]: "El archivo no debe superar los 5MB" }))
        return
      }

      handleInputChange({
        target: { name, value: file },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const renderFileInput = (name: "antecedentesPenales" | "antecedentesPoliciales", label: string) => {
    const file = formData[name] as File | undefined

    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label} *</Label>
        <div className="relative">
          <div
            className={`w-full min-h-[100px] border-2 border-dashed rounded-lg 
                        ${fileErrors[name] ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"} 
                        transition-colors duration-200 flex flex-col items-center justify-center p-4 gap-2
                        hover:border-red-400 hover:bg-gray-100 cursor-pointer`}
          >
            <input
              id={name}
              type="file"
              name={name}
              onChange={handleFileChange}
              accept=".pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {file ? (
              <>
                <FileText className="w-8 h-8 text-red-500" />
                <div className="text-sm text-center">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-sm text-center">
                  <p className="font-medium text-gray-900">Haz clic para subir o arrastra y suelta</p>
                  <p className="text-gray-500">PDF (máx. 5MB)</p>
                </div>
              </>
            )}
          </div>
          {fileErrors[name] && (
            <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{fileErrors[name]}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (formData.documentType === "CARNET_EXTRANJERIA" && currentStep === 2) {
    return (
      <div className="space-y-6">
        {renderFileInput("antecedentesPenales", "Antecedentes Penales (PDF)")}
        {renderFileInput("antecedentesPoliciales", "Antecedentes Policiales (PDF)")}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="documentType">Tipo de Documento *</Label>
        <Select value={formData.documentType} onValueChange={(value) => handleDocumentTypeChange(value)}>
          <SelectTrigger id="documentType" className="w-full">
            <SelectValue placeholder="Seleccione tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DNI">DNI</SelectItem>
            <SelectItem value="RUC">RUC</SelectItem>
            <SelectItem value="CARNET_EXTRANJERIA">Carnet de Extranjería</SelectItem>
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
          placeholder="Ingrese su número de documento"
          className="bg-white/50 backdrop-blur-sm"
        />
      </div>

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

      <div className="space-y-1">
        <Label htmlFor="businessType">Tipo de negocio *</Label>
        <Select value={formData.businessType} onValueChange={(value) => handleSelectChange("businessType", value)}>
          <SelectTrigger id="businessType" className="w-full">
            <SelectValue placeholder="Seleccione tipo de negocio" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.id} value={type.nombre}>
                {type.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handlePhoneChange}
          required
          placeholder="Ingrese su número de teléfono"
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
          placeholder="Ingrese su correo electrónico"
          className="bg-white/50 backdrop-blur-sm"
        />
      </div>
    </>
  )
}
