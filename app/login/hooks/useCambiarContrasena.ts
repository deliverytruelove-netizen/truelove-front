// app\login\hooks\useCambiarContrasena.ts
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { postData, verifyEmail, verifyCode } from "../../../services/apiService"

interface DatosCambioContrasena {
  email: string
  newPassword: string
  confirmPassword: string
  verificationCode: string
}

interface ErrorResponse {
  data?: {
    error: string
  }
  message: string
}

export const useCambiarContrasena = () => {
  const [formData, setFormData] = useState<DatosCambioContrasena>({
    email: "",
    newPassword: "",
    confirmPassword: "",
    verificationCode: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  })
  const [passwordMatch, setPasswordMatch] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isCodeVerified, setIsCodeVerified] = useState(false)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const router = useRouter()

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    if (name === "newPassword") {
      validatePassword(value)
      // También validar coincidencia con confirmPassword si ya existe
      if (formData.confirmPassword) {
        setPasswordMatch(value === formData.confirmPassword)
      }
    }
    
    if (name === "confirmPassword") {
      setPasswordMatch(value === formData.newPassword)
    }
  }

  const validatePassword = (password: string) => {
    const newValidation = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    }
    setPasswordValidation(newValidation)
    return Object.values(newValidation).every(Boolean)
  }

  const handleVerifyEmail = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const response = await verifyEmail(formData.email)
      if (response.exists) {
        setIsCodeSent(true)
        setSuccessMessage("Se ha enviado un código de verificación a tu correo electrónico")

        // Si estamos en desarrollo y el backend devuelve el código (para pruebas)
        if (response.code) {
          console.log("Código de verificación (solo para desarrollo):", response.code)
        }
      } else {
        setErrorMessage("No se encontró ninguna cuenta con este correo electrónico")
      }
    } catch (error) {
      console.error("Error al verificar el correo:", error)
      setErrorMessage(error instanceof Error ? error.message : "Error al verificar el correo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await verifyCode(formData.email, formData.verificationCode)
      if (response.valid) {
        setIsEmailVerified(true)
        setIsCodeVerified(true)
        setSuccessMessage("Código verificado correctamente")

        // Guardar el token si el backend lo devuelve
        if (response.token) {
          setVerificationToken(response.token)
        }
      } else {
        setErrorMessage("Código de verificación inválido")
      }
    } catch (error) {
      console.error("Error al verificar el código:", error)
      setErrorMessage(error instanceof Error ? error.message : "Error al verificar el código")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!isCodeVerified) {
      setErrorMessage("Por favor, verifica tu correo primero")
      setIsLoading(false)
      return
    }

    if (!validatePassword(formData.newPassword)) {
      setErrorMessage("La contraseña no cumple con los requisitos")
      setIsLoading(false)
      return
    }

    if (!passwordMatch) {
      setErrorMessage("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("email", formData.email)
      formDataToSend.append("newPassword", formData.newPassword)

      // Usar el token si existe, de lo contrario usar el código
      if (verificationToken) {
        formDataToSend.append("token", verificationToken)
      } else {
        formDataToSend.append("verificationCode", formData.verificationCode)
      }

      await postData({
        endpoint: "admin/reset-password",
        data: formDataToSend,
      })

      setSuccessMessage("Contraseña restablecida exitosamente")
      router.push("/login?reset=success")
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error)
      const errorResponse = error as ErrorResponse
      setErrorMessage(
        errorResponse.data?.error ||
          errorResponse.message ||
          "Error al restablecer la contraseña. Por favor, intente nuevamente.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    formData,
    showPassword,
    showConfirmPassword,
    isLoading,
    errorMessage,
    successMessage,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleChange,
    handleSubmit,
    handleVerifyEmail,
    handleVerifyCode,
    passwordValidation,
    passwordMatch,
    isEmailVerified,
    isCodeSent,
    isCodeVerified,
  }
}