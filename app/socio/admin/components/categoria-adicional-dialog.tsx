"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { PlusCircle, Save, Plus, Trash2, AlertTriangle } from "lucide-react"
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
import type { CategoriaAdicional } from "../services/adicional.service"

interface CategoriaAdicionalDialogProps {
  categoria?: CategoriaAdicional
  onSubmit: (nombre: string) => Promise<void>
  onDelete?: (id: number) => Promise<void>
  trigger?: React.ReactNode
}

export function CategoriaAdicionalDialog({ categoria, onSubmit, onDelete, trigger }: CategoriaAdicionalDialogProps) {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre)
    } else {
      setNombre("")
    }
  }, [categoria, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(nombre)
      setOpen(false)
    } catch (error) {
      console.error("Error al guardar categoría de adicional:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!categoria || !onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(categoria.id)
      setOpen(false)
    } catch (error) {
      console.error("Error al eliminar categoría de adicional:", error)
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
            Crear categoría de adicional
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {categoria ? "Editar" : "Crear nueva"} categoría de adicional
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre de la categoría de adicional
              </Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Bebidas, Salsas, Complementos"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <DialogFooter className="flex justify-between items-center pt-2">
              <div>
                {categoria && onDelete && (
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
                            <div className="font-semibold text-red-600">{categoria.nombre}</div>
                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md mt-2">
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                              <div className="text-sm text-amber-800">
                                Si hay adicionales en esta categoría, también podrían verse afectados.
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
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-gray-300">
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
                      {categoria ? "Guardar cambios" : "Crear categoría"}
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

// Añadir el icono Plus como una propiedad estática
CategoriaAdicionalDialog.PlusIcon = Plus

