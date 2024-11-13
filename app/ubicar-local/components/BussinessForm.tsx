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
  selectedLocation: any
  onSubmit: (data: FormData) => void
}

export default function BusinessForm({ selectedLocation, onSubmit }: BusinessFormProps) {
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

  useEffect(() => {
    if (selectedLocation) {
      const context = selectedLocation.context || []
      const address = selectedLocation.address || ''
      const streetName = selectedLocation.text || ''
      const postalCode = context.find((item: any) => item.id.startsWith('postcode'))?.text || ''
      const city = context.find((item: any) => item.id.startsWith('place'))?.text || ''
      const province = context.find((item: any) => item.id.startsWith('region'))?.text || ''

      form.reset({
        businessName: form.getValues('businessName'),
        street: streetName,
        number: address,
        postalCode,
        city,
        province,
        reference: form.getValues('reference'),
      })
    }
  }, [selectedLocation, form])

  const handleSubmit = (data: FormData) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        onChange={() => {
          const values = form.getValues()
          if (form.formState.isValid) {
            onSubmit(values)
          }
        }}
        className="space-y-4 max-w-[430px] w-full mx-auto"
      >
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del negocio</FormLabel>
              <FormControl>
                <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                <Input {...field} />
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
                <Input {...field} placeholder="Ej: Frente al parque principal" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
{/* 
        <Button type="submit" className="w-full bg-[#f34739] text-white hover:bg-[#d63c30]">
          Guardar ubicación
        </Button> */}
      </form>
    </Form>
  )
}