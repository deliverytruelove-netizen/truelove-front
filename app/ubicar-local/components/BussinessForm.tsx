// app\ubicar-local\components\BussinessForm.tsx
'use client'

import { useEffect, useState } from 'react'
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

interface LocationContext {
  id: string
  text: string
}

interface SelectedLocation {
  address?: string
  text?: string
  context?: LocationContext[]
  businessName?: string
}

interface BusinessFormProps {
  selectedLocation: SelectedLocation | null
  onSubmit: (data: FormData) => void
}

export default function BusinessForm({ selectedLocation, onSubmit }: BusinessFormProps) {
  const [formData, setFormData] = useState<Partial<FormData>>({})
  
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
      const businessName = selectedLocation.businessName || ''  // Modificar esta línea
  
      const newValues = {
        businessName: businessName || form.getValues('businessName') || '',
        street: streetName || form.getValues('street') || '',
        number: address || form.getValues('number') || '',
        postalCode: postalCode || form.getValues('postalCode') || '',
        city: city || form.getValues('city') || '',
        province: province || form.getValues('province') || '',
        reference: form.getValues('reference') || '',
      }
  
      setFormData(newValues)
      form.reset(newValues)
    }
  }, [selectedLocation, form])

  const handleFieldChange = (name: keyof FormData, value: string) => {
    const newData = {
      ...form.getValues(),
      [name]: value
    }
    setFormData(newData)
    form.setValue(name, value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })

    if (form.formState.isValid) {
      onSubmit(newData as FormData)
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4 max-w-[430px] w-full mx-auto"
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
                  value={formData.businessName || ''}
                  onChange={(e) => handleFieldChange('businessName', e.target.value)}
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
                    value={formData.street || ''}
                    onChange={(e) => handleFieldChange('street', e.target.value)}
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
                    value={formData.number || ''} 
                    onChange={(e) => handleFieldChange('number', e.target.value)}
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
                    value={formData.province || ''}
                    onChange={(e) => handleFieldChange('province', e.target.value)}
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
                    value={formData.city || ''}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
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
                  value={formData.postalCode || ''}
                  onChange={(e) => handleFieldChange('postalCode', e.target.value)}
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
                  value={formData.reference || ''}
                  placeholder="Ej: Frente al parque principal"
                  onChange={(e) => handleFieldChange('reference', e.target.value)}
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
