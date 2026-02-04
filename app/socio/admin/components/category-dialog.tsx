// app\socio\admin\components\category-dialog.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogBody } from "@/components/ui/dialog"
import { PlusCircle, Save, Plus, Trash2, AlertTriangle, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Category, HorarioDia } from "../services/menu.service"

// Días de la semana (nombres exactos como los usa la app Flutter)
const DIAS_SEMANA = [
  { id: 'Lunes', nombre: 'Lunes' },
  { id: 'Martes', nombre: 'Martes' },
  { id: 'Miércoles', nombre: 'Miércoles' },
  { id: 'Jueves', nombre: 'Jueves' },
  { id: 'Viernes', nombre: 'Viernes' },
  { id: 'Sábado', nombre: 'Sábado' },
  { id: 'Domingo', nombre: 'Domingo' },
]

// Horarios por defecto (todos activos, sin horario específico = disponible todo el día)
const getDefaultHorarios = (): HorarioDia[] => {
  return DIAS_SEMANA.map(dia => ({
    dia: dia.id,
    activo: true,
    hora_inicio: null,
    hora_fin: null,
  }))
}

interface CategoryFormData {
  nombre: string
  horarios?: HorarioDia[] | null
}

interface CategoryDialogProps {
  category?: Category
  onSubmit: (data: CategoryFormData) => Promise<void>
  onDelete?: (id: number) => Promise<void>
  trigger?: React.ReactNode
}

