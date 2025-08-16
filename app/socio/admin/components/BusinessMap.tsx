// app\socio\admin\components\BusinessMap.tsx
"use client"

import type React from "react"
import { useEffect, useRef, useCallback, useState, useMemo } from "react"
import { loadLibrary, LIMA_COORDINATES } from "../services/maps.service"
import type { GoogleMapsLocation } from "../types/google-maps"

interface MapComponentProps {
  selectedLocation: GoogleMapsLocation | null
  onLocationUpdate?: (location: GoogleMapsLocation) => void
}

const MapComponent: React.FC<MapComponentProps> = ({ selectedLocation, onLocationUpdate }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const isInitializedRef = useRef(false)
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null)

  const defaultCenter = useMemo(() => LIMA_COORDINATES, [])

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const geocodingLib = await loadLibrary<google.maps.GeocodingLibrary>("geocoding")
        geocoderRef.current = new geocodingLib.Geocoder()
        setIsLoaded(true)
      } catch (error) {
        console.error("Error al inicializar el geocodificador:", error)
        setMapError("Error al cargar Google Maps")
      }
    }

    initializeMap()
  }, [])

  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng || !geocoderRef.current || !onLocationUpdate) return

      const position = event.latLng
      const lat = position.lat()
      const lng = position.lng()

      if (lat < -18.5 || lat > 0 || lng < -81.5 || lng > -68.5) {
        console.warn("Click fuera de Perú, ignorando")
        return
      }

      const coordinates: [number, number] = [lng, lat]

      if (markerRef.current) {
        markerRef.current.position = position
      }

      try {
        const response = await geocoderRef.current.geocode({ location: position })

        if (response.results && response.results[0]) {
          const result = response.results[0]

          const locationData: GoogleMapsLocation = {
            place_id: result.place_id,
            formatted_address: result.formatted_address,
            center: coordinates,
            name: result.address_components?.[0]?.long_name || "",
            address_components: result.address_components?.map((comp) => ({
              long_name: comp.long_name,
              short_name: comp.short_name,
              types: comp.types,
            })),
          }

          onLocationUpdate(locationData)
        }
      } catch (error) {
        console.error("Error en geocodificación inversa:", error)
      }
    },
    [onLocationUpdate],
  )

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || isInitializedRef.current) return

    const initMap = async () => {
      try {
        const mapsLib = await loadLibrary<google.maps.MapsLibrary>("maps")
        const markerLib = await loadLibrary<google.maps.MarkerLibrary>("marker")

        let initialCenter = defaultCenter
        if (selectedLocation?.center && Array.isArray(selectedLocation.center)) {
          const [lng, lat] = selectedLocation.center
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            if (lat >= -18.5 && lat <= 0 && lng >= -81.5 && lng <= -68.5) {
              initialCenter = { lat, lng }
            }
          }
        }

        const mapOptions: google.maps.MapOptions = {
          center: initialCenter,
          zoom: selectedLocation?.center ? 15 : 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          mapId: "map",
          gestureHandling: "greedy",
          restriction: {
            latLngBounds: {
              north: 0,
              south: -18.5,
              west: -81.5,
              east: -68.5,
            },
            strictBounds: false,
          },
        }

        const map = new mapsLib.Map(mapContainerRef.current!, mapOptions)
        mapRef.current = map

        const marker = new markerLib.AdvancedMarkerElement({
          position: initialCenter,
          map,
          gmpDraggable: false,
        })
        markerRef.current = marker

        clickListenerRef.current = map.addListener("click", handleMapClick)

        isInitializedRef.current = true
        console.log("🗺️ Mapa inicializado correctamente en:", initialCenter)
      } catch (error) {
        console.error("Error al inicializar el mapa:", error)
        setMapError("Error al crear el mapa")
      }
    }

    initMap()

    return () => {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current)
        clickListenerRef.current = null
      }
    }
  }, [isLoaded, defaultCenter, handleMapClick, selectedLocation?.center])

  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return

    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current)
    }

    clickListenerRef.current = mapRef.current.addListener("click", handleMapClick)

    return () => {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current)
      }
    }
  }, [handleMapClick])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !selectedLocation?.center || !isInitializedRef.current) return

    if (Array.isArray(selectedLocation.center) && selectedLocation.center.length === 2) {
      const [lng, lat] = selectedLocation.center

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        if (lat >= -18.5 && lat <= 0 && lng >= -81.5 && lng <= -68.5) {
          const position = { lat, lng }

          markerRef.current.position = position
          mapRef.current.panTo(position)
          mapRef.current.setZoom(15)
        } else {
          console.warn("❌ Coordenadas fuera de Perú:", { lat, lng })
        }
      } else {
        console.warn("❌ Coordenadas inválidas:", { lat, lng })
      }
    } else {
      console.warn("❌ center no es un array válido:", selectedLocation.center)
    }
  }, [selectedLocation?.place_id, selectedLocation?.center])

  if (mapError) {
    return (
      <div className="relative h-64 mb-6 overflow-hidden rounded-lg border bg-red-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-red-600 font-medium mb-2">{mapError}</p>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-64 mb-6 overflow-hidden rounded-lg border">
      <div ref={mapContainerRef} className="w-full h-full">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {selectedLocation && isLoaded && (
        <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-95 rounded-md p-2 text-xs shadow-md">
          <p className="font-medium truncate">{selectedLocation.name || "Sin nombre"}</p>
          <p className="text-gray-600 truncate">{selectedLocation.formatted_address}</p>
        </div>
      )}
    </div>
  )
}

export default MapComponent