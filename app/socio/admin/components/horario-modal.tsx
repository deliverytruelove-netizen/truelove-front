"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface HorarioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGuardar: (horario: HorarioFormData) => Promise<void>
}

interface HorarioFormData {
  nombre: string
  lunes: boolean
  martes: boolean
  miercoles: boolean
  jueves: boolean
  viernes: boolean
  sabado: boolean
  domingo: boolean
  hora_apertura: string
  hora_cierre: string
  activo: boolean
}

const diasSemana = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
]

export function HorarioModal({ open, onOpenChange, onGuardar }: HorarioModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<HorarioFormData>({
    nombre: "",
    lunes: false,
    martes: false,
    miercoles: false,
    jueves: false,
    viernes: false,
    sabado: false,
    domingo: false,
    hora_apertura: "",
    hora_cierre: "",
    activo: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onGuardar(formData)
      onOpenChange(false)
      setFormData({
        nombre: "",
        lunes: false,
        martes: false,
        miercoles: false,
        jueves: false,
        viernes: false,
        sabado: false,
        domingo: false,
        hora_apertura: "",
        hora_cierre: "",
        activo: true,
      })
    } catch (error) {
      console.error("Error al guardar horario:", error)
    } finally {
      setLoading(false)
    }
  }

  const seleccionarTodosLosDias = () => {
    setFormData((prev) => ({
      ...prev,
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: true,
      domingo: true,
    }))
  }

  const deseleccionarTodosLosDias = () => {
    setFormData((prev) => ({
      ...prev,
      lunes: false,
      martes: false,
      miercoles: false,
      jueves: false,
      viernes: false,
      sabado: false,
      domingo: false,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Agregar Nuevo Horario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-base font-medium">
                Nombre del Horario
              </Label>
              <Input
                id="nombre"
                placeholder="Ej: Horario Regular"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="h-11"
                required
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Días de Atención</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={seleccionarTodosLosDias}
                    className="text-xs"
                  >
                    Seleccionar Todos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deseleccionarTodosLosDias}
                    className="text-xs"
                  >
                    Deseleccionar Todos
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/5 p-4">
                {diasSemana.map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-3">
                    <Checkbox
                      id={key}
                      checked={formData[key as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })}
                      className="h-5 w-5 rounded-md border-primary/20"
                    />
                    <Label htmlFor={key} className="text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hora_apertura" className="text-base font-medium">
                  Hora de Apertura
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="hora_apertura"
                    type="time"
                    value={formData.hora_apertura}
                    onChange={(e) => setFormData({ ...formData, hora_apertura: e.target.value })}
                    className="h-11 pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora_cierre" className="text-base font-medium">
                  Hora de Cierre
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="hora_cierre"
                    type="time"
                    value={formData.hora_cierre}
                    onChange={(e) => setFormData({ ...formData, hora_cierre: e.target.value })}
                    className="h-11 pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-w-[100px]">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={cn("min-w-[100px] bg-gradient-to-r from-primary to-primary/90", loading && "animate-pulse")}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

