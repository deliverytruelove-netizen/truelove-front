// components\registerLocal\useFormHandlers.ts
import type React from "react"
import type { FormData } from "./types"

export const useFormHandlers = (
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  setIsFieldsLocked: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "documentType") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        documentNumber: "",
        name: "",
        lastName: "",
      }))
      setIsFieldsLocked(false)
      setError(null)
      return
    }

    if (name === "phone") {
      handlePhoneChange(e)
      return
    }

    if (name === "documentNumber") {
      const numbersOnly = value.replace(/\D/g, "")
      setFormData((prev) => ({
        ...prev,
        [name]: numbersOnly,
      }))

      if (
        (formData.documentType === "DNI" && numbersOnly.length === 8) ||
        (formData.documentType === "RUC" && numbersOnly.length === 11)
      ) {
        fetchDocumentInfo(formData.documentType, numbersOnly)
      }
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value

    if (!value.startsWith("+51")) {
      return
    }

    const numberPart = value.substring(3)
    const numbersOnly = numberPart.replace(/\D/g, "")

    if (numbersOnly.length <= 9) {
      let formattedNumber = "+51"
      if (numbersOnly.length > 0) {
        formattedNumber += " " + numbersOnly.substring(0, 3)
        if (numbersOnly.length > 3) {
          formattedNumber += " " + numbersOnly.substring(3, 6)
          if (numbersOnly.length > 6) {
            formattedNumber += " " + numbersOnly.substring(6)
          }
        }
      }

      setFormData((prev) => ({
        ...prev,
        phone: formattedNumber,
      }))
    }
  }

  const fetchDocumentInfo = async (type: string, number: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const url =
        type === "DNI"
          ? `https://dniruc.apisperu.com/api/v1/dni/${number}`
          : `https://dniruc.apisperu.com/api/v1/ruc/${number}`

      const response = await fetch(`${url}?token=${process.env.NEXT_PUBLIC_API_TOKEN}`)
      const data = await response.json()

      if (type === "DNI") {
        if (data.success) {
          setFormData((prev) => ({
            ...prev,
            name: data.nombres,
            lastName: `${data.apellidoPaterno} ${data.apellidoMaterno}`.trim(),
          }))
          setIsFieldsLocked(true)
        } else {
          setError("No se encontraron datos para el DNI proporcionado")
        }
      } else {
        if (data.ruc) {
          setFormData((prev) => ({
            ...prev,
            name: data.razonSocial,
          }))
          setIsFieldsLocked(true)
        } else {
          setError("No se encontraron datos para el RUC proporcionado")
        }
      }
    } catch (error) {
      setError("Error al conectar con el servicio de validación")
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return { handleInputChange, handlePhoneChange, fetchDocumentInfo }
}

