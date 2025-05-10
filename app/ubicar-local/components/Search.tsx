// app\ubicar-local\components\Search.tsx

"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { SearchIcon, X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { loadLibrary, getAutocompleteSuggestions, searchPlaces } from "../services/maps.service"
import type { GoogleMapsLocation, PlaceResult } from "../types/google-maps"

interface SearchComponentProps {
  onLocationSelect: (location: GoogleMapsLocation) => void
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [results, setResults] = useState<PlaceResult[]>([])
  const [hasSelected, setHasSelected] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      try {
        // Cargar la biblioteca de geocodificación
        const geocodingLib = await loadLibrary<google.maps.GeocodingLibrary>("geocoding")
        geocoderRef.current = new geocodingLib.Geocoder()
        setIsLoaded(true)
      } catch (error) {
        console.error("Error al cargar Google Maps API:", error)
      }
    }

    loadGoogleMapsAPI()
  }, [])

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length < 3 || hasSelected || !isLoaded) return

      try {
        const predictions = await getAutocompleteSuggestions(query)
        setSuggestions(predictions)
      } catch (error) {
        console.error("Error al obtener sugerencias:", error)
        setSuggestions([])
      }
    },
    [hasSelected, isLoaded],
  )

  const searchAllPlaces = useCallback(
    async (query: string) => {
      if (query.length < 3 || !isLoaded) return

      setIsSearching(true)
      try {
        const results = await searchPlaces(query)
        setResults(results)
      } catch (error) {
        console.error("Error al buscar lugares:", error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [isLoaded],
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && !hasSelected) {
        fetchSuggestions(searchQuery)
        if (searchQuery.length >= 5) {
          searchAllPlaces(searchQuery)
        }
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, fetchSuggestions, searchAllPlaces, hasSelected])

  const handleClearSearch = () => {
    setSearchQuery("")
    setSuggestions([])
    setResults([])
    setHasSelected(false)
  }

  const handleLocationSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    if (!geocoderRef.current) return

    try {
      const response = await geocoderRef.current.geocode({ placeId: prediction.place_id })
      
      if (response.results && response.results[0]) {
        const location = response.results[0]
        const lat = location.geometry?.location?.lat() || 0
        const lng = location.geometry?.location?.lng() || 0

        const locationData: GoogleMapsLocation = {
          place_id: location.place_id,
          formatted_address: location.formatted_address || prediction.description,
          center: [lng, lat],
          name:
            location.address_components?.find((component) => component.types.includes("establishment"))?.long_name ||
            prediction.structured_formatting?.main_text ||
            "",
          address_components: location.address_components,
        }

        onLocationSelect(locationData)
        setSearchQuery(location.formatted_address || prediction.description)
        setSuggestions([])
        setResults([])
        setHasSelected(true)
      }
    } catch (error) {
      console.error("Error en geocodificación:", error)
    }
  }

  const handleResultSelect = (place: PlaceResult) => {
    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()

    const locationData: GoogleMapsLocation = {
      place_id: place.place_id,
      formatted_address: place.formatted_address || place.name || "",
      center: [lng, lat],
      name: place.name || "",
    }

    onLocationSelect(locationData)
    setSearchQuery(place.name || place.formatted_address || "")
    setSuggestions([])
    setResults([])
    setHasSelected(true)
  }

  return (
    <div className="relative mb-6 max-w-[430px] w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar dirección o negocio en Perú..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setHasSelected(false)
          }}
          className="w-full pl-10 pr-10"
          disabled={!isLoaded || isSearching}
        />
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        {searchQuery && (
          <Button variant="ghost" size="icon" className="absolute right-1 top-1" onClick={handleClearSearch}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {(suggestions.length > 0 || results.length > 0) && !hasSelected && (
        <Card className="absolute w-full mt-1 z-50">
          <CardContent className="p-0">
            <ul className="max-h-[280px] overflow-auto">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  className="p-3 hover:bg-accent cursor-pointer border-b"
                  onClick={() => handleLocationSelect(suggestion)}
                >
                  <div className="font-medium">{suggestion.structured_formatting?.main_text}</div>
                  <div className="text-sm text-muted-foreground">
                    {suggestion.structured_formatting?.secondary_text}
                  </div>
                </li>
              ))}

              {results.length > 0 && suggestions.length > 0 && (
                <li className="p-2 bg-muted text-xs font-medium">Resultados de búsqueda</li>
              )}

              {results.map((place) => (
                <li
                  key={place.place_id}
                  className="p-3 hover:bg-accent cursor-pointer border-b last:border-0"
                  onClick={() => handleResultSelect(place)}
                >
                  <div className="font-medium">{place.name}</div>
                  <div className="text-sm text-muted-foreground">{place.formatted_address}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {isSearching && <div className="text-center py-2 text-sm text-muted-foreground">Buscando lugares...</div>}
    </div>
  )
}

export default SearchComponent