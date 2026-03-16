"use client"

import { useState, useEffect } from "react"
import {
  fetchCuotaActiva,
  fetchMisPagos,
  fetchMiPeriodoActual,
  fetchMisPeriodos,
} from "./services/pago-cuota.service"
import CuotaActivaCard from "./components/CuotaActivaCard"
import SubirComprobanteForm from "./components/SubirComprobanteForm"
import HistorialPagos from "./components/HistorialPagos"
import PeriodosList from "./components/PeriodosList"
import AdvertenciaVencimientoModal from "./components/AdvertenciaVencimientoModal"
import RecordatorioPagoCard from "./components/RecordatorioPagoCard"
import PedidosPeriodoList from "./components/PedidosPeriodoList"
import type { CuotaActiva, MiPago, PeriodoActual, Periodo } from "./types/pago-cuota.types"
import { AlertCircle, Coins, Percent, RefreshCw, Upload } from "lucide-react"
import { calcularDiasHastaPago, calcularDiasHastaFecha } from "./utils/fecha-pago.utils"
import { Button } from "@/components/ui/button"

export default function CuotasSocioPage() {
  const [cuota, setCuota] = useState<CuotaActiva | null>(null)
  const [pagos, setPagos] = useState<MiPago[]>([])
  const [periodoActual, setPeriodoActual] = useState<PeriodoActual | null>(null)
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdvertenciaModal, setShowAdvertenciaModal] = useState(false)
  const [showPagoModal, setShowPagoModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (periodoActual && periodoActual.periodo) {
      const { dias_para_vencer, estado, monto_esperado } = periodoActual.periodo
      // Para porcentaje: no mostrar advertencia si no hay monto calculado
      const monto = Number(monto_esperado || 0)
      const esTipoPorcentaje = cuota?.tipo_cuota === "porcentaje"
      if (esTipoPorcentaje && monto <= 0) return

      if (estado === "vencido") {
        setShowAdvertenciaModal(true)
      } else if (estado === "pendiente" && dias_para_vencer !== undefined && dias_para_vencer <= 5) {
        setShowAdvertenciaModal(true)
      }
    }
  }, [periodoActual, cuota])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [cuotaData, pagosData, periodoActualData, periodosData] = await Promise.all([
        fetchCuotaActiva(),
        fetchMisPagos(),
        fetchMiPeriodoActual(),
        fetchMisPeriodos(),
      ])
      setCuota(cuotaData)
      setPagos(pagosData)
      setPeriodoActual(periodoActualData)
      setPeriodos(periodosData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 dark:text-red-300 font-semibold">Error al cargar</h3>
            <p className="text-red-700 dark:text-red-400 mt-1 text-sm">{error}</p>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const esPorcentaje = cuota?.tipo_cuota === "porcentaje"

  // Para porcentaje: verificar si realmente hay monto por pagar
  // No tiene sentido mostrar recordatorio ni formulario si la comisión es S/ 0.00
  const montoDelPeriodo = periodoActual?.periodo?.monto_esperado ? Number(periodoActual.periodo.monto_esperado) : 0
  const tieneMontoParaPagar = !esPorcentaje || montoDelPeriodo > 0

  // Días restantes: para porcentaje usar fecha_vencimiento, para fijo usar dia_pago
  const diasRestantesRecordatorio = (() => {
    if (esPorcentaje && periodoActual?.periodo?.fecha_vencimiento) {
      return calcularDiasHastaFecha(periodoActual.periodo.fecha_vencimiento)
    }
    if (!cuota?.dia_pago) return null
    return calcularDiasHastaPago(cuota.dia_pago, cuota.periodicidad)
  })()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
              {esPorcentaje ? <Percent className="w-5 h-5 text-brand-600 dark:text-brand-400" /> : <Coins className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {esPorcentaje ? "Mis Comisiones" : "Mis Cuotas"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {esPorcentaje
                  ? "Gestiona tus pagos de comisiones por período"
                  : "Gestiona tus pagos de cuotas por período"
                }
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {/* Recordatorio de Pago - solo si hay monto real por pagar */}
          {cuota && tieneMontoParaPagar && diasRestantesRecordatorio !== null && (
            <RecordatorioPagoCard
              cuota={cuota}
              diasRestantes={diasRestantesRecordatorio}
              periodoActual={esPorcentaje ? periodoActual?.periodo : undefined}
            />
          )}

          {/* Cuota Activa */}
          {cuota && (
            <CuotaActivaCard cuota={cuota} periodoActual={periodoActual?.periodo} />
          )}

          {/* Alerta de período vencido */}
          {periodoActual?.periodo?.estado === "vencido" && tieneMontoParaPagar && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-800 dark:text-red-300 font-semibold text-sm">Pago vencido</h3>
                <p className="text-red-700 dark:text-red-400 mt-1 text-sm">
                  Tienes un período vencido (#{periodoActual.periodo.numero_periodo}). Por favor, realiza el pago lo antes posible para evitar restricciones en tu cuenta.
                </p>
              </div>
            </div>
          )}

          {/* Botón Pagar */}
          {cuota && periodoActual && periodoActual.puede_pagar && periodoActual.periodo && tieneMontoParaPagar && (
            <Button
              onClick={() => setShowPagoModal(true)}
              className={`w-full py-3 font-semibold text-sm text-white ${
                periodoActual.periodo.estado === "vencido"
                  ? "bg-red-600 hover:bg-red-700 animate-pulse"
                  : "bg-brand-600 hover:bg-brand-700"
              }`}
              id="formulario-pago"
            >
              <Upload className="w-4 h-4 mr-2" />
              {periodoActual.periodo.estado === "vencido" ? "Pagar ahora" : "Pagar"} S/ {Number(periodoActual.periodo.monto_esperado || 0).toFixed(2)}
            </Button>
          )}

          {/* Para porcentaje sin monto: mensaje informativo */}
          {esPorcentaje && periodoActual && periodoActual.puede_pagar && !tieneMontoParaPagar && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex items-start gap-3">
              <Percent className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Período en curso</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                  Aún no hay comisión calculada para este período. El monto se actualizará conforme se registren ventas.
                </p>
              </div>
            </div>
          )}

          {periodoActual && !periodoActual.puede_pagar && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold text-sm">Período Actual</h3>
                <p className="text-yellow-700 dark:text-yellow-400 mt-1 text-sm">{periodoActual.mensaje || "No puedes pagar en este momento"}</p>
              </div>
            </div>
          )}

          {/* Pedidos del Período - solo para porcentaje */}
          {esPorcentaje && periodoActual?.periodo && (
            <PedidosPeriodoList
              periodoId={periodoActual.periodo.id}
              porcentajeComision={cuota?.porcentaje_comision ? Number(cuota.porcentaje_comision) : null}
            />
          )}

          {/* Períodos */}
          {periodos.length > 0 && (
            <PeriodosList
              periodos={periodos}
              periodoActualId={periodoActual?.periodo?.id}
              tipoCuota={cuota?.tipo_cuota}
            />
          )}

          {/* Historial de Pagos */}
          <HistorialPagos pagos={pagos} />
        </div>

        {/* Modal de Advertencia */}
        {showAdvertenciaModal && periodoActual && periodoActual.periodo && (
          <AdvertenciaVencimientoModal
            periodo={periodoActual.periodo}
            onClose={() => setShowAdvertenciaModal(false)}
            onPagar={() => setShowPagoModal(true)}
          />
        )}

        {/* Modal de Pago */}
        {cuota && periodoActual?.periodo && (
          <SubirComprobanteForm
            periodoId={periodoActual.periodo.id}
            montoPeriodo={periodoActual.periodo.monto_esperado}
            periodosDisponibles={periodos.filter(p => p.estado === 'pendiente' || p.estado === 'vencido').length}
            tipoCuota={cuota.tipo_cuota}
            onSuccess={loadData}
            isOpen={showPagoModal}
            onClose={() => setShowPagoModal(false)}
          />
        )}
      </div>
    </div>
  )
}
