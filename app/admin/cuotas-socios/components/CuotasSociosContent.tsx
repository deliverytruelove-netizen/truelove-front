"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Section from "@/components/layout/Section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import CuotasList from "./CuotasList"
import CrearCuotaModal from "./CrearCuotaModal"
import EditarCuotaModal from "./EditarCuotaModal"
import PagosRecibidosList from "./PagosRecibidosList"
import { fetchCuotas, fetchPagos, fetchEstadisticas } from "../services/cuota-socio.service"
import type { CuotaSocio } from "../types/cuota-socio.types"
import { Plus, Coins, CheckCircle, Clock } from "lucide-react"

export default function CuotasSociosContent() {
  const [activeTab, setActiveTab] = useState<"cuotas" | "pagos">("cuotas")
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [cuotaToEdit, setCuotaToEdit] = useState<CuotaSocio | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>("pendiente")

  const { data: cuotas = [], isLoading: isLoadingCuotas } = useQuery({
    queryKey: ["cuotas-socios"],
    queryFn: fetchCuotas,
  })

  const { data: estadisticas } = useQuery({
    queryKey: ["cuotas-socios-estadisticas"],
    queryFn: fetchEstadisticas,
  })

  const { data: pagos = [], isLoading: isLoadingPagos } = useQuery({
    queryKey: ["cuotas-pagos", filtroEstado],
    queryFn: () => fetchPagos(filtroEstado || undefined),
    enabled: activeTab === "pagos",
  })

  const handleEdit = (cuota: CuotaSocio) => {
    setCuotaToEdit(cuota)
    setShowEditarModal(true)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end items-center">
          <Button
            onClick={() => setShowCrearModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-5 h-5" />
            Nueva Cuota
          </Button>
        </div>

        {/* Estadísticas */}
        {estadisticas ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[80px] w-full" />
            ))}
          </div>
        )}

        {/* Tabs */}
        <Section title="">
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
                {isLoadingCuotas ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-[60px] w-full" />
                    ))}
                  </div>
                ) : (
                  <CuotasList cuotas={cuotas} onEdit={handleEdit} />
                )}
              </>
            )}
            {activeTab === "pagos" && (
              <>
                <div className="mb-4 flex gap-2">
                  <Button onClick={() => setFiltroEstado("")} variant={filtroEstado === "" ? "default" : "outline"} className={filtroEstado === "" ? "bg-blue-600 hover:bg-blue-700" : ""}>Todos</Button>
                  <Button onClick={() => setFiltroEstado("pendiente")} variant={filtroEstado === "pendiente" ? "default" : "outline"} className={filtroEstado === "pendiente" ? "bg-yellow-600 hover:bg-yellow-700" : ""}>Pendientes</Button>
                  <Button onClick={() => setFiltroEstado("aprobado")} variant={filtroEstado === "aprobado" ? "default" : "outline"} className={filtroEstado === "aprobado" ? "bg-green-600 hover:bg-green-700" : ""}>Aprobados</Button>
                  <Button onClick={() => setFiltroEstado("rechazado")} variant={filtroEstado === "rechazado" ? "default" : "outline"} className={filtroEstado === "rechazado" ? "bg-red-600 hover:bg-red-700" : ""}>Rechazados</Button>
                </div>
                {isLoadingPagos ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-[60px] w-full" />
                    ))}
                  </div>
                ) : (
                  <PagosRecibidosList pagos={pagos} />
                )}
              </>
            )}
          </div>
        </Section>
      </div>

      <CrearCuotaModal isOpen={showCrearModal} onClose={() => setShowCrearModal(false)} />
      <EditarCuotaModal isOpen={showEditarModal} cuota={cuotaToEdit} onClose={() => { setShowEditarModal(false); setCuotaToEdit(null) }} />
    </>
  )
}
