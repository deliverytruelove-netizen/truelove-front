// truelove-front\app\socio\admin\info-socio\components\BankDataModal.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipos para los datos del modal
interface BankData {
  titular_cuenta?: string | null
  numero_cuenta?: string | null
  nombre_banco?: string | null
  tipo_cuenta?: string | null
  documento_titular?: string | null
  codigo_cci?: string | null
}

interface BankFormData {
  titular_cuenta: string
  nombre_banco: string
  tipo_cuenta: string
  numero_cuenta: string
  documento_titular: string
  codigo_cci?: string
}

interface BankDataModalProps {
  currentData: BankData | null
  onUpdate: (data: BankFormData) => Promise<void>
  onClose: () => void
}

// Datos temporales para bancos y tipos de cuenta
const BANCOS = [
  { id: 1, nombre: "BCP" },
  { id: 2, nombre: "Interbank" },
  { id: 3, nombre: "Scotiabank" },
  { id: 4, nombre: "BBVA" },
]

const TIPOS_CUENTA = [
  { id: 1, nombre: "Ahorros" },
  { id: 2, nombre: "Corriente" },
]

export default function BankDataModal({ currentData, onUpdate, onClose }: BankDataModalProps) {
  const [formData, setFormData] = useState<BankFormData>({
    titular_cuenta: "",
    nombre_banco: "",
    tipo_cuenta: "",
    numero_cuenta: "",
    documento_titular: "",
    codigo_cci: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentData) {
      setFormData({
        titular_cuenta: currentData.titular_cuenta || "",
        nombre_banco: currentData.nombre_banco || "",
        tipo_cuenta: currentData.tipo_cuenta || "",
        numero_cuenta: currentData.numero_cuenta || "",
        documento_titular: currentData.documento_titular || "",
        codigo_cci: currentData.codigo_cci || "",
      })
    }
  }, [currentData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.titular_cuenta ||
      !formData.numero_cuenta ||
      !formData.nombre_banco ||
      !formData.tipo_cuenta ||
      !formData.documento_titular
    ) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    setLoading(true)
    try {
      await onUpdate(formData)
    } catch (error) {
      console.error("Error al actualizar:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Datos Bancarios</DialogTitle>
        <DialogDescription>Actualiza tus datos bancarios declarados.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="titular_cuenta">Titular de la Cuenta</Label>
            <Input
              id="titular_cuenta"
              name="titular_cuenta"
              value={formData.titular_cuenta}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documento_titular">Documento del Titular</Label>
            <Input
              id="documento_titular"
              name="documento_titular"
              value={formData.documento_titular}
              onChange={handleChange}
              placeholder="DNI/RUC del titular"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre_banco">Banco</Label>
          <Select
            key={`banco-${formData.nombre_banco}`}
            name="nombre_banco"
            defaultValue={formData.nombre_banco}
            onValueChange={(value) => handleSelectChange("nombre_banco", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un banco" />
            </SelectTrigger>
            <SelectContent>
              {BANCOS.map((banco) => (
                <SelectItem key={banco.id} value={banco.nombre}>
                  {banco.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_cuenta">Tipo de Cuenta</Label>
          <Select
            key={`tipo-${formData.tipo_cuenta}`}
            name="tipo_cuenta"
            defaultValue={formData.tipo_cuenta}
            onValueChange={(value) => handleSelectChange("tipo_cuenta", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo de cuenta" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_CUENTA.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.nombre}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_cuenta">Número de Cuenta</Label>
          <Input
            id="numero_cuenta"
            name="numero_cuenta"
            value={formData.numero_cuenta}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo_cci">Código CCI</Label>
          <Input
            id="codigo_cci"
            name="codigo_cci"
            value={formData.codigo_cci}
            onChange={handleChange}
            placeholder="Código de cuenta interbancario"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </>
  )
}
