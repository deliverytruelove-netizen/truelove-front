'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import mapboxgl from 'mapbox-gl'

export default function SearchComponent({ onLocationSelect }: { onLocationSelect: (location: any) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) return

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}&country=PE&types=address,poi,place`
      )
      const data = await response.json()
      setSuggestions(data.features)
    } catch (error) {
      console.error('Error al obtener sugerencias:', error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) fetchSuggestions(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleClearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
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

      {suggestions.length > 0 && !searchQuery.includes(', Peru') && (
        <Card className="absolute w-full mt-1 z-50">
          <CardContent className="p-0">
            <ul className="max-h-[280px] overflow-auto">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className="p-3 hover:bg-accent cursor-pointer border-b last:border-0"
                  onClick={() => {
                    onLocationSelect(suggestion)
                    setSearchQuery(suggestion.place_name)
                    setSuggestions([])
                  }}
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