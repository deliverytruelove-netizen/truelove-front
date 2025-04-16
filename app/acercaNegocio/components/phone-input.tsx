"use client"

import type React from "react"
import { Input } from "@/components/ui/input"

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string
  onChange: (value: string) => void
}

export function PhoneInput({ value, onChange, className, ...props }: PhoneInputProps) {
  // Extraer solo los dígitos del valor actual (sin el prefijo +51 y sin guiones)
  const getDigitsOnly = (val: string) => {
    return val.replace(/\D/g, "").replace(/^51/, "")
  }

  // Formatear el número con guiones
  const formatPhoneNumber = (digits: string) => {
    if (!digits) return ""

    // Dividir en grupos de 3 dígitos
    const groups = []
    for (let i = 0; i < digits.length; i += 3) {
      groups.push(digits.slice(i, i + 3))
    }

    return groups.join("-")
  }

  // Manejar el cambio en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Obtener el valor del input (sin el prefijo que mostramos visualmente)
    const inputValue = e.target.value

    // Si el usuario intenta borrar el prefijo, no hacemos nada
    if (!inputValue.startsWith("+51 ")) {
      return
    }

    // Extraer solo la parte después del prefijo
    const afterPrefix = inputValue.substring(4)

    // Extraer solo los dígitos
    const digitsOnly = getDigitsOnly(afterPrefix)

    // Limitar a 9 dígitos
    const limitedDigits = digitsOnly.slice(0, 9)

    // Formatear con guiones
    // const formatted = formatPhoneNumber(limitedDigits)

    // Actualizar el valor en el formulario (guardamos con el formato requerido por la validación)
    onChange("+51" + limitedDigits)
  }

  // Valor que se muestra en el input (con formato)
  const displayValue = () => {
    const digitsOnly = getDigitsOnly(value)
    return "+51 " + formatPhoneNumber(digitsOnly)
  }

  return (
    <div className="relative">
      <Input {...props} type="text" value={displayValue()} onChange={handleChange} className={className} />
    </div>
  )
}
