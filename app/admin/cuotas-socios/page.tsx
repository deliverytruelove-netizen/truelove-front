"use client"

import { useState, useEffect, useCallback } from "react"
import MainLayout from "../components/MainLayout"
import CuotasList from "./components/CuotasList"
import CrearCuotaModal from "./components/CrearCuotaModal"
import EditarCuotaModal from "./components/EditarCuotaModal"
import PagosRecibidosList from "./components/PagosRecibidosList"
import { fetchCuotas, fetchPagos, fetchEstadisticas } from "./services/cuota-socio.service"
import type { CuotaSocio, PagoCuotaSocio, EstadisticasPagos } from "./types/cuota-socio.types"
import { Plus, Coins, CheckCircle, Clock } from "lucide-react"

export default function CuotasSocios() {
  const [cuotas, setCuotas] = useState<CuotaSocio[]>([])
  const [pagos, setPagos] = useState<PagoCuotaSocio[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasPagos | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"cuotas" | "pagos">("cuotas")
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [cuotaToEdit, setCuotaToEdit] = useState<CuotaSocio | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>("pendiente")

  const loadData = async () => {
    setLoading(true)
    try {
      const [cuotasData, estadisticasData] = await Promise.all([fetchCuotas(), fetchEstadisticas()])
      setCuotas(cuotasData)
      setEstadisticas(estadisticasData)

      if (activeTab === "pagos") {
        const pagosData = await fetchPagos(filtroEstado)
        setPagos(pagosData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPagos = useCallback(async (estado?: string) => {
    try {
      const pagosData = await fetchPagos(estado)
      setPagos(pagosData)
    } catch (error) {
      console.error("Error loading pagos:", error)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "pagos") {
      loadPagos(filtroEstado)
    }
  }, [activeTab, filtroEstado, loadPagos])

  const handleEdit = (cuota: CuotaSocio) => {
    setCuotaToEdit(cuota)
    setShowEditarModal(true)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end items-center">
          <button
            onClick={() => setShowCrearModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Cuota
          </button>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pagos</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.total_pagos}</p>
                </div>
                <Coins className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{estadisticas.pagos_pendientes}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">{estadisticas.pagos_aprobados}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monto Aprobado</p>
                  <p className="text-2xl font-bold text-gray-900">S/ {Number(estadisticas.monto_total_aprobado).toFixed(2)}</p>
                </div>
                <Coins className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("cuotas")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "cuotas"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Cuotas Configuradas
              </button>
              <button
                onClick={() => setActiveTab("pagos")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "pagos"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pagos Recibidos
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "cuotas" && (
              <>
                {loading ? (
                  <div className="text-center py-8">Cargando...</div>
                ) : (
                  <CuotasList cuotas={cuotas} onEdit={handleEdit} onRefresh={loadData} />
                )}
              </>
            )}

            {activeTab === "pagos" && (
              <>
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setFiltroEstado("")}
                    className={`px-4 py-2 rounded-lg ${
                      filtroEstado === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado("pendiente")}
                    className={`px-4 py-2 rounded-lg ${
                      filtroEstado === "pendiente" ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Pendientes
                  </button>
                  <button
                    onClick={() => setFiltroEstado("aprobado")}
                    className={`px-4 py-2 rounded-lg ${
                      filtroEstado === "aprobado" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Aprobados
                  </button>
                  <button
                    onClick={() => setFiltroEstado("rechazado")}
                    className={`px-4 py-2 rounded-lg ${
                      filtroEstado === "rechazado" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Rechazados
                  </button>
                </div>

                <PagosRecibidosList pagos={pagos} onRefresh={() => loadPagos(filtroEstado)} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <CrearCuotaModal isOpen={showCrearModal} onClose={() => setShowCrearModal(false)} onSuccess={loadData} />

      <EditarCuotaModal
        isOpen={showEditarModal}
        cuota={cuotaToEdit}
        onClose={() => {
          setShowEditarModal(false)
          setCuotaToEdit(null)
        }}
        onSuccess={loadData}
      />
    </MainLayout>
  )
}