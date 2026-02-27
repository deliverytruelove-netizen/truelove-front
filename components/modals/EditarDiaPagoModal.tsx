"use client"

import { useState, useEffect } from "react"
import { X, Calendar, AlertTriangle, Info } from "lucide-react"
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
import type { Periodo } from "@/app/socio/admin/cuotas/types/pago-cuota.types"

interface EditarDiaPagoModalProps {
  isOpen: boolean
  cuota: CuotaSocio
  socioNombre: string
  periodos?: Periodo[]
  onClose: () => void
  onSuccess: () => void
}

export default function EditarDiaPagoModal({
  isOpen,
  cuota,
  socioNombre,
  periodos = [],
  onClose,
  onSuccess,
}: EditarDiaPagoModalProps) {
  const [loading, setLoading] = useState(false)
  const [diaPago, setDiaPago] = useState<string>("")

  const esPorcentaje = cuota.tipo_cuota === "porcentaje"

  useEffect(() => {
    if (isOpen && cuota) {
      setDiaPago(cuota.dia_pago?.toString() || "")
    }
  }, [isOpen, cuota])

  const formatFechCorta = (fecha: string) => {
    const [year, month, day] = fecha.split('T')[0].split('-')
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getNombreMes = (fecha: string) => {
    const [year, month] = fecha.split('T')[0].split('-')
    const d = new Date(parseInt(year), parseInt(month) - 1, 1)
    return d.toLocaleDateString("es-PE", { month: "long", year: "numeric" })
  }

  const getDiaNombre = (dia: number) => {
    const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    return diasSemana[dia] || `Día ${dia}`
  }

  const handleActualizar = async () => {
    if (!diaPago) {
      await Swal.fire({
        title: esPorcentaje ? "Día de vencimiento requerido" : "Día de pago requerido",
        text: esPorcentaje ? "Debes seleccionar un día de vencimiento" : "Debes seleccionar un día de pago",
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
          return `<strong>${getDiaNombre(diaPagoNumero)} de cada semana</strong>`
        case "quincenal":
          return `<strong>Día ${diaPagoNumero} de cada quincena</strong>`
        default:
          return `<strong>Día ${diaPagoNumero} de cada mes</strong>`
      }
    })()

    const result = await Swal.fire({
      title: "¿Confirmar cambio?",
      html: `Se actualizará el ${esPorcentaje ? "día de vencimiento" : "día de pago"} para:<br><strong>${socioNombre}</strong><br><br>Nuevo ${esPorcentaje ? "vencimiento" : "día de pago"}: ${mensajeDiaPago}${
        esPorcentaje ? `<br><br><small class="text-gray-500">Los períodos pendientes se actualizarán con el nuevo vencimiento</small>` : ""
      }${
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
        const tipoLabel = esPorcentaje ? "vencerá" : "pagará"
        switch (cuota.periodicidad) {
          case "semanal":
            return `El socio ahora ${tipoLabel} cada ${getDiaNombre(diaPagoNumero)} de la semana`
          case "quincenal":
            return `El socio ahora ${tipoLabel} el día ${diaPagoNumero} de cada quincena`
          default:
            return `El socio ahora ${tipoLabel} el día ${diaPagoNumero} de cada mes`
        }
      })()

      await Swal.fire({
        title: "¡Éxito!",
        html: `${esPorcentaje ? "Día de vencimiento" : "Día de pago"} actualizado exitosamente<br><small>${mensajeExito}</small>`,
        icon: "success",
        confirmButtonColor: "#dc2626",
      })

      onSuccess()
      onClose()
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al actualizar",
        icon: "error",
        confirmButtonColor: "#dc2626",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const periodosContexto = periodos
    .filter(p => p.estado === "pendiente" || p.estado === "vencido")
    .sort((a, b) => a.numero_periodo - b.numero_periodo)
    .slice(0, 4)

  const tituloModal = esPorcentaje ? "Editar Día de Vencimiento" : "Editar Día de Pago"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{tituloModal}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {esPorcentaje
                ? <>Editar día de vencimiento para: <strong>{socioNombre}</strong></>
                : <>Editar día de pago para: <strong>{socioNombre}</strong></>
              }
            </p>

            {/* Explicación para porcentaje */}
            {esPorcentaje && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                <p className="text-xs text-purple-700">
                  Este día determina cuándo vence el plazo de pago de cada período.
                  El socio deberá pagar su comisión antes de esta fecha.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="diaPago" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {(() => {
                  const prefix = esPorcentaje ? "Día de Vencimiento" : "Día de Pago"
                  switch (cuota.periodicidad) {
                    case "semanal":
                      return `${prefix} de la Semana`
                    case "quincenal":
                      return `${prefix} de la Quincena`
                    case "mensual":
                    case "diario":
                    default:
                      return `${prefix} del Mes`
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
                      const verbo = esPorcentaje ? "vencerá" : "deberá pagar"
                      switch (cuota.periodicidad) {
                        case "semanal":
                          return `El período ${verbo} cada ${getDiaNombre(parseInt(diaPago))} de la semana`
                        case "quincenal":
                          return `El período ${verbo} el día ${diaPago} de cada quincena`
                        case "mensual":
                        case "diario":
                        default:
                          return `El período ${verbo} cada día ${diaPago} del mes`
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
                  esPorcentaje
                    ? "Selecciona el día en que vencerá el plazo de pago del socio"
                    : (() => {
                        switch (cuota.periodicidad) {
                          case "semanal":
                            return "Selecciona el día de la semana en que el socio debe realizar su pago"
                          case "quincenal":
                            return "Selecciona el día de la quincena en que el socio debe realizar su pago"
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
                <p className="text-xs text-gray-600 mb-1">{esPorcentaje ? "Día de vencimiento actual:" : "Día de pago actual:"}</p>
                <p className="font-medium text-gray-900">
                  {(() => {
                    switch (cuota.periodicidad) {
                      case "semanal":
                        return `${getDiaNombre(cuota.dia_pago)} de cada semana`
                      case "quincenal":
                        return `Día ${cuota.dia_pago} de cada quincena`
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

            {/* Contexto de periodos */}
            {periodosContexto.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-medium text-blue-800">Próximos periodos del socio:</p>
                </div>
                <div className="space-y-1.5">
                  {periodosContexto.map((periodo) => (
                    <div key={periodo.id} className="flex items-center justify-between text-xs">
                      <span className="text-blue-700">
                        <span className="font-medium">#{periodo.numero_periodo}</span>{" "}
                        {formatFechCorta(periodo.periodo_inicio)} - {formatFechCorta(periodo.periodo_fin)}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        periodo.estado === "vencido" ? "bg-red-100 text-red-700"
                        : periodo.estado === "pagado" ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {periodo.estado}
                      </span>
                    </div>
                  ))}
                </div>
                {diaPago && cuota.periodicidad === "mensual" && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <p className="text-[11px] text-blue-700">
                      Con día {diaPago}, los vencimientos serán:{" "}
                      {periodosContexto.slice(0, 3).map((p, i) => (
                        <span key={p.id}>
                          {i > 0 && ", "}
                          <strong>{diaPago}/{getNombreMes(p.periodo_fin)}</strong>
                        </span>
                      ))}
                    </p>
                  </div>
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
            {loading ? "Actualizando..." : `Actualizar ${esPorcentaje ? "Vencimiento" : "Día de Pago"}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
