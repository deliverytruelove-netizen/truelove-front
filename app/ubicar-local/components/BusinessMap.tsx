'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface MapComponentProps {
  selectedLocation: { center: [number, number] } | null;
  onLocationUpdate?: (location: MapboxFeature) => void;
}

export default function MapComponent({ selectedLocation, onLocationUpdate }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const defaultCenter = useMemo<[number, number]>(() => [-77.0369, -12.0464], []);

  const handleClick = useCallback((e: mapboxgl.MapMouseEvent & { lngLat: mapboxgl.LngLat }) => {
    const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    markerRef.current?.setLngLat(coordinates);
    mapRef.current?.flyTo({ center: coordinates, zoom: 15, essential: true });

    if (onLocationUpdate) {
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${mapboxgl.accessToken}&types=address&country=PE&language=es`
      )
        .then(response => {
          if (!response.ok) throw new Error('Error en la respuesta de Mapbox');
          return response.json();
        })
        .then(data => {
          if (data.features?.[0]) {
            onLocationUpdate({
              id: data.features[0].id,
              place_name: data.features[0].place_name,
              center: coordinates,
              text: data.features[0].text,
              context: data.features[0].context,
            });
          }
        })
        .catch(error => console.error('Error al obtener la dirección:', error));
    }
  }, [onLocationUpdate]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const cleanup = () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };

    cleanup();

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: selectedLocation?.center || defaultCenter,
      zoom: 13,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl());

    const marker = new mapboxgl.Marker({ color: '#FF0000', draggable: false })
      .setLngLat(selectedLocation?.center || defaultCenter)
      .addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    map.on('click', handleClick);

    map.on('load', () => {
      map.resize();
    });

    return cleanup;
  }, [selectedLocation, handleClick, defaultCenter]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !selectedLocation?.center) return;

    markerRef.current.setLngLat(selectedLocation.center);
    mapRef.current.flyTo({
      center: selectedLocation.center,
      zoom: 15,
      essential: true,
    });
  }, [selectedLocation]);

  return (
    <div className="relative h-64 mb-6 overflow-hidden max-w-[430px] w-full rounded-lg border">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}