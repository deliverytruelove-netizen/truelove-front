// app\socio\admin\components\category-dialog.tsx este da error al crear la categoria ya te pase los errores anteriormente
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Category } from "../services/menu.service"

interface CategoryDialogProps {
  category?: Category
  onSubmit: (nombre: string) => Promise<void>
  trigger?: React.ReactNode
}

export function CategoryDialog({ category, onSubmit, trigger }: CategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")

  useEffect(() => {
    if (category) {
      setNombre(category.nombre)
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(nombre)
    setOpen(false)
    setNombre("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button className="mt-2">Crear categoría</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar" : "Crear nueva"} categoría</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la categoría</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">
              {category ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

