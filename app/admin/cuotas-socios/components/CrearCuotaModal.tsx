"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
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
import Swal from "sweetalert2"

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
  onSuccess: () => void
}

export default function CrearCuotaModal({ isOpen, onClose, onSuccess }: CrearCuotaModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CrearCuotaRequest>({
    periodicidad: "semanal",
    monto_cuota: 0,
    numero_cuenta: "",
    tipo_cuenta: "",
    banco: "",
    metodos_pago_disponibles: [],
    estado: "activo",
  })

  const [metodosSeleccionados, setMetodosSeleccionados] = useState<string[]>([])
  const [bancos, setBancos] = useState<Banco[]>([])
  const [tiposCuenta, setTiposCuenta] = useState<TipoCuenta[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadBancosYTipos()
    }
  }, [isOpen])

  const loadBancosYTipos = async () => {
    setLoadingData(true)
    try {
      const [bancosRes, tiposRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_WEB}/bancos`),
        fetch(`${process.env.NEXT_PUBLIC_API_WEB}/tipos-cuenta`),
      ])

      if (bancosRes.ok) {
        const bancosData = await bancosRes.json()
        setBancos(bancosData.data || bancosData)
      }

      if (tiposRes.ok) {
        const tiposData = await tiposRes.json()
        setTiposCuenta(tiposData.data || tiposData)
      }
    } catch (error) {
      console.error("Error al cargar bancos y tipos de cuenta:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleMetodoChange = (metodo: string) => {
    if (metodosSeleccionados.includes(metodo)) {
      setMetodosSeleccionados(metodosSeleccionados.filter((m) => m !== metodo))
    } else {
      setMetodosSeleccionados([...metodosSeleccionados, metodo])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await crearCuota({
        ...formData,
        metodos_pago_disponibles: metodosSeleccionados,
      })
      await Swal.fire({
        title: "¡Éxito!",
        text: "Cuota creada exitosamente",
        icon: "success",
        confirmButtonColor: "#dc2626",
      })
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        periodicidad: "semanal",
        monto_cuota: 0,
        numero_cuenta: "",
        tipo_cuenta: "",
        banco: "",
        metodos_pago_disponibles: [],
        estado: "activo",
      })
      setMetodosSeleccionados([])
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al crear cuota",
        icon: "error",
        confirmButtonColor: "#dc2626",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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
              <Label htmlFor="monto">Monto de la Cuota *</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                value={formData.monto_cuota}
                onChange={(e) => setFormData({ ...formData, monto_cuota: parseFloat(e.target.value) })}
                placeholder="50.00"
                required
              />
            </div>
          </div>

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
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? "Creando..." : "Crear Cuota"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
