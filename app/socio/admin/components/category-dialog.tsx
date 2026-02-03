// app\socio\admin\components\category-dialog.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { PlusCircle, Save, Plus, Trash2, AlertTriangle, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
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
import type { Category } from "../services/menu.service"

interface CategoryFormData {
  nombre: string
  hora_inicio?: string | null
  hora_fin?: string | null
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
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFin, setHoraFin] = useState("")
  const [usarHorario, setUsarHorario] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (category) {
      setNombre(category.nombre)
      setHoraInicio(category.hora_inicio || "")
      setHoraFin(category.hora_fin || "")
      setUsarHorario(!!(category.hora_inicio && category.hora_fin))
    } else {
      setNombre("")
      setHoraInicio("")
      setHoraFin("")
      setUsarHorario(false)
    }
  }, [category, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    // Validar horarios si están habilitados
    if (usarHorario && (!horaInicio || !horaFin)) {
      alert("Debes completar ambos horarios (inicio y fin)")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        nombre,
        hora_inicio: usarHorario ? horaInicio : null,
        hora_fin: usarHorario ? horaFin : null,
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
      <DialogContent className="sm:max-w-[500px] p-6 dark:bg-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {category ? "Editar" : "Crear nueva"} categoría
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
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
                    Disponible solo en horario específico
                  </Label>
                </div>
                <Switch
                  id="usar-horario"
                  checked={usarHorario}
                  onCheckedChange={setUsarHorario}
                />
              </div>
              
              {usarHorario && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="hora_inicio" className="text-sm font-medium">
                      Hora inicio
                    </Label>
                    <Input
                      id="hora_inicio"
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className="dark:bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora_fin" className="text-sm font-medium">
                      Hora fin
                    </Label>
                    <Input
                      id="hora_fin"
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      className="dark:bg-gray-700"
                    />
                  </div>
                  <p className="col-span-2 text-xs text-gray-500 dark:text-gray-400">
                    Esta categoría solo será visible para los clientes dentro de este horario.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between items-center pt-4">
              <div>
                {category && onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" size="sm" className="flex items-center">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
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
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
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
                          {isDeleting ? "Eliminando..." : "Sí, eliminar categoría"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-gray-300 dark:bg-gray-800">
                  Cancelar
                </Button>
                <Button
                  type="submit"
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
                      {category ? "Guardar cambios" : "Crear categoría"}
                    </span>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Añadir el icono Plus como una propiedad estática para CategoryDialog
CategoryDialog.PlusIcon = Plus
