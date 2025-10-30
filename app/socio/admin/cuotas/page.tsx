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
import type { CuotaActiva, MiPago, PeriodoActual, Periodo } from "./types/pago-cuota.types"
import { AlertCircle } from "lucide-react"
import { calcularDiasHastaPago } from "./utils/fecha-pago.utils"

export default function CuotasSocioPage() {
  const [cuota, setCuota] = useState<CuotaActiva | null>(null)
  const [pagos, setPagos] = useState<MiPago[]>([])
  const [periodoActual, setPeriodoActual] = useState<PeriodoActual | null>(null)
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdvertenciaModal, setShowAdvertenciaModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (periodoActual && periodoActual.periodo) {
      const { dias_para_vencer, estado } = periodoActual.periodo
      if (estado === "pendiente" && dias_para_vencer !== undefined && dias_para_vencer <= 5) {
        setShowAdvertenciaModal(true)
      }
    }
  }, [periodoActual])

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={loadData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Cuotas</h1>
          <p className="text-gray-600 mt-2">Gestiona tus pagos de cuotas por período</p>
        </div>

        <div className="space-y-8">
          {/* Recordatorio de Pago */}
          {cuota && cuota.dia_pago && (
            <RecordatorioPagoCard 
              cuota={cuota} 
              diasRestantes={calcularDiasHastaPago(cuota.dia_pago)} 
            />
          )}

          {/* Información de la Cuota */}
          {cuota && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CuotaActivaCard cuota={cuota} />

              {periodoActual && periodoActual.puede_pagar && periodoActual.periodo && (
                <div id="formulario-pago">
                  <SubirComprobanteForm
                    periodoId={periodoActual.periodo.id}
                    montoPeriodo={periodoActual.periodo.monto_esperado}
                    periodosDisponibles={periodos.filter(p => p.estado === 'pendiente' || p.estado === 'vencido').length}
                    onSuccess={loadData}
                  />
                </div>
              )}

              {periodoActual && !periodoActual.puede_pagar && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-yellow-800 font-semibold">Período Actual</h3>
                    <p className="text-yellow-700 mt-1">{periodoActual.mensaje || "No puedes pagar en este momento"}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Períodos de Pago */}
          {periodos.length > 0 && <PeriodosList periodos={periodos} periodoActualId={periodoActual?.periodo?.id} />}

          {/* Historial de Pagos */}
          <HistorialPagos pagos={pagos} />
        </div>

        {/* Modal de Advertencia de Vencimiento */}
        {showAdvertenciaModal && periodoActual && periodoActual.periodo && (
          <AdvertenciaVencimientoModal
            periodo={periodoActual.periodo}
            onClose={() => setShowAdvertenciaModal(false)}
          />
        )}
      </div>
    </div>
  )
}
