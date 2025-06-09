// app\admin\coutas-drivers\components\GenerarCuotasModal.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { X, Calendar, DollarSign, Users, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { showAlert } from "@/components/ui/DataTable/Alert"
import {
  generarCuotasSemanal,
  fetchMotorizadosAprobados,
} from "../services/cuota.service"
import type { MotorizadoAprobado, GenerarCuotasRequest } from "../types/cuota.types"

interface GenerarCuotasModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const GenerarCuotasModal: React.FC<GenerarCuotasModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    monto_cuota: 50,
    fecha_vencimiento: "",
  })
  const [selectedMotorizados, setSelectedMotorizados] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(true)

  // Query para obtener motorizados aprobados
  const { data: motorizados = [], isLoading: loadingMotorizados } = useQuery<MotorizadoAprobado[]>({
    queryKey: ["motorizados-aprobados"],
    queryFn: fetchMotorizadosAprobados,
    enabled: isOpen,
  })

  // Mutation para generar cuotas
  const mutationGenerar = useMutation({
    mutationFn: (request: GenerarCuotasRequest) => generarCuotasSemanal(request),
    onSuccess: () => {
      showAlert({
        title: "Éxito",
        text: "Cuotas generadas correctamente",
        icon: "success",
      })
      onSuccess()
      onClose()
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
      monto_cuota: 50,
      fecha_vencimiento: "",
    })
    setSelectedMotorizados([])
    setSelectAll(true)
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedMotorizados(motorizados.map((m) => m.id))
    } else {
      setSelectedMotorizados([])
    }
  }

  const handleSelectMotorizado = (motorizadoId: number, checked: boolean) => {
    if (checked) {
      setSelectedMotorizados([...selectedMotorizados, motorizadoId])
    } else {
      setSelectedMotorizados(selectedMotorizados.filter((id) => id !== motorizadoId))
      setSelectAll(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fecha_vencimiento) {
      showAlert({
        title: "Error",
        text: "Por favor selecciona una fecha de vencimiento",
        icon: "error",
      })
      return
    }

    if (formData.monto_cuota <= 0) {
      showAlert({
        title: "Error",
        text: "El monto de la cuota debe ser mayor a 0",
        icon: "error",
      })
      return
    }

    const request: GenerarCuotasRequest = {
      monto_cuota: formData.monto_cuota,
      fecha_vencimiento: formData.fecha_vencimiento,
      motorizado_ids: selectAll ? undefined : selectedMotorizados,
    }

    mutationGenerar.mutate(request)
  }

  // Obtener fecha de la próxima semana como default
  const getNextWeekDate = () => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return nextWeek.toISOString().split("T")[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Generar Cuotas Semanales</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Configuración de cuota */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monto_cuota" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monto de la Cuota (S/)
                </Label>
                <Input
                  id="monto_cuota"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto_cuota}
                  onChange={(e) =>
                    setFormData({ ...formData, monto_cuota: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fecha_vencimiento" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de Vencimiento
                </Label>
                <Input
                  id="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_vencimiento: e.target.value })
                  }
                  min={getNextWeekDate()}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Selección de motorizados */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" />
                Seleccionar Motorizados
              </Label>

              {loadingMotorizados ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Cargando motorizados...</span>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg">
                  {/* Select All */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label htmlFor="select-all" className="font-medium">
                        Seleccionar todos ({motorizados.length} motorizados)
                      </Label>
                    </div>
                  </div>

                  {/* Lista de motorizados */}
                  <div className="max-h-60 overflow-y-auto">
                    {motorizados.map((motorizado) => (
                      <div key={motorizado.id} className="p-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`motorizado-${motorizado.id}`}
                            checked={selectAll || selectedMotorizados.includes(motorizado.id)}
                            onCheckedChange={(checked) =>
                              handleSelectMotorizado(motorizado.id, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`motorizado-${motorizado.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {motorizado.nombres} {motorizado.apellidos}
                              </div>
                              <div className="text-sm text-gray-500">
                                {motorizado.email} • {motorizado.celular}
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Resumen</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  • Motorizados seleccionados:{" "}
                  {selectAll ? motorizados.length : selectedMotorizados.length}
                </p>
                <p>• Monto por cuota: S/ {formData.monto_cuota.toFixed(2)}</p>
                <p>
                  • Total a generar: S/{" "}
                  {(
                    formData.monto_cuota *
                    (selectAll ? motorizados.length : selectedMotorizados.length)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutationGenerar.isPending || loadingMotorizados}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {mutationGenerar.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                "Generar Cuotas"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}