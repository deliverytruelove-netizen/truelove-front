"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Section from "@/components/layout/Section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import CuotasList from "./components/CuotasList"
import CrearCuotaModal from "./components/CrearCuotaModal"
import EditarCuotaModal from "./components/EditarCuotaModal"
import { fetchCuotas, fetchEstadisticas } from "./services/cuota-socio.service"
import type { CuotaSocio } from "./types/cuota-socio.types"
import { Plus, Coins, CheckCircle, Clock } from "lucide-react"

export default function CuotasSociosPage() {
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [cuotaToEdit, setCuotaToEdit] = useState<CuotaSocio | null>(null)

  const { data: cuotas = [], isLoading: isLoadingCuotas } = useQuery({
    queryKey: ["cuotas-socios"],
    queryFn: fetchCuotas,
  })

  const { data: estadisticas } = useQuery({
    queryKey: ["cuotas-socios-estadisticas"],
    queryFn: fetchEstadisticas,
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
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[80px] w-full" />
            ))}
          </div>
        )}

        {/* Lista de cuotas */}
        <Section title="">
          <div className="p-6">
            {isLoadingCuotas ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[60px] w-full" />
                ))}
              </div>
            ) : (
              <CuotasList cuotas={cuotas} onEdit={handleEdit} />
            )}
          </div>
        </Section>
      </div>

      <CrearCuotaModal isOpen={showCrearModal} onClose={() => setShowCrearModal(false)} />
      <EditarCuotaModal key={cuotaToEdit?.id} isOpen={showEditarModal} cuota={cuotaToEdit} onClose={() => { setShowEditarModal(false); setCuotaToEdit(null) }} />
    </>
  )
}
