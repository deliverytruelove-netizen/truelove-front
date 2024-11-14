'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { Building2, Phone, Store } from 'lucide-react'
import Navbar from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'
import Negocio from '@/public/img/negocio.jpg'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'

const formSchema = z.object({
  businessName: z.string().min(2, "El nombre es requerido"),
  businessType: z.string().min(2, "El tipo de negocio es requerido"),
  category: z.string().min(2, "La categoría es requerida"),
  branches: z.coerce.number().min(1, "Número de sucursales requerido"),
  isStreetLocation: z.enum(['Si', 'No']),
  contactMethod: z.string().min(2, "El método de contacto es requerido"),
  phoneNumber: z.string().regex(/^\+51\d{9}$/, "Número de teléfono inválido"),
})

export default function BusinessDetailsForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      category: "",
      branches: 1,
      isStreetLocation: "Si",
      contactMethod: "WhatsApp",
      phoneNumber: "+51",
    },
  })

  useEffect(() => {
    const preventNavigation = (event: PopStateEvent) => {
      event.preventDefault()
      window.history.pushState(null, '', window.location.href)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', preventNavigation)

    return () => {
      window.removeEventListener('popstate', preventNavigation)
    }
  }, [])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      console.log(data);
      // Here you would typically send the data to your backend
      // await sendDataToBackend(data);
      router.push('/ubicar-local')
    } catch (error) {
      console.error('Error:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (2 / 6) * 100

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="mx-auto max-w-5xl p-8 grid md:grid-cols-2 gap-12">
        <div className="hidden md:block">
          <div className="sticky top-8 space-y-6 mt-40">
            <Image
              src={Negocio}
              alt="Business Illustration"
              width={400}
              height={400}
              className="rounded-lg object-cover"
            />
            <div className="space-y-4">
              <FeatureItem icon={Store} text="Configura tu negocio en minutos" />
              <FeatureItem icon={Building2} text="Gestiona múltiples sucursales" />
              <FeatureItem icon={Phone} text="Conecta con tus clientes fácilmente" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Cuéntanos acerca de tu negocio</h1>
            <p className="text-muted-foreground">
              Esta información se mostrará en la aplicación para que los clientes puedan buscarte y contactarte en caso de que tengan alguna pregunta.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del local *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de negocio *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de negocio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="restaurant">Restaurante </SelectItem>
                        <SelectItem value="market">Mercado</SelectItem>
                        <SelectItem value="pharmacy">Café</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="peruvian">Comida Peruana</SelectItem>
                        <SelectItem value="fast-food">Comida Rápida</SelectItem>
                        <SelectItem value="drinks">Bebidas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sucursales *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isStreetLocation"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>¿Es un local a la calle? *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Si" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Si
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="No" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            No
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de contacto preferido *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el método de contacto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Llamada">Llamada</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono del local *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+51123456789" />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      El formato del teléfono debe comenzar con +51 seguido de 9 dígitos
                    </p>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {8 - 2} pasos para terminar
            </span>
            <Progress value={progress} className="w-[200px]" />
          </div>

          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-[#f34739] text-white hover:bg-[#d63c30]"
          >
            {isSubmitting ? 'Enviando...' : 'Continuar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-[#f34739]" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}