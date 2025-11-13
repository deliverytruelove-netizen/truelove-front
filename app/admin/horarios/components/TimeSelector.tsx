// app\admin\horarios\components\TimeSelector.tsx
"use client"

import { useState } from "react"
import { Clock } from 'lucide-react'
import { format24to12 } from '../utils/timeFormat'

interface TimeSelectorMejoradoProps {
  label: string
  value: string // Siempre en formato 24h (HH:mm)
  onChange: (time: string) => void // Siempre devuelve formato 24h
  className?: string
}

export function TimeSelectorMejorado({ label, value, onChange, className = "" }: TimeSelectorMejoradoProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Generar opciones de tiempo cada 15 minutos
  const generateTimeOptions = () => {
    const options = []
    // Empezamos desde 01:00 hasta 23:45
    for (let hour = 1; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeValue24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const timeValue12 = format24to12(timeValue24)
        options.push({ value: timeValue24, label: timeValue12 })
      }
    }
    // Agregamos 00:00 (medianoche) al final
    for (let minute = 0; minute < 60; minute += 15) {
      const timeValue24 = `00:${minute.toString().padStart(2, '0')}`
      const timeValue12 = format24to12(timeValue24)
      options.push({ value: timeValue24, label: timeValue12 })
    }
    return options
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
                💡 Tip: Puedes crear horarios nocturnos (ej: 06:00 a 00:00)
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
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}