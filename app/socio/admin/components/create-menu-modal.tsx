"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Category } from "../services/menu.service"

interface CreateMenuModalProps {
  categories: Category[]
  onSubmit: (formData: FormData) => Promise<void>
}

export function CreateMenuModal({ categories, onSubmit }: CreateMenuModalProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await onSubmit(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Nombre del producto</Label>
            <Input id="titulo" name="titulo" required />
          </div>
          <div>
            <Label htmlFor="categoria_id">Categoría</Label>
            <Select name="categoria_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" name="descripcion" />
          </div>
          <div>
            <Label htmlFor="precio">Precio</Label>
            <Input id="precio" name="precio" type="number" step="0.01" required />
          </div>
          <div>
            <Label htmlFor="foto">Foto</Label>
            <Input id="foto" name="foto" type="file" accept="image/*" />
          </div>
          <Button type="submit" className="w-full">
            Crear producto
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

