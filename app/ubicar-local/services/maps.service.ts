// app\ubicar-local\services\maps.service.ts
import { Loader, Library } from "@googlemaps/js-api-loader";
import type { PlaceResult } from "../types/google-maps";
// Función para cargar una biblioteca específica

// Singleton para el loader de Google Maps
let loader: Loader | null = null;
let isLoaded = false;

// Coordenadas de Perú (aproximadas para el centro del país)
const PERU_BOUNDS = {
  north: -0.0395, // Latitud norte
  south: -18.3518, // Latitud sur
  east: -68.6519, // Longitud este
  west: -81.3581, // Longitud oeste
};

// Coordenadas de Lima (centro por defecto)
export const LIMA_COORDINATES = {
  lat: -12.0464,
  lng: -77.0428,
};

// Función para obtener el loader
export const getLoader = (): Loader => {
  if (!loader) {
    loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY || "",
      version: "quarterly", // Usar la versión trimestral para obtener las últimas características
      libraries: ["places", "geocoding", "marker"],
    });
  }
  return loader;
};

// Función para cargar Google Maps usando importLibrary
export const loadGoogleMaps = async (): Promise<void> => {
  if (isLoaded) return;

  try {
    const loader = getLoader();
    await loader.load();
    isLoaded = true;
  } catch (error) {
    console.error("Error al cargar Google Maps:", error);
    throw error;
  }
};

export const loadLibrary = async <T>(libraryName: Library): Promise<T> => {
  if (!isLoaded) {
    await loadGoogleMaps();
  }

  const loader = getLoader();
  return loader.importLibrary(libraryName) as Promise<T>;
};

// Función para verificar si Google Maps está cargado
export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded;
};

// Función para buscar lugares (direcciones y negocios)
export const searchPlaces = async (
  query: string
  //   searchType: "address" | "business" = "business",
): Promise<PlaceResult[]> => {
  await loadGoogleMaps();

  try {
    // Cargar la biblioteca de places
    const placesLib = await loadLibrary<google.maps.PlacesLibrary>("places");

    // Verificar si la nueva API está disponible
    if (typeof placesLib.Place?.searchByText !== "function") {
      // Fallback a la API tradicional
      return new Promise((resolve) => {
        const mapDiv = document.createElement("div");
        const mapsLib = window.google.maps;
        const map = new mapsLib.Map(mapDiv);
        const service = new mapsLib.places.PlacesService(map);

        service.textSearch(
          {
            query,
            region: "pe",
          },
          (results, status) => {
            if (status === mapsLib.places.PlacesServiceStatus.OK && results) {
              resolve(results as PlaceResult[]);
            } else {
              resolve([]);
            }
          }
        );
      });
    }

    // Configurar la solicitud para la nueva API Place
    const request: google.maps.places.SearchByTextRequest = {
      textQuery: query,
      fields: ["id", "displayName", "formattedAddress", "location"],
      locationBias: {
        // Usar LatLngBoundsLiteral en lugar de rectangle
        south: PERU_BOUNDS.south,
        west: PERU_BOUNDS.west,
        north: PERU_BOUNDS.north,
        east: PERU_BOUNDS.east,
      },
    };

    // Usar la nueva API Place.searchByText
    const { places } = await placesLib.Place.searchByText(request);

    // Convertir el resultado al formato esperado
    return places.map(
      (place): PlaceResult => ({
        place_id: place.id,
        name: place.displayName || "",
        formatted_address: place.formattedAddress || "",
        geometry: {
          location: {
            lat: () => place.location?.lat() || 0,
            lng: () => place.location?.lng() || 0,
          },
        },
      })
    );
  } catch (error) {
    console.error("Error al buscar lugares:", error);
    return [];
  }
};

export const getAutocompleteSuggestions = async (
    query: string,
  ): Promise<google.maps.places.AutocompletePrediction[]> => {
    await loadGoogleMaps();
  
    try {
      // Cargar la biblioteca de places
      const placesLib = await loadLibrary<google.maps.PlacesLibrary>("places");
      
      // Intentar usar la API moderna primero
      if (placesLib.AutocompleteService) {
        try {
          const autocompleteService = new placesLib.AutocompleteService();
          const response = await autocompleteService.getPlacePredictions({
            input: query,
            componentRestrictions: { country: "pe" },
            types: ["geocode", "establishment"],
          });
          return response.predictions;
        } catch (error) {
          console.error("Error con la API moderna, usando fallback:", error);
        }
      }
  
      // Fallback a la API tradicional
      return new Promise((resolve) => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: "pe" },
            types: ["geocode", "establishment"],
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              resolve(predictions);
            } else {
              resolve([]);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error al obtener sugerencias:", error);
      return []; // Siempre devolvemos un array vacío en caso de error
    }
  };
  
interface PlaceStatic {
  fetchById(request: {
    id: string;
    fields: string[];
  }): Promise<google.maps.places.Place | null>;
}
// Función para obtener detalles de un lugar por su ID
export const getPlaceDetails = async (
  placeId: string
): Promise<PlaceResult | null> => {
  await loadGoogleMaps();

  try {
    // Cargar la biblioteca de places
    const placesLib = await loadLibrary<google.maps.PlacesLibrary>("places");

    const request = {
      id: placeId,
      fields: [
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "addressComponents",
      ],
    };

    const placeAPI = placesLib.Place as unknown as PlaceStatic;
    const place = await placeAPI.fetchById(request);

    if (!place) return null;

    // Convertir al formato esperado por el componente existente
    return {
      place_id: place.id,
      name: place.displayName || "",
      formatted_address: place.formattedAddress || "",
      geometry: {
        location: {
          lat: () => place.location?.lat() || 0,
          lng: () => place.location?.lng() || 0,
        },
      },
    };
  } catch (error) {
    console.error("Error al obtener detalles del lugar:", error);
    return null;
  }
};
