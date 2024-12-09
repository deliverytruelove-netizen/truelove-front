'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Calendar } from "@/components/ui/calendar"
import { Clock } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

const esquemaFormulario = z.object({
  fecha: z.date({
    required_error: "Por favor selecciona una fecha para la entrega.",
  }),
  hora: z.string({
    required_error: "Por favor selecciona una hora para la entrega.",
  }),
})

const horariosDisponibles = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
]

export function FormularioEntrega() {
  const [enviando, setEnviando] = useState(false)
  const { toast } = useToast()

  const formulario = useForm<z.infer<typeof esquemaFormulario>>({
    resolver: zodResolver(esquemaFormulario),
  })

  async function alEnviar(valores: z.infer<typeof esquemaFormulario>) {
    setEnviando(true)
    try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/agendar-entrega`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: format(valores.fecha, 'yyyy-MM-dd'),
          hora: valores.hora,
        }),
      })

      if (!respuesta.ok) {
        throw new Error('Error al agendar la cita')
      }

      toast({
        title: "Cita agendada",
        description: `Tu cita ha sido agendada para el ${format(valores.fecha, 'PPP', { locale: es })} a las ${valores.hora} horas.`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al agendar la cita. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Form {...formulario}>
      <form onSubmit={formulario.handleSubmit(alEnviar)} className="space-y-8">
        <FormField
          control={formulario.control}
          name="fecha"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de entrega</FormLabel>
              <Card>
                <CardContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const hoy = new Date()
                      hoy.setHours(0, 0, 0, 0)
                      return date < hoy || date.getDay() === 0 || date.getDay() === 6
                    }}
                    locale={es}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              <FormDescription>
                Selecciona una fecha para la entrega del material (Lunes a Viernes)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={formulario.control}
          name="hora"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora de entrega</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {horariosDisponibles.map((hora) => (
                    <SelectItem key={hora} value={hora}>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {hora} hrs
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Elige el horario que mejor se ajuste a tu disponibilidad
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-[#f34739] hover:bg-[#d63c30] text-white"
          disabled={enviando}
        >
          {enviando ? 'Agendando...' : 'Agendar entrega'}
        </Button>
      </form>
    </Form>
  )
}

