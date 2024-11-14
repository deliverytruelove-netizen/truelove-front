'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import mapboxgl from 'mapbox-gl'

// Define el tipo MapboxFeature aquí
type MapboxFeature = {
  id: string
  place_name: string
  center: [number, number]
  text: string
  context?: { id: string; text: string }[]
}

type MapboxResponse = {
  features: MapboxFeature[]
}

interface SearchComponentProps {
  onLocationSelect: (location: MapboxFeature) => void
}

export default function SearchComponent({ onLocationSelect }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [hasSelected, setHasSelected] = useState(false) // Nuevo estado para controlar si se ha seleccionado una ubicación

  // Función para obtener sugerencias de Mapbox
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3 || hasSelected) return // Evita hacer solicitudes si ya se ha seleccionado una ubicación

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}&country=PE&types=address,poi,place`
      )
      const data: MapboxResponse = await response.json()
      setSuggestions(data.features)
    } catch (error) {
      console.error('Error al obtener sugerencias:', error)
    }
  }, [hasSelected]) // Dependencia de `hasSelected` para que se actualice cuando cambie

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) fetchSuggestions(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, fetchSuggestions]) // Incluye `fetchSuggestions` en las dependencias

  // Limpia la búsqueda
  const handleClearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
    setHasSelected(false) // Permite que se puedan mostrar sugerencias nuevamente
  }

  // Manejador de selección de ubicación
  const handleLocationSelect = (suggestion: MapboxFeature) => {
    // Selecciona la ubicación, limpia las sugerencias y marca como seleccionado
    onLocationSelect(suggestion)
    setSearchQuery(suggestion.place_name)
    setSuggestions([]) // Limpia las sugerencias después de la selección
    setHasSelected(true) // Marca que se ha hecho una selección
  }

  return (
    <div className="relative mb-6 max-w-[430px] w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar ubicación..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10"
          disabled={hasSelected} // Desactiva el campo de búsqueda si ya se seleccionó una ubicación
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {suggestions.length > 0 && !hasSelected && ( // Solo muestra las sugerencias si no se ha seleccionado ninguna
        <Card className="absolute w-full mt-1 z-50">
          <CardContent className="p-0">
            <ul className="max-h-[280px] overflow-auto">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className="p-3 hover:bg-accent cursor-pointer border-b last:border-0"
                  onClick={() => handleLocationSelect(suggestion)}
                >
                  {suggestion.place_name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
