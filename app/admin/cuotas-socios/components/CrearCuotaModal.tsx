"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { crearCuota } from "../services/cuota-socio.service"
import type { CrearCuotaRequest } from "../types/cuota-socio.types"
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

interface Banco {
  id: number
  nombre: string
}

interface TipoCuenta {
  id: number
  nombre: string
}

interface CrearCuotaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CrearCuotaModal({ isOpen, onClose }: CrearCuotaModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CrearCuotaRequest>({
    periodicidad: "semanal",
    tipo_cuota: "monto_fijo",
    monto_cuota: 0,
    numero_cuenta: "",
    tipo_cuenta: "",
    banco: "",
    metodos_pago_disponibles: [],
    estado: "activo",
  })
  const [metodosSeleccionados, setMetodosSeleccionados] = useState<string[]>([])

  const { data: bancos = [], isLoading: loadingBancos } = useQuery<Banco[]>({
    queryKey: ["bancos"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/bancos`)
      if (!res.ok) throw new Error("Error al cargar bancos")
      const data = await res.json()
      return data.data || data
    },
    enabled: isOpen,
  })

  const { data: tiposCuenta = [], isLoading: loadingTipos } = useQuery<TipoCuenta[]>({
    queryKey: ["tipos-cuenta"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/tipos-cuenta`)
      if (!res.ok) throw new Error("Error al cargar tipos de cuenta")
      const data = await res.json()
      return data.data || data
    },
    enabled: isOpen,
  })

  const loadingData = loadingBancos || loadingTipos

  const mutation = useMutation({
    mutationFn: crearCuota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuotas-socios"] })
      queryClient.invalidateQueries({ queryKey: ["cuotas-estadisticas"] })
      showAlert({
        title: "¡Éxito!",
        text: "Cuota creada exitosamente",
        icon: "success",
      })
      onClose()
      setFormData({
        periodicidad: "semanal",
        tipo_cuota: "monto_fijo",
        monto_cuota: 0,
        numero_cuenta: "",
        tipo_cuenta: "",
        banco: "",
        metodos_pago_disponibles: [],
        estado: "activo",
      })
      setMetodosSeleccionados([])
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message || "Error al crear cuota",
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
    mutation.mutate({
      ...formData,
      metodos_pago_disponibles: metodosSeleccionados,
    })
  }

  if (!isOpen) return null

  const esPorcentaje = formData.tipo_cuota === "porcentaje"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold">Crear Nueva Cuota</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periodicidad">Periodicidad *</Label>
                <Select
                  value={formData.periodicidad}
                  onValueChange={(value) =>
                    setFormData({ ...formData, periodicidad: value as CrearCuotaRequest["periodicidad"] })
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
                <Label htmlFor="tipo_cuota">Tipo de Cuota *</Label>
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
                <Label htmlFor="monto">Monto de la Cuota *</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={formData.monto_cuota}
                  onChange={(e) => setFormData({ ...formData, monto_cuota: parseFloat(e.target.value) || 0 })}
                  placeholder="50.00"
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="porcentaje">Porcentaje de Comisión (%) *</Label>
                  <Input
                    id="porcentaje"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.porcentaje_comision || ""}
                    onChange={(e) => setFormData({ ...formData, porcentaje_comision: parseFloat(e.target.value) || 0 })}
                    placeholder="10.00"
                    required
                  />
                  <p className="text-xs text-gray-500">Ejemplo: 10 = 10% de las ventas</p>
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
                      placeholder="4"
                    />
                    <p className="text-xs text-gray-500">Mínimo de pedidos para cobrar comisión</p>
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
                      placeholder="20.00"
                    />
                    <p className="text-xs text-gray-500">Cobra el mayor entre monto mínimo y porcentaje</p>
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
              <Label htmlFor="numero_cuenta">Número de Cuenta *</Label>
              <Input
                id="numero_cuenta"
                type="text"
                value={formData.numero_cuenta}
                onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                placeholder="191-12345678-0-99"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_cuenta">Tipo de Cuenta</Label>
                <Select
                  value={formData.tipo_cuenta}
                  onValueChange={(value) => setFormData({ ...formData, tipo_cuenta: value })}
                  disabled={loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar tipo de cuenta"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCuenta.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.nombre}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Select
                  value={formData.banco}
                  onValueChange={(value) => setFormData({ ...formData, banco: value })}
                  disabled={loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar banco"} />
                  </SelectTrigger>
                  <SelectContent>
                    {bancos.map((banco) => (
                      <SelectItem key={banco.id} value={banco.nombre}>
                        {banco.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Métodos de Pago Disponibles</Label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="yape"
                    checked={metodosSeleccionados.includes("yape")}
                    onCheckedChange={() => handleMetodoChange("yape")}
                  />
                  <Label htmlFor="yape" className="font-normal cursor-pointer text-sm">
                    Yape
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transferencia"
                    checked={metodosSeleccionados.includes("transferencia")}
                    onCheckedChange={() => handleMetodoChange("transferencia")}
                  />
                  <Label htmlFor="transferencia" className="font-normal cursor-pointer text-sm">
                    Transferencia
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deposito"
                    checked={metodosSeleccionados.includes("deposito")}
                    onCheckedChange={() => handleMetodoChange("deposito")}
                  />
                  <Label htmlFor="deposito" className="font-normal cursor-pointer text-sm">
                    Depósito
                  </Label>
                </div>
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
                placeholder="Descripción de la cuota..."
              />
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-red-600 hover:bg-red-700">
              {mutation.isPending ? "Creando..." : "Crear Cuota"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
