'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function RegistrationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    documentType: "DNI",
    documentNumber: "",
    name: "",
    lastName: "",
    businessType: "",
    phone: "+51",
    email: ""
  })
  const [error, setError] = useState<string | null>(null) // Asegurando que el error sea solo string o null
  const [isFieldsLocked, setIsFieldsLocked] = useState(false)


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value
    
 
    if (!value.startsWith('+51')) {
      return
    }


    const numberPart = value.substring(3)

    const numbersOnly = numberPart.replace(/\D/g, '')
    
    // limite 9 digitos
    if (numbersOnly.length <= 9) {
      // Formatea el número de teléfono
      let formattedNumber = '+51'
      if (numbersOnly.length > 0) {
        formattedNumber += ' ' + numbersOnly.substring(0, 3)
        if (numbersOnly.length > 3) {
          formattedNumber += ' ' + numbersOnly.substring(3, 6)
          if (numbersOnly.length > 6) {
            formattedNumber += ' ' + numbersOnly.substring(6)
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        phone: formattedNumber
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'documentType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        documentNumber: '',
        name: '',
        lastName: ''
      }))
      setIsFieldsLocked(false)
      setError(null)  // Reset error cuando cambia el tipo de documento
      return
    }

    if (name === 'phone') {
      handlePhoneChange(e)
      return
    }

    if (name === 'documentNumber') {
      const numbersOnly = value.replace(/\D/g, '')
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }))

      if ((formData.documentType === 'DNI' && numbersOnly.length === 8) ||
        (formData.documentType === 'RUC' && numbersOnly.length === 11)) {
        fetchDocumentInfo(formData.documentType, numbersOnly)
      }
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const fetchDocumentInfo = async (type: string, number: string) => {
    setIsLoading(true)
    setError(null)  // Reset error antes de realizar la solicitud

    try {
      const url = type === 'DNI'
        ? `https://dniruc.apisperu.com/api/v1/dni/${number}`
        : `https://dniruc.apisperu.com/api/v1/ruc/${number}`

      const response = await fetch(`${url}?token=${process.env.NEXT_PUBLIC_API_TOKEN}`)
      const data = await response.json()

      if (type === 'DNI') {
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            name: data.nombres,
            lastName: `${data.apellidoPaterno} ${data.apellidoMaterno}`.trim()
          }))
          setIsFieldsLocked(true)
        } else {
          setError('No se encontraron datos para el DNI proporcionado')
        }
      } else {
        if (data.ruc) {
          setFormData(prev => ({
            ...prev,
            name: data.razonSocial
          }))
          setIsFieldsLocked(true)
        } else {
          setError('No se encontraron datos para el RUC proporcionado')
        }
      }
    } catch (error) {
      setError(`Error al conectar con el servicio de validación${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)  // Reset error antes de enviar el formulario

    try {
      // Validación de campos requeridos
      if (!formData.documentNumber || !formData.name || !formData.lastName || !formData.businessType || !formData.phone || !formData.email) {
        setError('Todos los campos son obligatorios')
        setIsLoading(false)
        return
      }

      const response = await fetch(process.env.NEXT_PUBLIC_API_WEB + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          name: formData.name,
          lastName: formData.lastName,
          businessType: formData.businessType,
          phone: formData.phone.replace(/\D/g, ''),
          email: formData.email
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al enviar el formulario')
      }

      const data = await response.json()
      router.push(`/email?email=${encodeURIComponent(formData.email)}&registration_id=${data.registration_id}`)
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg w-full bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-xl mx-auto md:ml-80">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        ¡Registra tu local ahora!
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Tipo de Documento *</label>
          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleInputChange}
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
            maxLength={formData.documentType === 'RUC' ? 11 : 8}
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
          <input
            type="text"
            name="businessType"
            value={formData.businessType}
            onChange={handleInputChange}
            required
            placeholder="Ingrese tipo de negocio"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                     text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                     transition-colors duration-200"
          />
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

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 rounded-lg bg-red-500 text-white font-semibold 
                   focus:ring-2 focus:ring-[#f34739] focus:ring-opacity-50 
                   hover:bg-[#d33729] disabled:bg-gray-300 disabled:text-gray-500 
                   transition-colors duration-200"
        >
          {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Registrar'}
        </button>
      </form>
    </div>
  )
}
