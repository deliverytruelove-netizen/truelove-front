"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Package, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adicionalService } from "../services/adicional.service"

interface CreateAdicionalInlineProps {
  onCreated: (adicional: { id: number; titulo: string; precio: number }) => void
  onCancel: () => void
  grupoId?: number // Si se pasa, se agregará al grupo automáticamente
}

export function CreateAdicionalInline({ onCreated, onCancel }: CreateAdicionalInlineProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({ titulo: "", descripcion: "", precio: "" })
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!formData.titulo.trim() || !formData.precio) {
      toast({ title: "Error", description: "Nombre y precio son requeridos", variant: "destructive" })
      return
    }

    try {
      setSaving(true)
      const data = new FormData()
      data.append("titulo", formData.titulo)
      data.append("descripcion", formData.descripcion)
      data.append("precio", formData.precio)
      data.append("status", "active")

      const response = await adicionalService.createAdicional(data)

      if (response.data) {
        toast({ title: "Éxito", description: "Adicional creado correctamente" })
        onCreated({
          id: response.data.id,
          titulo: response.data.titulo,
          precio: typeof response.data.precio === "string" 
            ? parseFloat(response.data.precio) 
            : response.data.precio,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear adicional",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
          <Package className="h-4 w-4" />
          Crear nuevo adicional
        </h5>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Nombre *</Label>
          <Input
            placeholder="Ej: Queso extra"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Descripción (máx. 100)</Label>
          <Input
            placeholder="Descripción breve"
            maxLength={100}
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Precio *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleCreate}
            disabled={saving || !formData.titulo.trim() || !formData.precio}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Crear Adicional
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
