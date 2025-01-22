"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "../services/menu.service"

interface CreateMenuModalProps {
  categories: Category[]
  onSubmit: (formData: FormData) => Promise<void>
  empresa_id: string
}

export function CreateMenuModal({ categories, onSubmit, empresa_id }: CreateMenuModalProps) {
  const [open, setOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Debug the form data
    console.log("Categoría seleccionada:", selectedCategory)

    // Ensure categoria_id is included as a number
    formData.set("categoria_id", selectedCategory)
    formData.set("status", "active")
    formData.set("empresa_id", empresa_id)

    // Log the final form data
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

    await onSubmit(formData)
    setOpen(false)
    setImagePreview(null)
    setSelectedCategory("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          setImagePreview(null)
          setSelectedCategory("")
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-600/90">Crear nuevo producto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" name="titulo" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" name="descripcion" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio">Precio</Label>
            <Input id="precio" name="precio" type="number" step="0.01" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria_id">Categoría</Label>
            <Select name="categoria_id" value={selectedCategory} onValueChange={setSelectedCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
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

          <div className="space-y-2">
            <Label htmlFor="foto">Foto</Label>
            <Input id="foto" name="foto" type="file" accept="image/*" required onChange={handleImageChange} />
            {imagePreview && (
              <div className="mt-2 relative aspect-square w-full max-w-[200px] mx-auto">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-600/90">
            Crear producto
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

