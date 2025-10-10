"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { actualizarCuota } from "../services/cuota-socio.service"
import type { CuotaSocio, ActualizarCuotaRequest } from "../types/cuota-socio.types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Swal from "sweetalert2"

interface EditarCuotaModalProps {
  isOpen: boolean
  cuota: CuotaSocio | null
  onClose: () => void
  onSuccess: () => void
}

export default function EditarCuotaModal({ isOpen, cuota, onClose, onSuccess }: EditarCuotaModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ActualizarCuotaRequest>({})
  const [metodosSeleccionados, setMetodosSeleccionados] = useState<string[]>([])

  useEffect(() => {
    if (cuota) {
      setFormData({
        periodicidad: cuota.periodicidad,
        monto_cuota: cuota.monto_cuota,
        numero_cuenta: cuota.numero_cuenta,
        tipo_cuenta: cuota.tipo_cuenta || "",
        banco: cuota.banco || "",
        estado: cuota.estado,
        fecha_inicio: cuota.fecha_inicio,
        fecha_fin: cuota.fecha_fin || "",
        descripcion: cuota.descripcion || "",
      })
      setMetodosSeleccionados(cuota.metodos_pago_disponibles || [])
    }
  }, [cuota])

  const handleMetodoChange = (metodo: string) => {
    if (metodosSeleccionados.includes(metodo)) {
      setMetodosSeleccionados(metodosSeleccionados.filter((m) => m !== metodo))
    } else {
      setMetodosSeleccionados([...metodosSeleccionados, metodo])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cuota) return

    setLoading(true)
    try {
      await actualizarCuota(cuota.id, {
        ...formData,
        metodos_pago_disponibles: metodosSeleccionados,
      })
      await Swal.fire({
        title: "¡Éxito!",
        text: "Cuota actualizada exitosamente",
        icon: "success",
        confirmButtonColor: "#dc2626",
      })
      onSuccess()
      onClose()
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al actualizar cuota",
        icon: "error",
        confirmButtonColor: "#dc2626",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !cuota) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold">Editar Cuota</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periodicidad">Periodicidad</Label>
                <Select
                  value={formData.periodicidad}
                  onValueChange={(value) =>
                    setFormData({ ...formData, periodicidad: value as ActualizarCuotaRequest["periodicidad"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar periodicidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diario</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quincenal">Quincenal</SelectItem>
                    <SelectItem value="mensual">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto de la Cuota</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={formData.monto_cuota}
                  onChange={(e) => setFormData({ ...formData, monto_cuota: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_cuenta">Número de Cuenta</Label>
              <Input
                id="numero_cuenta"
                type="text"
                value={formData.numero_cuenta}
                onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_cuenta">Tipo de Cuenta</Label>
                <Input
                  id="tipo_cuenta"
                  type="text"
                  value={formData.tipo_cuenta}
                  onChange={(e) => setFormData({ ...formData, tipo_cuenta: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  type="text"
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Métodos de Pago Disponibles</Label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="yape-edit"
                    checked={metodosSeleccionados.includes("yape")}
                    onCheckedChange={() => handleMetodoChange("yape")}
                  />
                  <Label htmlFor="yape-edit" className="font-normal cursor-pointer text-sm">
                    Yape
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transferencia-edit"
                    checked={metodosSeleccionados.includes("transferencia")}
                    onCheckedChange={() => handleMetodoChange("transferencia")}
                  />
                  <Label htmlFor="transferencia-edit" className="font-normal cursor-pointer text-sm">
                    Transferencia
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deposito-edit"
                    checked={metodosSeleccionados.includes("deposito")}
                    onCheckedChange={() => handleMetodoChange("deposito")}
                  />
                  <Label htmlFor="deposito-edit" className="font-normal cursor-pointer text-sm">
                    Depósito
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => setFormData({ ...formData, estado: value as "activo" | "inactivo" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha Fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={formData.fecha_fin || ""}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
