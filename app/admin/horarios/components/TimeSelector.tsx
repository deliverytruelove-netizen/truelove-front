// app\admin\horarios\components\TimeSelector.tsx
"use client"

import { useState } from "react"
import { Clock } from 'lucide-react'

interface TimeSelectorMejoradoProps {
  label: string
  value: string
  onChange: (time: string) => void
  className?: string
}

export function TimeSelectorMejorado({ label, value, onChange, className = "" }: TimeSelectorMejoradoProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Generar opciones de tiempo cada 15 minutos
  const generateTimeOptions = () => {
    const options = []
    // Empezamos desde 1 AM hasta 11 PM
    for (let hour = 1; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = formatTimeDisplay(timeValue)
        options.push({ value: timeValue, label: displayTime })
      }
    }
    // Agregamos 12 AM (hora 0) al final
    for (let minute = 0; minute < 60; minute += 15) {
      const timeValue = `00:${minute.toString().padStart(2, '0')}`
      const displayTime = formatTimeDisplay(timeValue)
      options.push({ value: timeValue, label: displayTime })
    }
    return options
  }

  const formatTimeDisplay = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const timeOptions = generateTimeOptions()
  const selectedOption = timeOptions.find(option => option.value === value)

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Clock className="inline h-4 w-4 mr-1" />
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            {selectedOption ? selectedOption.label : "Seleccionar hora..."}
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded mb-2">
                💡 Tip: Puedes crear horarios nocturnos (ej: 6:00 AM a 12:00 AM)
              </div>
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-brand-50 hover:text-brand-700 transition-colors ${
                    option.value === value ? 'bg-brand-100 text-brand-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    <span className="text-xs text-gray-500">{option.value}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mostrar formato 24h debajo */}
      <div className="text-xs text-gray-500 mt-1">
        Formato 24h: {value || "00:00"}
      </div>
    </div>
  )
}