'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Define el esquema del formulario usando Zod
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

// Define un tipo específico para selectedLocation
interface LocationContext {
  id: string
  text: string
}

interface SelectedLocation {
  address?: string
  text?: string
  context?: LocationContext[]
}

interface BusinessFormProps {
  selectedLocation: SelectedLocation | null
  onSubmit: (data: FormData) => void
}

export default function BusinessForm({ selectedLocation, onSubmit }: BusinessFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      street: '',
      number: '',
      postalCode: '',
      province: '',
      city: '',
      reference: '',
    },
  })

  useEffect(() => {
    if (selectedLocation) {
      const context = selectedLocation.context || []
      const address = selectedLocation.address || ''
      const streetName = selectedLocation.text || ''
      const postalCode = context.find((item) => item.id.startsWith('postcode'))?.text || ''
      const city = context.find((item) => item.id.startsWith('place'))?.text || ''
      const province = context.find((item) => item.id.startsWith('region'))?.text || ''

      const currentValues = form.getValues()
      form.reset({
        businessName: currentValues.businessName || '',
        street: streetName || currentValues.street || '',
        number: address || currentValues.number || '',
        postalCode: postalCode || currentValues.postalCode || '',
        city: city || currentValues.city || '',
        province: province || currentValues.province || '',
        reference: currentValues.reference || '',
      }, { keepDefaultValues: true })
    }
  }, [selectedLocation, form])

  const handleSubmit = (data: FormData) => {
    onSubmit(data)
  }

  const handleFieldChange = (name: keyof FormData, value: string) => {
    form.setValue(name, value, { shouldValidate: true })
    if (form.formState.isValid) {
      onSubmit(form.getValues())
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 max-w-[430px] w-full mx-auto"
      >
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del negocio</FormLabel>
              <FormControl>
                <Input {...field} onChange={(e) => handleFieldChange('businessName', e.target.value)} />
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
                  <Input {...field} onChange={(e) => handleFieldChange('street', e.target.value)} />
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
                  <Input {...field} onChange={(e) => handleFieldChange('number', e.target.value)} />
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
                  <Input {...field} onChange={(e) => handleFieldChange('province', e.target.value)} />
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
                  <Input {...field} onChange={(e) => handleFieldChange('city', e.target.value)} />
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
                <Input {...field} onChange={(e) => handleFieldChange('postalCode', e.target.value)} />
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
                <Input {...field} placeholder="Ej: Frente al parque principal" onChange={(e) => handleFieldChange('reference', e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
