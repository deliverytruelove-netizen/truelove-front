"use client"

import React, { useState, useRef, useEffect } from "react"
import { Search, X, ChevronDown } from "lucide-react"

interface Option {
  id: number
  nombre: string
}

interface SearchableSelectProps {
  options: Option[]
  value: number | null
  onChange: (value: number | null) => void
  placeholder: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  icon,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.id === value)

  const filteredOptions = options.filter((option) =>
    option.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (optionId: number) => {
    onChange(optionId)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setSearchTerm("")
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
        {icon}
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
              {selectedOption ? selectedOption.nombre : placeholder}
            </span>
            <div className="flex items-center gap-2">
              {selectedOption && !disabled && (
                <X
                  className="w-4 h-4 text-gray-400 hover:text-gray-600"
                  onClick={handleClear}
                />
              )}
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Búsqueda */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Opciones */}
            <div className="overflow-y-auto max-h-52">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-center text-gray-500 text-xs">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                      value === option.id ? "bg-brand-500 bg-opacity-10 text-brand-500 font-medium" : "text-gray-900"
                    }`}
                  >
                    {option.nombre}
                  </button>
                ))
              )}
            </div>

            {/* Footer con contador */}
            {filteredOptions.length > 0 && (
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 text-center">
                  {filteredOptions.length} {filteredOptions.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {options.length === 0 && (
        <p className="text-xs text-gray-500">No hay opciones disponibles</p>
      )}
    </div>
  )
}

export default SearchableSelect
