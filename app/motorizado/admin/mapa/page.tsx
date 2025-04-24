"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation, MapPin } from "lucide-react"
import { MotorizadoProvider, useMotorizado } from "../context/MotorizadoContext"
import Sidebar from "../components/sidebar"
import Header from "../components/header"

// Definir tipos para Google Maps API
interface GoogleMapTypes {
  maps: {
    Map: new (mapDiv: HTMLElement, options: GoogleMapOptions) => GoogleMap
    Marker: new (opts: GoogleMarkerOptions) => GoogleMarker
    InfoWindow: new (opts?: GoogleInfoWindowOptions) => GoogleInfoWindow
    LatLng: new (lat: number, lng: number) => GoogleLatLng
    LatLngBounds: new () => GoogleLatLngBounds
    Size: new (width: number, height: number, widthUnit?: string, heightUnit?: string) => GoogleSize
    SymbolPath?: {
      CIRCLE: number
      FORWARD_CLOSED_ARROW: number
      FORWARD_OPEN_ARROW: number
      BACKWARD_CLOSED_ARROW: number
      BACKWARD_OPEN_ARROW: number
    }
  }
}

interface GoogleMap {
  fitBounds(bounds: GoogleLatLngBounds): void
  setCenter(latLng: GoogleLatLng | GoogleLatLngLiteral): void
  setZoom(zoom: number): void
}

interface GoogleMarker {
  setMap(map: GoogleMap | null): void
  getPosition(): GoogleLatLng | null
  addListener(event: string, handler: () => void): { remove: () => void }
}

interface GoogleInfoWindow {
  open(map: GoogleMap, anchor?: GoogleMarker): void
  setContent(content: string | Node): void
  close(): void
}

interface GoogleLatLng {
  lat(): number
  lng(): number
}

interface GoogleLatLngBounds {
  extend(latLng: GoogleLatLng | GoogleLatLngLiteral): GoogleLatLngBounds
}

interface GoogleSize {
  width: number
  height: number
}

interface GoogleMapOptions {
  center: GoogleLatLng | GoogleLatLngLiteral
  zoom: number
  styles?: Array<GoogleMapTypeStyle>
}

interface GoogleMarkerOptions {
  position: GoogleLatLng | GoogleLatLngLiteral
  map?: GoogleMap
  title?: string
  icon?: string | GoogleIcon | GoogleSymbol
  label?: string | GoogleMarkerLabel
}

interface GoogleInfoWindowOptions {
  content?: string | Node
  position?: GoogleLatLng | GoogleLatLngLiteral
}

interface GoogleLatLngLiteral {
  lat: number
  lng: number
}

interface GoogleIcon {
  url: string
  scaledSize?: GoogleSize
}

interface GoogleSymbol {
  path: number
  scale: number
  fillColor?: string
  fillOpacity?: number
  strokeColor?: string
  strokeWeight?: number
}

interface GoogleMarkerLabel {
  text: string
  color?: string
  fontSize?: string
}

interface GoogleMapTypeStyle {
  featureType?: string
  elementType?: string
  stylers: Array<{ [key: string]: string }>
}

// Extender el objeto Window para incluir google
declare global {
  interface Window {
    google?: GoogleMapTypes
  }
}

