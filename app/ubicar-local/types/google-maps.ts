// app\ubicar-local\types\google-maps.ts  Tipos para Google Maps y componentes relacionados
export interface GoogleMapsLocation {
    place_id?: string
    formatted_address: string
    center: [number, number] // [lng, lat]
    name?: string
    address_components?: google.maps.GeocoderAddressComponent[]
    businessName?: string
  }
  
  // Tipo para los datos del formulario de negocio
  export interface BusinessFormData {
    businessName: string
    street: string
    number: string
    postalCode: string
    province: string
    city: string
    reference?: string
  }
  
  // Tipo para los resultados de búsqueda de lugares
  export interface PlaceResult {
    place_id: string
    name: string
    formatted_address: string
    geometry: {
      location: {
        lat: () => number
        lng: () => number
      }
    }
  }
  
