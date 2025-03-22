"use client"

import type React from "react"
import type { FormData, BusinessType } from "./types"
import { useState } from "react"
import { Upload, FileText, AlertCircle } from "lucide-react"

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

  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTipoDocumento = e.target.value

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
        <label className="block text-sm font-medium text-gray-700">{label} *</label>
        <div className="relative">
          <div
            className={`w-full min-h-[100px] border-2 border-dashed rounded-lg 
                        ${fileErrors[name] ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"} 
                        transition-colors duration-200 flex flex-col items-center justify-center p-4 gap-2
                        hover:border-red-400 hover:bg-gray-100 cursor-pointer`}
          >
            <input
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
        <label className="block text-sm font-medium text-gray-700">Tipo de Documento *</label>
        <select
          name="documentType"
          value={formData.documentType}
          onChange={handleDocumentTypeChange}
          required
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200"
        >
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
          <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Número de Documento *</label>
        <input
          type="text"
          name="documentNumber"
          value={formData.documentNumber}
          onChange={handleInputChange}
          required
          maxLength={formData.documentType === "RUC" ? 11 : 20}
          placeholder="Ingrese su número de documento"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          disabled={isFieldsLocked}
          placeholder="Ingrese su nombre"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Apellido *</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
          disabled={isFieldsLocked}
          placeholder="Ingrese su apellido"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Tipo de negocio *</label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200"
        >
          <option value="">Seleccione tipo de negocio</option>
          {businessTypes.map((type) => (
            <option key={type.id} value={type.nombre}>
              {type.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handlePhoneChange}
          required
          placeholder="Ingrese su número de teléfono"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Correo Electrónico *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="Ingrese su correo electrónico"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200"
        />
      </div>
    </>
  )
}

