'use client'

import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface MapboxFeature {
  id: string
  place_name: string
  center: [number, number]
  text: string
  context?: Array<{
    id: string
    text: string
  }>
}

interface MapComponentProps {
  selectedLocation: { center: [number, number] } | null
  onLocationUpdate?: (location: MapboxFeature) => void
}

export default function MapComponent({ selectedLocation, onLocationUpdate }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // Actualiza el marcador en el mapa
  const updateMarker = useCallback((coordinates: [number, number]) => {
    if (!mapRef.current) return

    if (markerRef.current) {
      markerRef.current.setLngLat(coordinates)
    } else {
      markerRef.current = new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat(coordinates)
        .addTo(mapRef.current)
    }
  }, [])

  // Maneja los clics en el mapa
  const handleMapClick = useCallback(async (e: mapboxgl.MapMouseEvent & { lngLat: mapboxgl.LngLat }) => {
    if (!onLocationUpdate || !mapRef.current) return
    
    const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat]
    updateMarker(coordinates)

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${mapboxgl.accessToken}&types=address&country=PE&language=es`
      )
      
      if (!response.ok) throw new Error('Error en la respuesta de Mapbox')
      
      const data = await response.json()
      
      if (data.features?.[0]) {
        onLocationUpdate({
          id: data.features[0].id,
          place_name: data.features[0].place_name,
          center: coordinates,
          text: data.features[0].text,
          context: data.features[0].context
        })
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error)
    }
  }, [onLocationUpdate, updateMarker])

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current) return
    
    // Definir defaultCenter dentro de useEffect para evitar la advertencia
    const defaultCenter: [number, number] = [-77.0369, -12.0464]

    // Limpiar mapa existente si existe
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Limpiar marcador si existe
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: 12,
      attributionControl: true,
      preserveDrawingBuffer: true,
      antialias: true
    })

    map.addControl(new mapboxgl.NavigationControl())

    // Asegurarse de que el mapa esté completamente cargado antes de agregar eventos
    map.once('load', () => {
      mapRef.current = map
      updateMarker(defaultCenter)
    })

    // Agregar el evento click después de que el mapa esté listo
    map.on('click', handleMapClick)

    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
      }
      map.remove()
    }
  }, [handleMapClick, updateMarker])  // No es necesario agregar defaultCenter a las dependencias

  // Manejar cambios en la ubicación seleccionada
  useEffect(() => {
    if (!mapRef.current || !selectedLocation?.center) return

    updateMarker(selectedLocation.center)
    
    mapRef.current.flyTo({
      center: selectedLocation.center,
      zoom: 15,
      essential: true,
    
    })
  }, [selectedLocation, updateMarker])

  return (
    <div className="relative h-64 mb-6 overflow-hidden max-w-[430px] w-full rounded-lg border">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
