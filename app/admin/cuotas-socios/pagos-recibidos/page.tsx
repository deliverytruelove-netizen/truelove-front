"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Section from "@/components/layout/Section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import PagosRecibidosList from "../components/PagosRecibidosList"
import { fetchPagos, fetchEstadisticas } from "../services/cuota-socio.service"
import { Coins, CheckCircle, Clock } from "lucide-react"

export default function PagosRecibidosPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>("pendiente")

  const { data: estadisticas } = useQuery({
    queryKey: ["cuotas-socios-estadisticas"],
    queryFn: fetchEstadisticas,
  })

  const { data: pagos = [], isLoading: isLoadingPagos } = useQuery({
    queryKey: ["cuotas-pagos", filtroEstado],
    queryFn: () => fetchPagos(filtroEstado || undefined),
  })

  return (
    <div className="space-y-6">
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

      {/* Lista de pagos */}
      <Section title="">
        <div className="p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              onClick={() => setFiltroEstado("")}
              variant={filtroEstado === "" ? "default" : "outline"}
              className={filtroEstado === "" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Todos
            </Button>
            <Button
              onClick={() => setFiltroEstado("pendiente")}
              variant={filtroEstado === "pendiente" ? "default" : "outline"}
              className={filtroEstado === "pendiente" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
            >
              Pendientes
            </Button>
            <Button
              onClick={() => setFiltroEstado("aprobado")}
              variant={filtroEstado === "aprobado" ? "default" : "outline"}
              className={filtroEstado === "aprobado" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Aprobados
            </Button>
            <Button
              onClick={() => setFiltroEstado("rechazado")}
              variant={filtroEstado === "rechazado" ? "default" : "outline"}
              className={filtroEstado === "rechazado" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Rechazados
            </Button>
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
        </div>
      </Section>
    </div>
  )
}
