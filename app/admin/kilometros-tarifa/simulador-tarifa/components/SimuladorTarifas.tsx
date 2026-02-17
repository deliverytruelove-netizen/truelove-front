"use client"

import React, { useState } from "react"
import { Calculator, RefreshCw, MapPin, User, Clock, TrendingUp, Loader2 } from "lucide-react"
import Section from "@/components/layout/Section"
import { useQuery } from "@tanstack/react-query"
import {
  fetchLocales,
  fetchClientes,
  calcularPreview,
} from "@/app/admin/kilometros-tarifa/services/KilometrosTarifa.service"
import type { 
  LocalOption,
  ClienteOption,
  CalculadoraResponse,
} from "@/app/admin/kilometros-tarifa/types/KilometrosTarifa.types"
import { showAlert } from "@/components/ui/DataTable/Alert"
import { Button } from "@/components/ui/button"
import SearchableSelect from "./SearchableSelect"

const SimuladorTarifas: React.FC = () => {
  const [selectedLocal, setSelectedLocal] = useState<number | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null)
  const [calculadoraResult, setCalculadoraResult] = useState<CalculadoraResponse | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const { data: locales = [], isLoading: loadingLocales } = useQuery<LocalOption[], Error>({
    queryKey: ["locales"],
    queryFn: fetchLocales,
  })

  const { data: clientes = [], isLoading: loadingClientes } = useQuery<ClienteOption[], Error>({
    queryKey: ["clientes"],
    queryFn: fetchClientes,
  })

  const handleCalcular = async () => {
    if (!selectedLocal || !selectedCliente) {
      showAlert({
        title: "Error",
        text: "Por favor selecciona un local y un cliente.",
        icon: "error",
      })
      return
    }

    setIsCalculating(true)
    try {
      const result = await calcularPreview({
        id_local: selectedLocal,
        id_cliente: selectedCliente,
      })

      if (result.success && result.data) {
        setCalculadoraResult(result)
      } else {
        showAlert({
          title: "Error",
          text: result.message || "No se pudo calcular la tarifa.",
          icon: "error",
        })
      }
    } catch (error: unknown) {
      showAlert({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al calcular la tarifa.",
        icon: "error",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleLimpiar = () => {
    setSelectedLocal(null)
    setSelectedCliente(null)
    setCalculadoraResult(null)
  }

  const formatCurrency = (value: number | string | undefined) => {
    if (value === undefined || value === null) return 'S/ 0.00'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return 'S/ 0.00'
    return `S/ ${numValue.toFixed(2)}`
  }

  const formatNumber = (value: number | string | undefined) => {
    if (value === undefined || value === null) return '0.00'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return '0.00'
    return numValue.toFixed(2)
  }

  return (
    <Section title="">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 pt-5">
        {/* Panel Izquierdo - Formulario */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 rounded-t-lg">
              <Calculator className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-700">Datos de Simulación</h3>
            </div>

            <div className="p-5 space-y-4">
              <SearchableSelect
                options={locales}
                value={selectedLocal}
                onChange={setSelectedLocal}
                placeholder={loadingLocales ? "Cargando locales..." : "Selecciona un local..."}
                label="Local de Origen"
                icon={<MapPin className="w-3.5 h-3.5 text-brand-500" />}
                disabled={loadingLocales}
              />

              <SearchableSelect
                options={clientes}
                value={selectedCliente}
                onChange={setSelectedCliente}
                placeholder={loadingClientes ? "Cargando clientes..." : "Selecciona un cliente..."}
                label="Cliente de Destino"
                icon={<User className="w-3.5 h-3.5 text-brand-500" />}
                disabled={loadingClientes}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCalcular}
                  disabled={!selectedLocal || !selectedCliente || isCalculating}
                  className="bg-brand-500 hover:bg-brand-600 text-white h-9 px-5 text-sm font-medium flex-1"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Calcular Tarifa
                    </>
                  )}
                </Button>
                {calculadoraResult && (
                  <Button
                    onClick={handleLimpiar}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 h-9 px-4 text-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Resultados */}
        <div className="lg:col-span-3">
          {calculadoraResult ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700">Resultado del Cálculo</h3>
              </div>

              <div className="p-5">
                {/* Métricas principales en fila */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Distancia</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {calculadoraResult.data?.distancia_km?.toFixed(2) || '0.00'}
                      <span className="text-sm font-normal text-gray-500 ml-1">km</span>
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-brand-50 border border-brand-100">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                      <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">Precio calculado</span>
                    </div>
                    <div className="text-2xl font-bold text-brand-600">
                      {formatCurrency(calculadoraResult.data?.precio_calculado)}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">según hora actual</p>
                  </div>
                </div>

                {/* Detalles en tabla compacta */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-500 font-medium w-40">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            Local
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-900 font-medium">{calculadoraResult.data?.local?.nombre || 'N/A'}</td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-500 font-medium">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            Cliente
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-900 font-medium">{calculadoraResult.data?.cliente?.nombre || 'N/A'}</td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-500 font-medium">
                          <div className="flex items-center gap-2">
                            <Calculator className="w-3.5 h-3.5" />
                            Configuración
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-900 font-medium">
                          {calculadoraResult.data?.config_nombre || 'Global'}
                          {calculadoraResult.data?.local?.tiene_config_propia && (
                            <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Personalizada</span>
                          )}
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-500 font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Horario nocturno
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-900 font-medium">
                          {calculadoraResult.data?.horario_nocturno?.inicio || '--'} → {calculadoraResult.data?.horario_nocturno?.fin || '--'}
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-500 font-medium">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Modo tarifa
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-900 font-medium">
                          {calculadoraResult.data?.modo_tarifa === 'precio_por_km'
                            ? 'Precio por kilómetro'
                            : calculadoraResult.data?.modo_tarifa === 'rangos'
                              ? 'Por rangos de distancia'
                              : 'Global (precio proporcional)'
                          }
                        </td>
                      </tr>
                      {calculadoraResult.data?.rango_aplicado && (
                        <tr className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5" />
                              Rango aplicado
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs font-semibold border border-brand-200">
                                {formatNumber(calculadoraResult.data.rango_aplicado.distancia_desde)} – {calculadoraResult.data.rango_aplicado.distancia_hasta ? formatNumber(calculadoraResult.data.rango_aplicado.distancia_hasta) : '∞'} km
                              </span>
                              <span className="text-xs text-gray-500">
                                ☀️ {formatCurrency(calculadoraResult.data.rango_aplicado.precio_diurno)} · 🌙 {formatCurrency(calculadoraResult.data.rango_aplicado.precio_nocturno)}
                              </span>
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calculator className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Listo para calcular</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Selecciona un local y un cliente, luego haz clic en &quot;Calcular Tarifa&quot; para ver el costo estimado.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

export default SimuladorTarifas
