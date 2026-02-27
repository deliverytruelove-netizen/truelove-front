"use client"

import { useState, useEffect, useMemo } from "react"
import { X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Swal from "sweetalert2"
import { fetchCuotasActivas, asignarCuotaASocio, type CuotaSocio } from "@/app/admin/cuotas-socios/services/cuota-admin.service"

interface AsignarCuotaModalProps {
  isOpen: boolean
  socioId: number
  socioNombre: string
  onClose: () => void
  onSuccess: () => void
}

export default function AsignarCuotaModal({
  isOpen,
  socioId,
  socioNombre,
  onClose,
  onSuccess,
}: AsignarCuotaModalProps) {
  const [loading, setLoading] = useState(false)
  const [cuotas, setCuotas] = useState<CuotaSocio[]>([])
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState("")
  const [loadingCuotas, setLoadingCuotas] = useState(false)
  const [cantidadPeriodos, setCantidadPeriodos] = useState(12)
  const [fechaInicio, setFechaInicio] = useState<string>("")
  const [diaPago, setDiaPago] = useState<string>("0")

  useEffect(() => {
    if (isOpen) {
      cargarCuotas()
      // Inicializar con la fecha de hoy en formato YYYY-MM-DD
      const hoy = new Date()
      const year = hoy.getFullYear()
      const month = String(hoy.getMonth() + 1).padStart(2, '0')
      const day = String(hoy.getDate()).padStart(2, '0')
      setFechaInicio(`${year}-${month}-${day}`)
    }
  }, [isOpen])



  const cargarCuotas = async () => {
    setLoadingCuotas(true)
    try {
      const cuotasActivas = await fetchCuotasActivas()
      // Filtrar solo cuotas con estado "activo"
      const cuotasFiltradas = cuotasActivas.filter((c) => c.estado === "activo")
      setCuotas(cuotasFiltradas)
    } catch (error) {
      console.error("Error al cargar cuotas:", error)
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "No se pudieron cargar las cuotas disponibles",
        icon: "error",
        confirmButtonColor: "#dc2626",
      })
    } finally {
      setLoadingCuotas(false)
    }
  }

  // Generar vista previa de períodos
  const periodosPreview = useMemo(() => {
    if (!cuotaSeleccionada || !fechaInicio) return []

    const cuota = cuotas.find((c) => c.id.toString() === cuotaSeleccionada)
    if (!cuota) return []

    const periodos = []
    // Parsear la fecha correctamente para evitar problemas de zona horaria
    const [year, month, day] = fechaInicio.split('-').map(Number)
    const fechaInicioSeleccionada = new Date(year, month - 1, day)
    fechaInicioSeleccionada.setHours(0, 0, 0, 0)

    let fechaFin: Date = new Date()

    for (let i = 0; i < cantidadPeriodos; i++) {
      const periodoInicio = i === 0 ? new Date(fechaInicioSeleccionada) : new Date(fechaFin)
      if (i > 0) periodoInicio.setDate(periodoInicio.getDate() + 1)

      switch (cuota.periodicidad) {
        case "diario":
          fechaFin = new Date(periodoInicio)
          fechaFin.setHours(23, 59, 59)
          break
        case "semanal":
          fechaFin = new Date(periodoInicio)
          fechaFin.setDate(fechaFin.getDate() + 6)
          break
        case "quincenal":
          fechaFin = new Date(periodoInicio)
          fechaFin.setDate(fechaFin.getDate() + 13)
          break
        case "mensual":
          fechaFin = new Date(periodoInicio)
          fechaFin.setMonth(fechaFin.getMonth() + 1)
          fechaFin.setDate(fechaFin.getDate() - 1)
          break
        default:
          fechaFin = new Date(periodoInicio)
          fechaFin.setDate(fechaFin.getDate() + 6)
      }

      periodos.push({
        numero: i + 1,
        fechaInicio: periodoInicio,
        fechaFin,
        monto: cuota.tipo_cuota === "porcentaje" ? 0 : cuota.monto_cuota,
      })
    }

    return periodos
  }, [cuotaSeleccionada, cantidadPeriodos, cuotas, fechaInicio])

  // Auto-detectar el día de pago según la fecha de inicio y periodicidad
  useEffect(() => {
    if (!cuotaSeleccionada || !fechaInicio) return

    const cuota = cuotas.find((c) => c.id.toString() === cuotaSeleccionada)
    if (!cuota) return

    // Para porcentaje: no auto-detectar dia_pago, el vencimiento es automáticamente el fin del período
    if (cuota.tipo_cuota === "porcentaje") {
      setDiaPago("0")
      return
    }

    const [year, month, day] = fechaInicio.split('-').map(Number)
    const fecha = new Date(year, month - 1, day)

    if (cuota.periodicidad === "semanal") {
      // Para semanal: auto-detectar día de la semana (1=Lunes ... 7=Domingo)
      const jsDay = fecha.getDay() // 0=Dom, 1=Lun ... 6=Sab
      const diaSemana = jsDay === 0 ? 7 : jsDay // Convertir: Dom=7, Lun=1 ... Sab=6
      setDiaPago(diaSemana.toString())
    } else if (cuota.periodicidad === "mensual" || cuota.periodicidad === "diario") {
      // Para mensual: usar el día del mes de la fecha de inicio
      setDiaPago(fecha.getDate().toString())
    } else if (cuota.periodicidad === "quincenal") {
      const diaQuincena = Math.min(fecha.getDate(), 15)
      setDiaPago(diaQuincena.toString())
    }
  }, [cuotaSeleccionada, cuotas, fechaInicio])

  // Función auxiliar para formatear fechas
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  const handleAsignar = async () => {
    if (!cuotaSeleccionada) {
      await Swal.fire({
        title: "Cuota requerida",
        text: "Debes seleccionar una cuota",
        icon: "warning",
        confirmButtonColor: "#dc2626",
      })
      return
    }

    const diaPagoNumero = diaPago && diaPago !== "0" ? parseInt(diaPago) : undefined

    // Obtener la cuota seleccionada para determinar la periodicidad
    const cuota = cuotas.find((c) => c.id.toString() === cuotaSeleccionada)

    // Generar el texto del día de pago según la periodicidad
    let diaPagoTexto = ""
    if (cuota?.tipo_cuota === "porcentaje" && !diaPagoNumero) {
      diaPagoTexto = " El vencimiento será automáticamente al final de cada período."
    } else if (diaPagoNumero && cuota) {
      switch (cuota.periodicidad) {
        case "semanal":
          const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
          diaPagoTexto = ` El día de pago será cada <strong>${diasSemana[diaPagoNumero]}</strong> de la semana.`
          break
        case "quincenal":
          diaPagoTexto = ` El día de pago será el día <strong>${diaPagoNumero}</strong> de cada quincena.`
          break
        case "mensual":
          diaPagoTexto = ` El día de pago será el día <strong>${diaPagoNumero}</strong> de cada mes.`
          break
        case "diario":
          diaPagoTexto = ` El día de pago será el día <strong>${diaPagoNumero}</strong> de cada mes.`
          break
        default:
          diaPagoTexto = ` El día de pago será el día <strong>${diaPagoNumero}</strong>.`
      }
    }

    const cuotaConfirm = cuotas.find((c) => c.id.toString() === cuotaSeleccionada)
    const esPorcentajeConfirm = cuotaConfirm?.tipo_cuota === "porcentaje"

    const result = await Swal.fire({
      title: "¿Confirmar asignación?",
      html: esPorcentajeConfirm
        ? `Se asignará comisión del <strong>${Number(cuotaConfirm.porcentaje_comision || 0).toFixed(2)}%</strong> sobre ventas a:<br><strong>${socioNombre}</strong><br><br>La comisión se cobrará de forma <strong>${cuotaConfirm.periodicidad}</strong> mientras tenga la cuota asignada.${diaPagoTexto}`
        : `Se asignará la cuota a:<br><strong>${socioNombre}</strong><br><br>Se generarán automáticamente <strong>${cantidadPeriodos}</strong> período${cantidadPeriodos !== 1 ? "s" : ""} de pago.${diaPagoTexto}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, asignar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    setLoading(true)
    try {
      // Para porcentaje, enviar 12 períodos internamente (el backend los necesita para tracking)
      const periodosAEnviar = esPorcentajeConfirm ? 12 : cantidadPeriodos
      await asignarCuotaASocio(socioId, parseInt(cuotaSeleccionada), periodosAEnviar, fechaInicio, diaPagoNumero)

      await Swal.fire({
        title: "¡Éxito!",
        html: esPorcentajeConfirm
          ? `Comisión del ${Number(cuotaConfirm.porcentaje_comision || 0).toFixed(2)}% asignada exitosamente a <strong>${socioNombre}</strong>${diaPagoTexto}`
          : `Cuota asignada exitosamente<br><small>${cantidadPeriodos} período${cantidadPeriodos !== 1 ? "s" : ""} generado${cantidadPeriodos !== 1 ? "s" : ""}</small><br>${diaPagoTexto}`,
        icon: "success",
        confirmButtonColor: "#dc2626",
      })

      onSuccess()
      onClose()
      setCuotaSeleccionada("")
      setDiaPago("0")
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al asignar cuota",
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Asignar Cuota</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Asignar cuota a: <strong>{socioNombre}</strong>
            </p>

            <div className={`grid grid-cols-1 ${(() => { const c = cuotas.find(c => c.id.toString() === cuotaSeleccionada); return !c || c.tipo_cuota === "monto_fijo" ? "md:grid-cols-2" : "" })()} gap-4`}>
              <div className="space-y-2">
                <Label htmlFor="cuota">Seleccionar Cuota</Label>
                <Select value={cuotaSeleccionada} onValueChange={setCuotaSeleccionada} disabled={loadingCuotas}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCuotas ? "Cargando..." : "Seleccionar cuota"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cuotas.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No hay cuotas activas disponibles
                      </div>
                    ) : (
                      cuotas.map((cuota) => (
                        <SelectItem key={cuota.id} value={cuota.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {cuota.periodicidad.charAt(0).toUpperCase() + cuota.periodicidad.slice(1)} -
                              {cuota.tipo_cuota === "porcentaje" ? (
                                <span className="text-purple-600">
                                  {" "}{Number(cuota.porcentaje_comision || 0).toFixed(2)}% comisión
                                  {cuota.minimo_pedidos && ` (Mín. ${cuota.minimo_pedidos} pedidos)`}
                                </span>
                              ) : (
                                <span> S/ {Number(cuota.monto_cuota).toFixed(2)}</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {cuota.banco} - {cuota.numero_cuenta}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Cantidad de períodos: solo visible para monto fijo */}
              {(() => {
                const cuota = cuotas.find(c => c.id.toString() === cuotaSeleccionada)
                if (cuota?.tipo_cuota === "porcentaje") return null
                return (
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad de Períodos</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      min="1"
                      max="24"
                      value={cantidadPeriodos}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1
                        setCantidadPeriodos(Math.min(Math.max(value, 1), 24))
                      }}
                      disabled={!cuotaSeleccionada}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Mínimo: 1, Máximo: 24</p>
                  </div>
                )
              })()}
            </div>

            <div className={`grid grid-cols-1 ${(() => { const c = cuotas.find(c => c.id.toString() === cuotaSeleccionada); return c?.tipo_cuota === "porcentaje" ? "" : "md:grid-cols-2" })()} gap-4 mt-4`}>
              <div className="space-y-2">
                <Label htmlFor="fechaInicio" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {(() => {
                    const cuota = cuotas.find(c => c.id.toString() === cuotaSeleccionada)
                    return cuota?.tipo_cuota === "porcentaje"
                      ? "Inicio del primer periodo"
                      : "Fecha de Inicio de Períodos"
                  })()}
                </Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  disabled={!cuotaSeleccionada}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  {(() => {
                    const cuota = cuotas.find(c => c.id.toString() === cuotaSeleccionada)
                    return cuota?.tipo_cuota === "porcentaje"
                      ? "Desde esta fecha se empezará a contabilizar las ventas del socio. El vencimiento de cada período será automáticamente el último día del período."
                      : "Selecciona desde qué fecha comenzarán a contar los períodos de pago"
                  })()}
                </p>
              </div>

              {/* Día de pago: solo para monto fijo */}
              {(() => {
                const cuota = cuotas.find(c => c.id.toString() === cuotaSeleccionada)
                if (cuota?.tipo_cuota === "porcentaje") return null
                return (
              <div className="space-y-2">
                <Label htmlFor="diaPago" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {(() => {
                    if (!cuota) return "Día de Pago"
                    switch (cuota.periodicidad) {
                      case "semanal": return "Día de Pago de la Semana"
                      case "quincenal": return "Día de Pago de la Quincena"
                      case "mensual": return "Día de Pago del Mes"
                      case "diario": return "Día de Pago del Mes"
                      default: return "Día de Pago"
                    }
                  })()}
                </Label>
                <Select value={diaPago} onValueChange={setDiaPago} disabled={!cuotaSeleccionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar día (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin día específico</SelectItem>
                    {(() => {
                      if (!cuota) return null

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
                  {(() => {
                    if (!cuota || !diaPago || diaPago === "0") {
                      return "Si no se especifica, se usará el día de la fecha de inicio"
                    }

                    switch (cuota.periodicidad) {
                      case "semanal":
                        const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
                        return `El socio deberá pagar cada ${diasSemana[parseInt(diaPago)]} de la semana`
                      case "quincenal":
                        return `El socio deberá pagar el día ${diaPago} de cada quincena`
                      case "mensual":
                        return (
                          <>
                            El socio deberá pagar cada día {diaPago} del mes
                            {parseInt(diaPago) > 28 && (
                              <div className="text-amber-600 mt-1">
                                * En meses con menos días, se usará el último día del mes
                              </div>
                            )}
                          </>
                        )
                      case "diario":
                        return `El socio deberá pagar cada día ${diaPago} del mes`
                      default:
                        return `El socio deberá pagar según el día ${diaPago} configurado`
                    }
                  })()}
                </div>
              </div>
                )
              })()}
            </div>



            {/* Resumen para porcentaje (sin vista previa de períodos) */}
            {(() => {
              const cuota = cuotas.find(c => c.id.toString() === cuotaSeleccionada)
              if (!cuota || cuota.tipo_cuota !== "porcentaje") return null

              return (
                <div className="mt-4 space-y-3">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">Resumen de Comisión</h4>
                    <div className="space-y-1 text-sm text-purple-700">
                      <p>
                        <strong>Comisión:</strong> {Number(cuota.porcentaje_comision || 0).toFixed(2)}% sobre las ventas del socio
                      </p>
                      <p>
                        <strong>Cobro:</strong> {cuota.periodicidad.charAt(0).toUpperCase() + cuota.periodicidad.slice(1)} (se calcula automáticamente al cierre de cada periodo)
                      </p>
                      {cuota.monto_minimo && (
                        <p>
                          <strong>Monto mínimo:</strong> S/ {Number(cuota.monto_minimo).toFixed(2)}
                        </p>
                      )}
                      {cuota.monto_uso_app && (
                        <p>
                          <strong>Uso de app:</strong> S/ {Number(cuota.monto_uso_app).toFixed(2)} (si no alcanza el mínimo)
                        </p>
                      )}
                      <p className="text-purple-500 italic">Sin tope máximo (se cobra el porcentaje real de las ventas)</p>
                      {cuota.minimo_pedidos && (
                        <p>
                          <strong>Mínimo de pedidos:</strong> {cuota.minimo_pedidos}
                          {cuota.exonerar_si_menos_pedidos && " (exonerado si no cumple)"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs text-green-800">
                      La comisión se cobra de forma <strong>continua</strong> mientras el socio tenga esta cuota asignada. El sistema calculará automáticamente el monto basado en las ventas de cada periodo.
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Vista previa de períodos: solo para monto fijo */}
            {(() => {
              const cuota = cuotas.find(c => c.id.toString() === cuotaSeleccionada)
              if (!cuota || cuota.tipo_cuota === "porcentaje") return null
              if (!periodosPreview.length) return null

              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Vista Previa de Períodos</Label>
                    <span className="text-xs text-gray-500">
                      {periodosPreview.length} período{periodosPreview.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 text-green-800">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        {(() => {
                          const primerPeriodo = periodosPreview[0]
                          if (!primerPeriodo) return ""

                          const periodicidadTexto = {
                            diario: "Períodos diarios",
                            semanal: "Períodos semanales",
                            quincenal: "Períodos quincenales",
                            mensual: "Períodos mensuales"
                          }[cuota.periodicidad] || cuota.periodicidad

                          return `${periodicidadTexto} desde el ${formatDate(primerPeriodo.fechaInicio)}`
                        })()}
                      </span>
                    </div>
                    {diaPago && diaPago !== "0" && (
                      <p className="text-xs text-green-700 mt-1">
                        <strong>Día de pago:</strong> {(() => {
                          switch (cuota.periodicidad) {
                            case "semanal":
                              const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
                              return `Cada ${diasSemana[parseInt(diaPago)]} de la semana`
                            case "quincenal":
                              return `Día ${diaPago} de cada quincena`
                            case "mensual":
                            case "diario":
                            default:
                              return `Día ${diaPago} de cada mes`
                          }
                        })()}
                      </p>
                    )}
                    {(!diaPago || diaPago === "0") && (
                      <p className="text-xs text-green-700 mt-1">
                        <strong>Día de pago:</strong> Se calculará automáticamente según la fecha de inicio
                      </p>
                    )}
                  </div>
                  <div className="border rounded-md max-h-64 overflow-y-auto">
                    {periodosPreview.map((periodo, index) => (
                      <div
                        key={periodo.numero}
                        className={`flex items-center justify-between p-3 ${
                          index !== periodosPreview.length - 1 ? "border-b" : ""
                        } hover:bg-gray-50 transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                            {periodo.numero}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(periodo.fechaInicio)} - {formatDate(periodo.fechaFin)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          S/ {Number(periodo.monto).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-800">
                      <strong>Total:</strong> S/ {(periodosPreview.reduce((sum, p) => sum + Number(p.monto), 0)).toFixed(2)} en {periodosPreview.length} período{periodosPreview.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              )
            })()}

            {!cuotaSeleccionada && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> Selecciona una cuota para ver los detalles.
                </p>
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
            onClick={handleAsignar}
            disabled={loading || !cuotaSeleccionada || loadingCuotas}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Asignando..." : "Asignar Cuota"}
          </Button>
        </div>
      </div>
    </div>
  )
}
