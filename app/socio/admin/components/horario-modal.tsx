// app\socio\admin\components\horario-modal.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Calendar, CheckCircle2 } from "lucide-react"
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

  const seleccionarDiasLaborables = () => {
    setFormData((prev) => ({
      ...prev,
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: false,
      domingo: false,
    }))
  }

  const seleccionarFinDeSemana = () => {
    setFormData((prev) => ({
      ...prev,
      lunes: false,
      martes: false,
      miercoles: false,
      jueves: false,
      viernes: false,
      sabado: true,
      domingo: true,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white rounded-xl border-0 shadow-xl">
        <div className="bg-gradient-to-r from-brand-100 to-white p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-brand-600 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Agregar Nuevo Horario
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Define los días y horas en que tu negocio estará disponible para recibir pedidos.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="nombre" className="text-base font-medium text-gray-700">
                Nombre del Horario
              </Label>
              <Input
                id="nombre"
                placeholder="Ej: Horario Regular, Fin de Semana, etc."
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="h-11 border-gray-200 focus:border-brand-300 focus:ring-brand-200"
                required
              />
            </div>

            <Separator className="my-5 bg-gray-100" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-500" />
                  Días de Atención
                </Label>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={seleccionarDiasLaborables}
                    className="text-xs h-8 border-gray-200 hover:border-brand-300 hover:bg-brand-50"
                  >
                    Lun-Vie
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={seleccionarFinDeSemana}
                    className="text-xs h-8 border-gray-200 hover:border-brand-300 hover:bg-brand-50"
                  >
                    Fin de Semana
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={seleccionarTodosLosDias}
                    className="text-xs h-8 border-gray-200 hover:border-brand-300 hover:bg-brand-50"
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deseleccionarTodosLosDias}
                    className="text-xs h-8 border-gray-200 hover:border-brand-300 hover:bg-brand-50"
                  >
                    Ninguno
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border bg-gray-50/50 p-4">
                {diasSemana.map(({ key, label }) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-3 transition-all",
                      (formData[key as keyof typeof formData] as boolean)
                        ? "border-brand-200 bg-brand-50"
                        : "border-gray-200 bg-white",
                    )}
                  >
                    <Checkbox
                      id={key}
                      checked={formData[key as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })}
                      className="h-5 w-5 rounded-md border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-5 bg-gray-100" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="hora_apertura" className="text-base font-medium text-gray-700">
                  Hora de Apertura
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="hora_apertura"
                    type="time"
                    value={formData.hora_apertura}
                    onChange={(e) => setFormData({ ...formData, hora_apertura: e.target.value })}
                    className="h-11 pl-10 border-gray-200 focus:border-brand-300 focus:ring-brand-200"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="hora_cierre" className="text-base font-medium text-gray-700">
                  Hora de Cierre
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="hora_cierre"
                    type="time"
                    value={formData.hora_cierre}
                    onChange={(e) => setFormData({ ...formData, hora_cierre: e.target.value })}
                    className="h-11 pl-10 border-gray-200 focus:border-brand-300 focus:ring-brand-200"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 bg-gray-50/50">
                <Checkbox
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: !!checked })}
                  className="h-5 w-5 rounded-md border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <Label htmlFor="activo" className="text-sm font-medium cursor-pointer">
                    Horario Activo
                  </Label>
                  <p className="text-xs text-gray-500">Los horarios inactivos no se mostrarán a los clientes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[120px] border-gray-200 hover:bg-gray-50 text-gray-700 h-11"
              size="lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "min-w-[150px] bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg hover:shadow-xl transition-all border border-brand-500 h-11",
                loading && "opacity-80",
              )}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="font-medium">Guardando...</span>
                </div>
              ) : (
                <span className="font-medium">Guardar Horario</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