function MapaContent() {
  const { pedidos, loading } = useMotorizado()
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<GoogleMap | null>(null)
  const [markers, setMarkers] = useState<GoogleMarker[]>([])
  const [userLocation, setUserLocation] = useState<GoogleLatLngLiteral | null>(null)

  // Cargar el script de Google Maps
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    }

    if (!window.google?.maps) {
      loadGoogleMapsScript()
    } else {
      setMapLoaded(true)
    }
  }, [])

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error)
          // Ubicación por defecto (centro de Perú)
          setUserLocation({ lat: -9.189967, lng: -75.015152 })
        },
      )
    }
  }, [])

  // Inicializar el mapa cuando se carga el script y tenemos la ubicación
  useEffect(() => {
    if (mapLoaded && userLocation && !map && window.google?.maps) {
      const mapElement = document.getElementById("map")
      if (mapElement) {
        const newMap = new window.google.maps.Map(mapElement, {
          center: userLocation,
          zoom: 13,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        })

        // Marcador para la ubicación del usuario
        if (window.google?.maps) {
          new window.google.maps.Marker({
            position: userLocation,
            map: newMap,
            icon: {
              path: window.google.maps.SymbolPath?.CIRCLE ?? 0,
              scale: 10,
              fillColor: "#4f46e5",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
            title: "Tu ubicación",
          })
        }

        setMap(newMap)
      }
    }
  }, [mapLoaded, userLocation, map])

  // Actualizar marcadores cuando cambian los pedidos
  useEffect(() => {
    if (map && pedidos.length > 0 && window.google?.maps) {
      // Limpiar marcadores anteriores
      markers.forEach((marker) => marker.setMap(null))
      const newMarkers: GoogleMarker[] = []

      // Crear marcadores para cada pedido
      pedidos.forEach((pedido) => {
        if (pedido.latitud && pedido.longitud && window.google?.maps) {
          const marker = new window.google.maps.Marker({
            position: { lat: pedido.latitud, lng: pedido.longitud },
            map,
            title: `Pedido #${pedido.id}`,
            label: {
              text: `${pedido.id}`,
              color: "white",
              fontSize: "12px",
            },
            icon: {
              url: getMarkerIcon(pedido.estado),
              scaledSize: window.google.maps ? new window.google.maps.Size(30, 30) : undefined,
            },
          })

          // Información del pedido al hacer clic
          if (window.google?.maps) {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
              <div style="padding: 10px; max-width: 200px;">
                <h3 style="margin: 0 0 5px; font-size: 16px;">Pedido #${pedido.id}</h3>
                <p style="margin: 0 0 5px;"><strong>Cliente:</strong> ${pedido.cliente}</p>
                <p style="margin: 0 0 5px;"><strong>Dirección:</strong> ${pedido.direccion_entrega}</p>
                <p style="margin: 0 0 5px;"><strong>Estado:</strong> ${pedido.estado}</p>
                <p style="margin: 0;"><strong>Restaurante:</strong> ${pedido.local}</p>
              </div>
            `,
            })

            marker.addListener("click", () => {
              infoWindow.open(map, marker)
            })
          }

          newMarkers.push(marker)

          // Agregar marcador para el restaurante
          if (pedido.lat_local && pedido.lon_local && window.google?.maps) {
            const restaurantMarker = new window.google.maps.Marker({
              position: { lat: pedido.lat_local, lng: pedido.lon_local },
              map,
              title: pedido.local,
              icon: {
                url: "/cozy-italian-corner.png",
                scaledSize: new window.google.maps.Size(30, 30),
              },
            })

            const restaurantInfoWindow = new window.google.maps.InfoWindow({
              content: `
              <div style="padding: 10px; max-width: 200px;">
                <h3 style="margin: 0 0 5px; font-size: 16px;">${pedido.local}</h3>
                <p style="margin: 0;">${pedido.direccion_local}</p>
              </div>
            `,
            })

            restaurantMarker.addListener("click", () => {
              restaurantInfoWindow.open(map, restaurantMarker)
            })

            newMarkers.push(restaurantMarker)
          }
        }
      })

      setMarkers(newMarkers)

      // Ajustar el mapa para mostrar todos los marcadores
      if (newMarkers.length > 0 && window.google?.maps) {
        const bounds = new window.google.maps.LatLngBounds()
        newMarkers.forEach((marker) => {
          const position = marker.getPosition()
          if (position) bounds.extend(position)
        })
        if (userLocation) bounds.extend(userLocation)
        map.fitBounds(bounds)
      }
    }
  }, [map, pedidos, userLocation, markers])

  // Función para obtener el icono según el estado del pedido
  const getMarkerIcon = (estado: string): string => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return "/yellow-highlighter-notes.png"
      case "en camino":
        return "/blue-scribbles.png"
      case "entregado":
        return "/vibrant-green-marker.png"
      default:
        return "/silver-scribbles.png"
    }
  }

  // Función para abrir Google Maps con la ruta
  const abrirRuta = (lat: number, lng: number) => {
    if (userLocation) {
      window.open(`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`, "_blank")
    }
  }

  if (!mapLoaded || !userLocation) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-center text-muted-foreground">Cargando mapa...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-center text-muted-foreground">Cargando pedidos...</p>
      </div>
    )
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <MapPin className="mb-2 h-10 w-10 text-muted-foreground" />
        <p className="text-center text-muted-foreground">No hay pedidos para mostrar en el mapa</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mapa de Entregas</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0">
              <div id="map" className="h-full w-full rounded-md"></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Activos</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <div className="space-y-3">
                {pedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Pedido #{pedido.id}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          pedido.estado?.toLowerCase() === "pendiente"
                            ? "bg-amber-100 text-amber-700"
                            : pedido.estado?.toLowerCase() === "en camino"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {pedido.estado}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{pedido.direccion_entrega}</p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => abrirRuta(pedido.latitud, pedido.longitud)}
                      >
                        <Navigation className="mr-1 h-4 w-4" /> Ver ruta
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function MapaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MotorizadoProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:translate-x-0 lg:static lg:inset-0`}
        >
          <Sidebar />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Main content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 dark:bg-gray-900">
            <MapaContent />
          </main>
        </div>
      </div>
    </MotorizadoProvider>
  )
}
