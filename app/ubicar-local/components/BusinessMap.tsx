// app\ubicar-local\components\BusinessMap.tsx
"use client"

import type React from "react"

import { useEffect, useRef, useCallback, useState, useMemo } from "react"
import { loadLibrary, LIMA_COORDINATES } from "../services/maps.service"
import type { GoogleMapsLocation } from "../types/google-maps"

interface MapComponentProps {
  selectedLocation: { center: [number, number] } | null
  onLocationUpdate?: (location: GoogleMapsLocation) => void
}

const MapComponent: React.FC<MapComponentProps> = ({ selectedLocation, onLocationUpdate }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const defaultCenter = useMemo(() => LIMA_COORDINATES, []) // Lima, Perú

  // Cargar Google Maps API
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Cargar la biblioteca de geocodificación
        const geocodingLib = await loadLibrary<google.maps.GeocodingLibrary>("geocoding")
        geocoderRef.current = new geocodingLib.Geocoder()
        setIsLoaded(true)
      } catch (error) {
        console.error("Error al inicializar el geocodificador:", error)
      }
    }

    initializeMap()
  }, [])

  // Manejar clic en el mapa
  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng || !geocoderRef.current || !onLocationUpdate) return

      const position = event.latLng
      const coordinates: [number, number] = [position.lng(), position.lat()]

      if (markerRef.current) {
        markerRef.current.position = position
      }

      // Obtener la dirección a partir de las coordenadas
      try {
        const response = await geocoderRef.current.geocode({ location: position })
        
        if (response.results && response.results[0]) {
          const result = response.results[0]

          const locationData: GoogleMapsLocation = {
            place_id: result.place_id,
            formatted_address: result.formatted_address,
            center: coordinates,
            name: result.address_components?.[0]?.long_name || "",
            address_components: result.address_components,
          }

          onLocationUpdate(locationData)
        }
      } catch (error) {
        console.error("Error en geocodificación inversa:", error)
      }
    },
    [onLocationUpdate],
  )

  // Inicializar el mapa cuando la API está cargada
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return

    const initMap = async () => {
      try {
        // Cargar las bibliotecas necesarias
        const mapsLib = await loadLibrary<google.maps.MapsLibrary>("maps")
        const markerLib = await loadLibrary<google.maps.MarkerLibrary>("marker")
        
        // Configuración inicial del mapa
        const initialCenter = selectedLocation?.center
          ? { lat: selectedLocation.center[1], lng: selectedLocation.center[0] }
          : defaultCenter

        const mapOptions: google.maps.MapOptions = {
          center: initialCenter,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          mapId :"map",
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }

        // Crear el mapa
        if (!mapContainerRef.current) {
          throw new Error("mapContainerRef is null");
        }
        const map = new mapsLib.Map(mapContainerRef.current, mapOptions)
        mapRef.current = map

        // Crear el marcador avanzado
        const marker = new markerLib.AdvancedMarkerElement({
          position: initialCenter,
          map,
          gmpDraggable: false,
        })
        markerRef.current = marker

        // Agregar listener de clic
        map.addListener("click", handleMapClick)
      } catch (error) {
        console.error("Error al inicializar el mapa:", error)
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        window.google.maps.event.clearListeners(mapRef.current, "click")
      }
    }
  }, [isLoaded, selectedLocation, defaultCenter, handleMapClick])

  // Actualizar el mapa cuando cambia la ubicación seleccionada
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !selectedLocation?.center) return

    const position = {
      lat: selectedLocation.center[1],
      lng: selectedLocation.center[0],
    }

    markerRef.current.position = position
    mapRef.current.panTo(position)
    mapRef.current.setZoom(15)
  }, [selectedLocation])

  return (
    <div className="relative h-64 mb-6 overflow-hidden max-w-[430px] w-full rounded-lg border">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Cargando mapa...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapComponent