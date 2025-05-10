// app\admin\metodo-pago\components\formulario-metodo-pago.tsx
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { MetodoPago, ApiError } from "../types/metodo-pago.types"
import { MetodoPagoIcon } from "./metodo-pago-icon"
// Importar el nuevo hook
import { useMetodosPagoQuery } from "../hooks/use-metodos-pago"

interface FormularioMetodoPagoProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  metodoPago: MetodoPago | null
  onClose: () => void
  onSuccess: () => void
}

const initialMetodoPagoState: MetodoPago = {
  nombre: "",
  estado: true,
}

// Actualizar el componente para usar el nuevo hook
export function FormularioMetodoPago({
  isOpen,
  onOpenChange,
  metodoPago,
  onClose,
  onSuccess,
}: FormularioMetodoPagoProps) {
  const { createMetodoPago, updateMetodoPago, isCreating, isUpdating } = useMetodosPagoQuery()
  const { toast } = useToast()
  const isLoading = isCreating || isUpdating

  const [formData, setFormData] = useState<MetodoPago>(initialMetodoPagoState)
  // Añadir estado para errores de validación
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (metodoPago) {
      setFormData(metodoPago)
    } else {
      setFormData(initialMetodoPagoState)
    }
  }, [metodoPago])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, estado: checked }))
  }

  // Modificar la función handleSubmit para manejar errores de validación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Limpiar errores previos
    setValidationErrors({})

    try {
      if (metodoPago?.id) {
        await updateMetodoPago(metodoPago.id, formData)
      } else {
        await createMetodoPago(formData)
      }

      onSuccess()
      onClose()
    } catch (error) {
      // Manejar errores de validación
      const apiError = error as ApiError
      if (apiError.validationErrors) {
        setValidationErrors(apiError.validationErrors)

        // Mostrar mensaje específico para nombre duplicado
        if (apiError.validationErrors.nombre && apiError.validationErrors.nombre.includes("has already been taken")) {
          toast({
            title: "Error de validación",
            description: "El nombre del método de pago ya está en uso",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error de validación",
            description: "Por favor, corrija los errores en el formulario",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Hubo un problema al guardar el método de pago",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{metodoPago ? "Editar Método de Pago" : "Crear Nuevo Método de Pago"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Añadir visualización de errores en el campo de nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className={validationErrors.nombre ? "border-red-500" : ""}
            />
            {validationErrors.nombre && (
              <p className="text-sm text-red-500">
                {validationErrors.nombre[0] === "The nombre has already been taken."
                  ? "Este nombre ya está en uso"
                  : validationErrors.nombre[0]}
              </p>
            )}
          </div>

          {formData.nombre && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
              <MetodoPagoIcon nombre={formData.nombre} className="h-12 w-12" />
              <div>
                <p className="font-medium">Vista previa del ícono</p>
                <p className="text-sm text-gray-500">El ícono se asigna automáticamente según el nombre</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch id="estado" checked={formData.estado} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="estado">Activo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-red-500 hover:bg-red-600">
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}