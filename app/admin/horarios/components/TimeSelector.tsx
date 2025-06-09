"use client"
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from 'lucide-react'

interface TimeSelectorProps {
  value: string // formato 24h "14:30"
  onChange: (time: string) => void
  label: string
}

export function TimeSelectorMejorado({ value, onChange, label }: TimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generar todas las opciones de tiempo (cada 15 minutos)
  const generateTimeOptions = () => {
    const options = []
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const time12 = convertTo12Hour(time24)
        options.push({
          value: time24,
          label: time12
        })
      }
    }
    
    return options
  }

  // Convertir de 24h a 12h para mostrar
  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const timeOptions = generateTimeOptions()
  const currentLabel = convertTo12Hour(value)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll al elemento seleccionado cuando se abre
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector('[data-selected="true"]')
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [isOpen])

  const handleSelect = (timeValue: string) => {
    onChange(timeValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-900">{currentLabel}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                data-selected={option.value === value}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  option.value === value 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mostrar tiempo en formato 24h para debug */}
      <div className="text-xs text-gray-500 mt-1">Formato 24h: {value}</div>
    </div>
  )
}
