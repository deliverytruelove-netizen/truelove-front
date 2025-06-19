// app\socio\admin\types\google-maps.ts
export interface GoogleMapsLocation {
  place_id?: string
  formatted_address: string
  center: [number, number] // [lng, lat]
  name?: string
  address_components?: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  businessName?: string
}

export interface BusinessFormData {
  businessName: string
  street: string
  number: string
  postalCode: string
  province: string
  city: string
  reference?: string
}

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

export interface PlaceDetailsResponse {
  place: {
    location?: {
      latitude: number
      longitude: number
    }
    displayName?: {
      text: string
    }
    formattedAddress?: string
    addressComponents?: Array<{
      longText: string
      shortText: string
      types: string[]
    }>
  }
}

export interface AddressComponent {
  longText: string
  shortText: string
  types: string[]
}