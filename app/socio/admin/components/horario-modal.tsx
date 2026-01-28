// app\socio\admin\components\horario-modal.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

import { useEffect } from "react"
import { HorarioNegocio } from "./perfil-negocio";

interface HorarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardar: (horario: HorarioNegocio) => Promise<void>;
  initialData?: HorarioNegocio; // Datos iniciales para edición
}

const diasSemana = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

export function HorarioModal({ open, onOpenChange, onGuardar, initialData }: HorarioModalProps) {
  const [loading, setLoading] = useState(false);
  const [nombreError, setNombreError] = useState("");
  const nombreInputRef = useRef<HTMLInputElement>(null);
  
  // Función para convertir hora al formato HH:mm
  const convertirHoraAFormato24 = (hora: string): string => {
    if (!hora) return "";
    
    // Si ya está en formato HH:mm, devolverla tal cual
    if (/^\d{2}:\d{2}$/.test(hora)) {
      return hora;
    }
    
    // Si viene en formato de 12 horas con AM/PM (ej: "02:04 p. m.")
    try {
      // Limpiar la hora
      const horaLimpia = hora.trim().toLowerCase();
      
      // Extraer horas, minutos y período (am/pm)
      const match = horaLimpia.match(/(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)/i);
      
      if (match) {
        let horas = parseInt(match[1]);
        const minutos = match[2];
        const periodo = match[3].replace(/\s|\./g, '').toLowerCase();
        
        // Convertir a formato 24 horas
        if (periodo.includes('p') && horas !== 12) {
          horas += 12;
        } else if (periodo.includes('a') && horas === 12) {
          horas = 0;
        }
        
        return `${horas.toString().padStart(2, '0')}:${minutos}`;
      }
    } catch (error) {
      console.error("Error al convertir hora:", error);
    }
    
    return hora;
  };
  
  const [formData, setFormData] = useState<HorarioNegocio>(
    initialData ? {
      ...initialData,
      hora_apertura: convertirHoraAFormato24(initialData.hora_apertura),
      hora_cierre: convertirHoraAFormato24(initialData.hora_cierre),
    } : {
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
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        hora_apertura: convertirHoraAFormato24(initialData.hora_apertura),
        hora_cierre: convertirHoraAFormato24(initialData.hora_cierre),
      });
    } else {
      // Reset form when modal is opened for new creation
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
      });
    }
  }, [initialData, open]); // Depend on initialData and open prop

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      setNombreError("El nombre del horario es requerido")
      // Hacer scroll hacia arriba y enfocar el input
      setTimeout(() => {
        nombreInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        nombreInputRef.current?.focus()
      }, 100)
      return
    }
    
    setLoading(true)
    try {
      await onGuardar(formData)
      onOpenChange(false)
      setNombreError("")
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
        {/* ✅ HEADER FIJO */}
        <div className="bg-gradient-to-r from-brand-100 to-white p-6 border-b flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-brand-600 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              {initialData ? 'Editar Horario' : 'Agregar Nuevo Horario'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {initialData 
                ? 'Modifica los días y horas de este horario.'
                : 'Define los días y horas en que tu negocio estará disponible para recibir pedidos.'
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* ✅ CONTENIDO CON SCROLL */}
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="nombre" className="text-base font-medium text-gray-700">
                  Nombre del Horario
                </Label>
                <Input
                  ref={nombreInputRef}
                  id="nombre"
                  placeholder="Ej: Horario Regular, Fin de Semana, etc."
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({ ...formData, nombre: e.target.value })
                    if (nombreError) setNombreError("")
                  }}
                  className={cn(
                    "h-11 focus:border-brand-300 focus:ring-brand-200",
                    nombreError 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                      : "border-gray-200"
                  )}
                />
                {nombreError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-600">⚠</span> {nombreError}
                  </p>
                )}
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
                  <Input
                    id="hora_apertura"
                    type="time"
                    value={formData.hora_apertura}
                    onChange={(e) => setFormData({ ...formData, hora_apertura: e.target.value })}
                    className="h-11 border-gray-200 focus:border-brand-300 focus:ring-brand-200"
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="hora_cierre" className="text-base font-medium text-gray-700">
                    Hora de Cierre
                  </Label>
                  <Input
                    id="hora_cierre"
                    type="time"
                    value={formData.hora_cierre}
                    onChange={(e) => setFormData({ ...formData, hora_cierre: e.target.value })}
                    className="h-11 border-gray-200 focus:border-brand-300 focus:ring-brand-200"
                    required
                  />
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
          </form>
        </DialogBody>

        {/* ✅ FOOTER FIJO */}
        <DialogFooter className="border-t bg-gray-50/50 p-6">
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
            onClick={handleSubmit}
            className={cn(
              "min-w-[150px] bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg hover:shadow-xl transition-all border border-brand-500 h-11",
              loading && "opacity-80",
            )}
            size="lg"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="font-medium">{initialData ? 'Actualizando...' : 'Guardando...'}</span>
              </div>
            ) : (
              <span className="font-medium">{initialData ? 'Actualizar Horario' : 'Guardar Horario'}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
