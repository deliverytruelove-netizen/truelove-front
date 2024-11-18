'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { Building2, Phone, Store, ChevronRight, CheckCircle2 } from 'lucide-react'
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

const formSchema = z.object({
  businessName: z.string().min(2, "El nombre es requerido"),
  businessType: z.string().min(2, "El tipo de negocio es requerido"),
  category: z.string().min(2, "La categoría es requerida"),
  branches: z.coerce.number().min(1, "Número de sucursales requerido"),
  isStreetLocation: z.enum(['Si', 'No']),
  contactMethod: z.string().min(2, "El método de contacto es requerido"),
  phoneNumber: z.string().regex(/^\+51\d{9}$/, "Número de teléfono inválido"),
})

const steps = [
  { id: 1, name: 'Información básica', completed: true },
  { id: 2, name: 'Detalles del negocio', completed: false },
  { id: 3, name: 'Ubicación', completed: false },
  { id: 4, name: 'Horarios', completed: false },
  { id: 5, name: 'Galería', completed: false },
  { id: 6, name: 'Confirmación', completed: false },
]

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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white">
        <Navbar />
      </div>

      <div className="mx-auto max-w-5xl p-8 pt-20 pb-24 grid md:grid-cols-2 gap-12">
        <div className="hidden md:block">
          <div className="sticky top-8 space-y-6">
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

        <div className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-4">
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
                          <SelectItem value="restaurant">Restaurante</SelectItem>
                          <SelectItem value="market">Mercado</SelectItem>
                          <SelectItem value="cafe">Café</SelectItem>
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
        <BottomNavigation 
          steps={steps} 
          currentStep={2} 
          onSubmit={form.handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
        />
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

function BottomNavigation({ steps, currentStep, onSubmit, isSubmitting }: {
  steps: Array<{ id: number; name: string; completed: boolean }>;
  currentStep: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
      <div className="mx-auto max-w-5xl p-4">
        <div className="flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4 overflow-x-auto py-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.completed 
                      ? 'border-[#f34739] bg-[#f34739] text-white' 
                      : step.id === currentStep 
                        ? 'border-[#f34739] text-[#f34739]' 
                        : 'border-gray-300 text-gray-300'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${
                    step.id === currentStep ? 'text-[#f34739] font-medium' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step.completed ? 'bg-[#f34739]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            <span className="text-sm font-medium text-[#f34739]">Paso {currentStep} de {steps.length}</span>
            <span className="text-sm text-gray-500">{steps[currentStep - 1].name}</span>
          </div>

          <Button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-[#f34739] text-white hover:bg-[#d63c30] min-w-[120px]"
          >
            {isSubmitting ? 'Enviando...' : (
              <>
                Continuar
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}