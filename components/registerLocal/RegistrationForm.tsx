'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { EmailAlert } from './email-alert'

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
  const [error, setError] = useState<string | null>(null)
  const [isFieldsLocked, setIsFieldsLocked] = useState(false)
  const [businessTypes, setBusinessTypes] = useState<Array<{
    id: number;
    nombre: string;
  }>>([])

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/tipos-negocio`)
        const data = await response.json()
        setBusinessTypes(data)
      } catch (error) {
        console.error('Error fetching business types:', error)
        setError('Error al cargar los tipos de negocio')
      }
    }

    fetchBusinessTypes()
  }, [])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value
    
    if (!value.startsWith('+51')) {
      return
    }

    const numberPart = value.substring(3)
    const numbersOnly = numberPart.replace(/\D/g, '')
    
    if (numbersOnly.length <= 9) {
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
      setError(null)
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
    setError(null)
    
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
      setError('Error al conectar con el servicio de validación')
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      if (!formData.documentNumber || !formData.name || !formData.lastName || !formData.businessType || !formData.phone || !formData.email) {
        setError('Todos los campos son obligatorios')
        setIsLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/api/register`, {
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
        })
      });

      const data = await response.json()
    
      // Log the entire server response for debugging
      console.log('Server response:', data)

      if (!response.ok) {
        // Check for specific error messages or codes from the server
        if (data.error && typeof data.error === 'string' && 
           (data.error.toLowerCase().includes('email') || 
            data.error.toLowerCase().includes('correo') ||
            data.error.toLowerCase().includes('duplicado'))) {
          setError('email_taken')
        } else if (data.message && typeof data.message === 'string' &&
           (data.message.toLowerCase().includes('email') || 
            data.message.toLowerCase().includes('correo') ||
            data.message.toLowerCase().includes('duplicado'))) {
          setError('email_taken')
        } else {
          // If it's not a specific email error, set a generic error message
          setError('Hubo un problema al registrar el negocio. Por favor, intente nuevamente.')
        }
        return
      }

      // If everything is OK, redirect
      router.push(`/email?email=${encodeURIComponent(formData.email)}&registration_id=${encodeURIComponent(data.registration_id)}`)
    } catch (error) {
      console.error('Error submitting form:', error)
      setError('Hubo un problema al registrar el negocio. Por favor, intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg w-full bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-xl mx-auto">
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

        {error && (
          error === 'email_taken' ? (
            <EmailAlert onClose={() => setError(null)} />
          ) : (
            <p className="text-red-600 text-sm">{error}</p>
          )
        )}

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

