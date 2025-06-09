// app\admin\coutas-drivers\components\MarcarPagadaModal.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { X, CreditCard, FileText, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { showAlert } from "@/components/ui/DataTable/Alert"
import { marcarCuotaPagada } from "../services/cuota.service"
import type { CuotaMotorizado, MarcarPagadaRequest } from "../types/cuota.types"

interface MarcarPagadaModalProps {
  isOpen: boolean
  onClose: () => void
  cuota: CuotaMotorizado
  onSuccess: () => void
}

export const MarcarPagadaModal: React.FC<MarcarPagadaModalProps> = ({
  isOpen,
  onClose,
  cuota,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    metodo_pago: "",
    observaciones: "",
    comprobante_pago: "",
  })

  // Mutation para marcar como pagada
  const mutationMarcarPagada = useMutation({
    mutationFn: (request: MarcarPagadaRequest) => marcarCuotaPagada(cuota.id, request),
    onSuccess: () => {
      showAlert({
        title: "Éxito",
        text: "Cuota marcada como pagada correctamente",
        icon: "success",
      })
      onSuccess()
      resetForm()
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message,
        icon: "error",
      })
    },
  })

  const resetForm = () => {
    setFormData({
      metodo_pago: "",
      observaciones: "",
      comprobante_pago: "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.metodo_pago) {
      showAlert({
        title: "Error",
        text: "Por favor selecciona un método de pago",
        icon: "error",
      })
      return
    }

    mutationMarcarPagada.mutate(formData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Marcar como Pagada</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Información de la cuota */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-900">Información de la Cuota</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Motorizado:</span>{" "}
                  {cuota.motorizado.nombres} {cuota.motorizado.apellidos}
                </p>
                <p>
                  <span className="font-medium">Monto:</span> {formatCurrency(cuota.monto_cuota)}
                </p>
                <p>
                  <span className="font-medium">Semana:</span> {formatDate(cuota.semana_inicio)} al{" "}
                  {formatDate(cuota.semana_fin)}
                </p>
                <p>
                  <span className="font-medium">Vencimiento:</span> {formatDate(cuota.fecha_vencimiento)}
                </p>
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <Label htmlFor="metodo_pago" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Método de Pago *
              </Label>
              <Select value={formData.metodo_pago} onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona el método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                  <SelectItem value="deposito">Depósito Bancario</SelectItem>
                  <SelectItem value="yape">Yape</SelectItem>
                  <SelectItem value="plin">Plin</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Número de comprobante */}
            <div>
              <Label htmlFor="comprobante_pago" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Número de Comprobante
              </Label>
              <Input
                id="comprobante_pago"
                type="text"
                value={formData.comprobante_pago}
                onChange={(e) =>
                  setFormData({ ...formData, comprobante_pago: e.target.value })
                }
                placeholder="Ej: OP-123456, Recibo-001, etc."
                className="mt-1"
              />
            </div>

            {/* Observaciones */}
            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                placeholder="Observaciones adicionales sobre el pago..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutationMarcarPagada.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {mutationMarcarPagada.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Marcando...
                </>
              ) : (
                "Marcar como Pagada"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}