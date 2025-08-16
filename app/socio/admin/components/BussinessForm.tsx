// app\socio\admin\components\BussinessForm.tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { GoogleMapsLocation } from "../types/google-maps"

const formSchema = z.object({
  businessName: z.string().min(2, "El nombre es requerido"),
  street: z.string().min(2, "La calle es requerida"),
  number: z.string().min(1, "El número es requerido"),
  postalCode: z.string().min(5, "Código postal inválido"),
  province: z.string().min(2, "La provincia es requerida"),
  city: z.string().min(2, "La ciudad es requerida"),
  reference: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface BusinessFormProps {
  selectedLocation: GoogleMapsLocation | null
  onSubmit: (data: FormData) => void
  initialData?: FormData | null // Agregar prop para datos iniciales
}

const BusinessForm: React.FC<BusinessFormProps> = ({ selectedLocation, onSubmit, initialData }) => {
  const [isInitialized, setIsInitialized] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      street: "",
      number: "",
      postalCode: "",
      province: "",
      city: "",
      reference: "",
    },
  })

  const extractAddressComponent = (
    components: google.maps.GeocoderAddressComponent[] | undefined,
    type: string,
  ): string => {
    if (!components) return ""
    const component = components.find((comp) => comp.types.includes(type))
    return component ? component.long_name : ""
  }

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (initialData && !isInitialized) {
      console.log("🔄 Cargando datos iniciales:", initialData)
      form.reset(initialData)
      setIsInitialized(true)
      // Llamar onSubmit inmediatamente con los datos iniciales
      onSubmit(initialData)
    }
  }, [initialData, form, onSubmit, isInitialized])

  // Efecto para procesar nuevas ubicaciones seleccionadas
  useEffect(() => {
    if (selectedLocation && selectedLocation.address_components && isInitialized) {
      const addressComponents = selectedLocation.address_components

      const streetName = extractAddressComponent(addressComponents, "route")
      const streetNumber = extractAddressComponent(addressComponents, "street_number")
      const postalCode = extractAddressComponent(addressComponents, "postal_code")
      const city =
        extractAddressComponent(addressComponents, "locality") ||
        extractAddressComponent(addressComponents, "administrative_area_level_2")
      const province = extractAddressComponent(addressComponents, "administrative_area_level_1")

      // Solo actualizar campos que están vacíos o que vienen de Google Maps
      const currentValues = form.getValues()
      const newValues = {
        businessName: currentValues.businessName, // Mantener el nombre del negocio
        street: streetName || currentValues.street,
        number: streetNumber || currentValues.number,
        postalCode: postalCode || currentValues.postalCode,
        city: city || currentValues.city,
        province: province || currentValues.province,
        reference: currentValues.reference,
      }

      console.log("🗺️ Actualizando con datos de Google Maps:", newValues)
      form.reset(newValues)
      onSubmit(newValues as FormData)
    }
  }, [selectedLocation, form, onSubmit, isInitialized])

  const handleFieldChange = (name: keyof FormData, value: string) => {
    const newData = {
      ...form.getValues(),
      [name]: value,
    }

    form.setValue(name, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })

    if (form.formState.isValid) {
      onSubmit(newData as FormData)
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4 max-w-[430px] w-full mx-auto pb-20"
        onSubmit={(e) => {
          e.preventDefault()
          if (form.formState.isValid) {
            onSubmit(form.getValues())
          }
        }}
      >
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del negocio</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => handleFieldChange("businessName", e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calle</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => handleFieldChange("street", e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => handleFieldChange("number", e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => handleFieldChange("province", e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Postal</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencias de ubicación</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ej: Frente al parque principal"
                  onChange={(e) => handleFieldChange("reference", e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export default BusinessForm