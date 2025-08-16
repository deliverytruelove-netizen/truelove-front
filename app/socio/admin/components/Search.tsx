// app\socio\admin\components\Search.tsx
"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { SearchIcon, X, Loader2 } from "lucide-react"
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
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      try {
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

      setIsLoadingSuggestions(true)
      try {
        const predictions = await getAutocompleteSuggestions(query)
        setSuggestions(predictions)
      } catch (error) {
        console.error("Error al obtener sugerencias:", error)
        setSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    },
    [hasSelected, isLoaded],
  )

  const searchAllPlaces = useCallback(
    async (query: string) => {
      if (query.length < 4 || !isLoaded) return

      setIsSearchingPlaces(true)
      try {
        const results = await searchPlaces(query)
        setResults(results)
      } catch (error) {
        console.error("Error al buscar lugares:", error)
        setResults([])
      } finally {
        setIsSearchingPlaces(false)
      }
    },
    [isLoaded],
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && !hasSelected) {
        fetchSuggestions(searchQuery)
        if (searchQuery.length >= 4) {
          searchAllPlaces(searchQuery)
        } else {
          setResults([])
          setIsSearchingPlaces(false)
        }
      } else {
        setSuggestions([])
        setResults([])
        setIsLoadingSuggestions(false)
        setIsSearchingPlaces(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, fetchSuggestions, searchAllPlaces, hasSelected])

  const handleClearSearch = () => {
    setSearchQuery("")
    setSuggestions([])
    setResults([])
    setHasSelected(false)
    setIsLoadingSuggestions(false)
    setIsSearchingPlaces(false)
    setTimeout(() => inputRef.current?.focus(), 0)
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
        setIsLoadingSuggestions(false)
        setIsSearchingPlaces(false)
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
    setIsLoadingSuggestions(false)
    setIsSearchingPlaces(false)
  }

  const isLoading = isLoadingSuggestions || isSearchingPlaces
  const showResults = (suggestions.length > 0 || results.length > 0) && !hasSelected

  return (
    <div className="relative mb-6 max-w-[430px] w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar dirección o negocio en Perú..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setHasSelected(false)
          }}
          className="w-full pl-10 pr-10"
        />
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

        {isLoading && <Loader2 className="absolute right-10 top-3 h-4 w-4 text-muted-foreground animate-spin" />}

        {searchQuery && (
          <Button variant="ghost" size="icon" className="absolute right-1 top-1" onClick={handleClearSearch}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && (
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
                <li className="p-2 bg-muted text-xs font-medium">Más resultados</li>
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

              {isLoading && suggestions.length === 0 && results.length === 0 && (
                <li className="p-3 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
                  </div>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SearchComponent