export function CategoryDialog({ category, onSubmit, onDelete, trigger }: CategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [usarHorario, setUsarHorario] = useState(true)
  const [horarios, setHorarios] = useState<HorarioDia[]>(getDefaultHorarios())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (open) {
      if (category) {
        setNombre(category.nombre)
        
        if (category.horarios && category.horarios.length > 0) {
          setUsarHorario(true)
          const horariosCompletos = DIAS_SEMANA.map(dia => {
            const horarioExistente = category.horarios?.find(h => h.dia === dia.id)
            if (horarioExistente) {
              return horarioExistente
            }
            return {
              dia: dia.id,
              activo: true,
              hora_inicio: null,
              hora_fin: null,
            }
          })
          setHorarios(horariosCompletos)
        } else {
          setUsarHorario(true)
          setHorarios(getDefaultHorarios())
        }
      } else {
        setNombre("")
        setUsarHorario(true)
        setHorarios(getDefaultHorarios())
      }
    }
  }, [category, open])

  const handleDiaToggle = (diaId: string, checked: boolean) => {
    setHorarios(prev => prev.map(h => 
      h.dia === diaId ? { ...h, activo: checked } : h
    ))
  }

  const handleHorarioEspecificoToggle = (diaId: string, usarHorarioEspecifico: boolean) => {
    setHorarios(prev => prev.map(h => 
      h.dia === diaId 
        ? { 
            ...h, 
            hora_inicio: usarHorarioEspecifico ? '08:00' : null, 
            hora_fin: usarHorarioEspecifico ? '22:00' : null 
          } 
        : h
    ))
  }

  const handleHoraChange = (diaId: string, campo: 'hora_inicio' | 'hora_fin', valor: string) => {
    setHorarios(prev => prev.map(h => 
      h.dia === diaId ? { ...h, [campo]: valor } : h
    ))
  }

  const handleSubmit = async () => {
    if (!nombre.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        nombre,
        horarios: usarHorario ? horarios : null,
      })
      setOpen(false)
    } catch (error) {
      console.error("Error al guardar categoría:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!category || !onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(category.id)
      setOpen(false)
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleAllDays = (selectAll: boolean) => {
    setHorarios(prev => prev.map(h => ({ ...h, activo: selectAll })))
  }

  const allDaysSelected = horarios.every(h => h.activo)
  const noDaysSelected = horarios.every(h => !h.activo)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="mt-2 bg-red-600 hover:bg-red-700 text-white transition-colors">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear categoría
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[650px] max-h-[90vh] p-0 dark:bg-gray-700">
        {/* Header fijo */}
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {category ? "Editar" : "Crear nueva"} categoría
          </DialogTitle>
        </DialogHeader>
        
        {/* Contenido scrolleable */}
        <DialogBody className="px-4 sm:px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre de la categoría
              </Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Entradas, Platos principales, Postres"
                className="dark:bg-gray-800"
              />
            </div>

            {/* Sección de horarios */}
            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="usar-horario" className="text-sm font-medium">
                    Horarios de disponibilidad
                  </Label>
                </div>
                <Switch
                  id="usar-horario"
                  checked={usarHorario}
                  onCheckedChange={setUsarHorario}
                />
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {usarHorario 
                  ? "Configura los días y horarios en que esta categoría estará disponible."
                  : "Esta categoría estará disponible en todo momento."}
              </p>
              
              {usarHorario && (
                <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {/* Botones para seleccionar/deseleccionar todos */}
                  <div className="flex gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllDays(true)}
                      className="text-xs"
                      disabled={allDaysSelected}
                    >
                      Seleccionar todos
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllDays(false)}
                      className="text-xs"
                      disabled={noDaysSelected}
                    >
                      Deseleccionar todos
                    </Button>
                  </div>

                  {/* Lista de días */}
                  <div className="space-y-2">
                    {DIAS_SEMANA.map((dia) => {
                      const horario = horarios.find(h => h.dia === dia.id)
                      if (!horario) return null
                      
                      const tieneHorarioEspecifico = horario.hora_inicio !== null && horario.hora_fin !== null
                      
                      return (
                        <div 
                          key={dia.id} 
                          className={`p-2 rounded-md transition-colors ${
                            horario.activo 
                              ? 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600' 
                              : 'bg-gray-100 dark:bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <Checkbox
                              id={`dia-${dia.id}`}
                              checked={horario.activo}
                              onCheckedChange={(checked) => handleDiaToggle(dia.id, checked as boolean)}
                              className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                            <Label 
                              htmlFor={`dia-${dia.id}`} 
                              className={`w-20 text-sm font-medium cursor-pointer ${
                                !horario.activo ? 'text-gray-400' : ''
                              }`}
                            >
                              {dia.nombre}
                            </Label>
                            
                            {horario.activo && (
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {tieneHorarioEspecifico ? 'Horario' : 'Todo el día'}
                                </span>
                                <Switch
                                  checked={tieneHorarioEspecifico}
                                  onCheckedChange={(checked) => handleHorarioEspecificoToggle(dia.id, checked)}
                                  className="scale-75"
                                />
                              </div>
                            )}
                            
                            {!horario.activo && (
                              <span className="text-gray-400 text-xs italic">No disponible</span>
                            )}
                          </div>
                          
                          {horario.activo && tieneHorarioEspecifico && (
                            <div className="flex items-center gap-2 mt-2 ml-7">
                              <Input
                                type="time"
                                value={horario.hora_inicio || ''}
                                onChange={(e) => handleHoraChange(dia.id, 'hora_inicio', e.target.value)}
                                className="w-24 h-8 text-sm dark:bg-gray-600"
                              />
                              <span className="text-gray-500 text-sm">a</span>
                              <Input
                                type="time"
                                value={horario.hora_fin || ''}
                                onChange={(e) => handleHoraChange(dia.id, 'hora_fin', e.target.value)}
                                className="w-24 h-8 text-sm dark:bg-gray-600"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Los días marcados como &quot;Todo el día&quot; estarán disponibles en cualquier horario.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogBody>

        {/* Footer fijo */}
        <DialogFooter className="flex-row justify-between items-center p-4 sm:p-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div>
            {category && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm" className="flex items-center">
                    <Trash2 className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div className="flex flex-col gap-2">
                        <div>Esta acción no se puede deshacer. Se eliminará permanentemente la categoría:</div>
                        <div className="font-semibold text-red-600">{category.nombre}</div>
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md mt-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <div className="text-sm text-amber-800">
                            Si hay productos en esta categoría, también podrían verse afectados.
                          </div>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-gray-300 dark:bg-gray-800">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
              disabled={isSubmitting || !nombre.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  {category ? "Guardar" : "Crear"}
                </span>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

CategoryDialog.PlusIcon = Plus
