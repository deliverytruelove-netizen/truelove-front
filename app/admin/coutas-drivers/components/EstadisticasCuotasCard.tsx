// app\admin\coutas-drivers\components\EstadisticasCuotasCard.tsx
"use client"

import type React from "react"
import { DollarSign, Users, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import type { EstadisticasCuotas } from "../types/cuota.types"

interface EstadisticasCuotasCardProps {
  estadisticas: EstadisticasCuotas
}

export const EstadisticasCuotasCard: React.FC<EstadisticasCuotasCardProps> = ({ estadisticas }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount)
  }

  const porcentajePagadas = estadisticas.total_cuotas > 0 
    ? ((estadisticas.cuotas_pagadas / estadisticas.total_cuotas) * 100).toFixed(1)
    : "0"

  const porcentajeCobrado = estadisticas.monto_total > 0
    ? ((estadisticas.monto_cobrado / estadisticas.monto_total) * 100).toFixed(1)
    : "0"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de Cuotas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Cuotas</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.total_cuotas}</p>
          </div>
        </div>
      </div>

      {/* Cuotas Pagadas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Pagadas</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.cuotas_pagadas}</p>
            <p className="text-xs text-green-600">{porcentajePagadas}% del total</p>
          </div>
        </div>
      </div>

      {/* Cuotas Pendientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.cuotas_pendientes}</p>
          </div>
        </div>
      </div>

      {/* Cuotas Vencidas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Vencidas</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.cuotas_vencidas}</p>
          </div>
        </div>
      </div>

      {/* Monto Total */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Monto Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.monto_total)}</p>
          </div>
        </div>
      </div>

      {/* Monto Cobrado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Cobrado</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.monto_cobrado)}</p>
            <p className="text-xs text-green-600">{porcentajeCobrado}% del total</p>
          </div>
        </div>
      </div>

      {/* Monto Pendiente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Por Cobrar</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.monto_pendiente)}</p>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
        <div className="text-center">
          <p className="text-sm font-medium opacity-90">Efectividad de Cobro</p>
          <p className="text-3xl font-bold">{porcentajeCobrado}%</p>
          <p className="text-xs opacity-75">
            {estadisticas.cuotas_pagadas} de {estadisticas.total_cuotas} cuotas
          </p>
        </div>
      </div>
    </div>
  )
}