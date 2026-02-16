"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { showAlert } from "@/components/ui/DataTable/Alert"

interface EditarCuotaModalProps {
  isOpen: boolean
  cuota: CuotaSocio | null
  onClose: () => void
}

export default function EditarCuotaModal({ isOpen, cuota, onClose }: EditarCuotaModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<ActualizarCuotaRequest>({})
  const [metodosSeleccionados, setMetodosSeleccionados] = useState<string[]>([])

  useEffect(() => {
    if (cuota) {
      setFormData({
        periodicidad: cuota.periodicidad,
        tipo_cuota: cuota.tipo_cuota,
        monto_cuota: cuota.monto_cuota,
        porcentaje_comision: cuota.porcentaje_comision || undefined,
        minimo_pedidos: cuota.minimo_pedidos || undefined,
        exonerar_si_menos_pedidos: cuota.exonerar_si_menos_pedidos || false,
        monto_minimo: cuota.monto_minimo || undefined,
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

  const mutation = useMutation({
    mutationFn: (data: ActualizarCuotaRequest) => actualizarCuota(cuota!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuotas-socios"] })
      queryClient.invalidateQueries({ queryKey: ["cuotas-estadisticas"] })
      showAlert({
        title: "¡Éxito!",
        text: "Cuota actualizada exitosamente",
        icon: "success",
      })
      onClose()
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message || "Error al actualizar cuota",
        icon: "error",
      })
    },
  })

  const handleMetodoChange = (metodo: string) => {
    if (metodosSeleccionados.includes(metodo)) {
      setMetodosSeleccionados(metodosSeleccionados.filter((m) => m !== metodo))
    } else {
      setMetodosSeleccionados([...metodosSeleccionados, metodo])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cuota) return

    mutation.mutate({
      ...formData,
      metodos_pago_disponibles: metodosSeleccionados,
    })
  }

  if (!isOpen || !cuota) return null

  const esPorcentaje = formData.tipo_cuota === "porcentaje"

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
                <Label htmlFor="tipo_cuota">Tipo de Cuota</Label>
                <Select
                  value={formData.tipo_cuota}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo_cuota: value as "monto_fijo" | "porcentaje" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monto_fijo">Monto Fijo</SelectItem>
                    <SelectItem value="porcentaje">Porcentaje (Comisión)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Campos según tipo de cuota */}
            {!esPorcentaje ? (
              <div className="space-y-2">
                <Label htmlFor="monto">Monto de la Cuota</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={formData.monto_cuota}
                  onChange={(e) => setFormData({ ...formData, monto_cuota: parseFloat(e.target.value) || 0 })}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="porcentaje">Porcentaje de Comisión (%)</Label>
                  <Input
                    id="porcentaje"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.porcentaje_comision || ""}
                    onChange={(e) => setFormData({ ...formData, porcentaje_comision: parseFloat(e.target.value) || undefined })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimo_pedidos">Mínimo de Pedidos</Label>
                    <Input
                      id="minimo_pedidos"
                      type="number"
                      min="0"
                      value={formData.minimo_pedidos || ""}
                      onChange={(e) => setFormData({ ...formData, minimo_pedidos: parseInt(e.target.value) || undefined })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monto_minimo">Monto Mínimo (S/)</Label>
                    <Input
                      id="monto_minimo"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monto_minimo || ""}
                      onChange={(e) => setFormData({ ...formData, monto_minimo: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exonerar"
                    checked={formData.exonerar_si_menos_pedidos || false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, exonerar_si_menos_pedidos: checked as boolean })
                    }
                  />
                  <Label htmlFor="exonerar" className="font-normal cursor-pointer text-sm">
                    No cobrar si no cumple el mínimo de pedidos
                  </Label>
                </div>
              </>
            )}

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
            <Button type="submit" disabled={mutation.isPending} className="bg-red-600 hover:bg-red-700">
              {mutation.isPending ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
