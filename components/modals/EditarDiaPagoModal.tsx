"use client"

import { useState, useEffect } from "react"
import { X, Calendar, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Swal from "sweetalert2"
import { actualizarDiaPago, type CuotaSocio } from "@/app/admin/cuotas-socios/services/cuota-admin.service"

interface EditarDiaPagoModalProps {
  isOpen: boolean
  cuota: CuotaSocio
  socioNombre: string
  onClose: () => void
  onSuccess: () => void
}

export default function EditarDiaPagoModal({
  isOpen,
  cuota,
  socioNombre,
  onClose,
  onSuccess,
}: EditarDiaPagoModalProps) {
  const [loading, setLoading] = useState(false)
  const [diaPago, setDiaPago] = useState<string>("")

  useEffect(() => {
    if (isOpen && cuota) {
      setDiaPago(cuota.dia_pago?.toString() || "")
    }
  }, [isOpen, cuota])

  const handleActualizar = async () => {
    if (!diaPago) {
      await Swal.fire({
        title: "Día de pago requerido",
        text: "Debes seleccionar un día de pago",
        icon: "warning",
        confirmButtonColor: "#dc2626",
      })
      return
    }

    const diaPagoNumero = parseInt(diaPago)
    const notaExplicativa = diaPagoNumero > 28 
      ? `En meses con menos de ${diaPagoNumero} días, el pago se realizará el último día del mes.`
      : undefined

    const mensajeDiaPago = (() => {
      switch (cuota.periodicidad) {
        case "semanal":
          const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
          return `<strong>${diasSemana[diaPagoNumero]} de cada semana</strong>`
        
        case "quincenal":
          return `<strong>Día ${diaPagoNumero} de cada quincena</strong>`
        
        case "mensual":
        case "diario":
        default:
          return `<strong>Día ${diaPagoNumero} de cada mes</strong>`
      }
    })()

    const result = await Swal.fire({
      title: "¿Confirmar cambio?",
      html: `Se actualizará el día de pago para:<br><strong>${socioNombre}</strong><br><br>Nuevo día de pago: ${mensajeDiaPago}${
        cuota.periodicidad === "mensual" && diaPagoNumero > 28 ? `<br><br><small class="text-amber-600">⚠️ En meses con menos días, se usará el último día del mes</small>` : ""
      }`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    setLoading(true)
    try {
      await actualizarDiaPago(cuota.id, diaPagoNumero, notaExplicativa)

      const mensajeExito = (() => {
        switch (cuota.periodicidad) {
          case "semanal":
            const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
            return `El socio ahora pagará cada ${diasSemana[diaPagoNumero]} de la semana`
          
          case "quincenal":
            return `El socio ahora pagará el día ${diaPagoNumero} de cada quincena`
          
          case "mensual":
          case "diario":
          default:
            return `El socio ahora pagará el día ${diaPagoNumero} de cada mes`
        }
      })()

      await Swal.fire({
        title: "¡Éxito!",
        html: `Día de pago actualizado exitosamente<br><small>${mensajeExito}</small>`,
        icon: "success",
        confirmButtonColor: "#dc2626",
      })

      onSuccess()
      onClose()
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al actualizar día de pago",
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Editar Día de Pago</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Editar día de pago para: <strong>{socioNombre}</strong>
            </p>

            <div className="space-y-2">
              <Label htmlFor="diaPago" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {(() => {
                  switch (cuota.periodicidad) {
                    case "semanal":
                      return "Día de Pago de la Semana"
                    case "quincenal":
                      return "Día de Pago de la Quincena"
                    case "mensual":
                      return "Día de Pago del Mes"
                    case "diario":
                      return "Día de Pago del Mes"
                    default:
                      return "Día de Pago"
                  }
                })()}
              </Label>
              <Select value={diaPago} onValueChange={setDiaPago}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    switch (cuota.periodicidad) {
                      case "semanal":
                        return [
                          { value: "1", label: "Lunes" },
                          { value: "2", label: "Martes" },
                          { value: "3", label: "Miércoles" },
                          { value: "4", label: "Jueves" },
                          { value: "5", label: "Viernes" },
                          { value: "6", label: "Sábado" },
                          { value: "7", label: "Domingo" }
                        ].map(dia => (
                          <SelectItem key={dia.value} value={dia.value}>
                            {dia.label}
                          </SelectItem>
                        ))
                      
                      case "quincenal":
                        return Array.from({length: 15}, (_, i) => i + 1).map(dia => (
                          <SelectItem key={dia} value={dia.toString()}>
                            Día {dia} de la quincena
                          </SelectItem>
                        ))
                      
                      case "mensual":
                      case "diario":
                      default:
                        return Array.from({length: 31}, (_, i) => i + 1).map(dia => (
                          <SelectItem key={dia} value={dia.toString()}>
                            Día {dia}
                            {dia > 28 && <span className="text-xs text-amber-600 ml-1">*</span>}
                          </SelectItem>
                        ))
                    }
                  })()}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500">
                {diaPago ? (
                  <>
                    {(() => {
                      switch (cuota.periodicidad) {
                        case "semanal":
                          const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
                          return `El socio deberá pagar cada ${diasSemana[parseInt(diaPago)]} de la semana`
                        
                        case "quincenal":
                          return `El socio deberá pagar el día ${diaPago} de cada quincena`
                        
                        case "mensual":
                          return `El socio deberá pagar cada día ${diaPago} del mes`
                        
                        case "diario":
                          return `El socio deberá pagar cada día ${diaPago} del mes`
                        
                        default:
                          return `El socio deberá pagar según el día ${diaPago} configurado`
                      }
                    })()}
                    {cuota.periodicidad === "mensual" && parseInt(diaPago) > 28 && (
                      <div className="text-amber-600 mt-1 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>En meses con menos días, se usará el último día del mes</span>
                      </div>
                    )}
                  </>
                ) : (
                  (() => {
                    switch (cuota.periodicidad) {
                      case "semanal":
                        return "Selecciona el día de la semana en que el socio debe realizar su pago"
                      case "quincenal":
                        return "Selecciona el día de la quincena en que el socio debe realizar su pago"
                      case "mensual":
                      case "diario":
                      default:
                        return "Selecciona el día del mes en que el socio debe realizar su pago"
                    }
                  })()
                )}
              </div>
            </div>

            {/* Información actual */}
            {cuota.dia_pago && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-xs text-gray-600 mb-1">Día de pago actual:</p>
                <p className="font-medium text-gray-900">
                  {(() => {
                    switch (cuota.periodicidad) {
                      case "semanal":
                        const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
                        return `${diasSemana[cuota.dia_pago]} de cada semana`
                      
                      case "quincenal":
                        return `Día ${cuota.dia_pago} de cada quincena`
                      
                      case "mensual":
                      case "diario":
                      default:
                        return `Día ${cuota.dia_pago} de cada mes`
                    }
                  })()}
                </p>
                {cuota.dia_pago_nota && (
                  <p className="text-xs text-gray-500 mt-1">{cuota.dia_pago_nota}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleActualizar}
            disabled={loading || !diaPago}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Actualizando..." : "Actualizar Día de Pago"}
          </Button>
        </div>
      </div>
    </div>
  )
}