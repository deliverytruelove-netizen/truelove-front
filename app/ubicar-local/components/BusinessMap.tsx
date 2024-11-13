'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

export default function MapComponent({ selectedLocation }: { selectedLocation: { center: [number, number] } | null }) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  const defaultCenter: [number, number] = [-77.0369, -12.0464] // Coordenadas de Lima, Perú

  useEffect(() => {
    if (!map && mapContainerRef.current) {
      const initializedMap = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: selectedLocation?.center || defaultCenter,
        zoom: 12,
        attributionControl: true
      })

      initializedMap.addControl(new mapboxgl.NavigationControl())

      initializedMap.on('load', () => {
        setMap(initializedMap)
        updateMarker(initializedMap, selectedLocation?.center || defaultCenter) // Mostrar marcador al cargar
      })
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
      }
      if (map) {
        map.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (map && selectedLocation?.center) {
      updateMarker(map, selectedLocation.center)
      map.flyTo({
        center: selectedLocation.center,
        zoom: 15,
        essential: true,
      })
    }
  }, [selectedLocation, map])

  const updateMarker = (mapInstance: mapboxgl.Map, coordinates: [number, number]) => {
    if (markerRef.current) {
      markerRef.current.setLngLat(coordinates)
    } else {
      markerRef.current = new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat(coordinates)
        .addTo(mapInstance)
    }
  }

  return (
    <div className="relative h-64 mb-6 overflow-hidden max-w-[430px] w-full rounded-lg border">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
