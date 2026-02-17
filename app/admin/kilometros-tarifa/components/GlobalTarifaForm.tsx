"use client"

import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Save, Loader2, Globe, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchKilometrosTarifaActiva, updateKilometrosTarifa } from "@/app/admin/kilometros-tarifa/services/KilometrosTarifa.service"
import { showAlert } from "@/components/ui/DataTable/Alert"
import type { KilometrosTarifa } from "@/app/admin/kilometros-tarifa/types/KilometrosTarifa.types"

const GlobalTarifaForm: React.FC = () => {
  const queryClient = useQueryClient()
  const [collapsed, setCollapsed] = useState(true)

  const [precioBaseDiurno, setPrecioBaseDiurno] = useState("4.00")
  const [precioBaseNocturno, setPrecioBaseNocturno] = useState("5.50")
  const [precioMaximo, setPrecioMaximo] = useState("10.00")
  const [distanciaMaxima, setDistanciaMaxima] = useState("10.00")
  const [distanciaMinima, setDistanciaMinima] = useState("1.00")
  const [nombre, setNombre] = useState("Configuracion Principal")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: config, isLoading } = useQuery<KilometrosTarifa | null>({
    queryKey: ["kilometros-tarifa-activa"],
    queryFn: fetchKilometrosTarifaActiva,
  })

  useEffect(() => {
    if (config) {
      setPrecioBaseDiurno(String(config.precio_base_diurno ?? "4.00"))
      setPrecioBaseNocturno(String(config.precio_base_nocturno ?? "5.50"))
      setPrecioMaximo(String(config.precio_maximo ?? "10.00"))
      setDistanciaMaxima(String(config.distancia_maxima ?? "10.00"))
      setDistanciaMinima(String(config.distancia_minima ?? "1.00"))
      setNombre(config.nombre ?? "Configuracion Principal")
    }
  }, [config])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<KilometrosTarifa>) =>
      updateKilometrosTarifa({ id: config!.id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kilometros-tarifa-activa"] })
      showAlert({ title: "Éxito", text: "Configuración global actualizada.", icon: "success" })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const fields = { precioBaseDiurno, precioBaseNocturno, precioMaximo, distanciaMaxima, distanciaMinima }
    Object.entries(fields).forEach(([key, val]) => {
      if (!val || isNaN(Number(val)) || Number(val) < 0) newErrors[key] = "Valor inválido"
    })
    if (Number(distanciaMinima) >= Number(distanciaMaxima)) newErrors.distanciaMaxima = "Debe ser mayor que la mínima"
    if (Number(precioBaseDiurno) >= Number(precioMaximo)) newErrors.precioMaximo = "Debe ser mayor que el precio base"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    updateMutation.mutate({
      precio_base_diurno: Number(precioBaseDiurno),
      precio_base_nocturno: Number(precioBaseNocturno),
      precio_maximo: Number(precioMaximo),
      distancia_maxima: Number(distanciaMaxima),
      distancia_minima: Number(distanciaMinima),
      nombre,
      activo: true,
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-gray-700">Configuración Global</h3>
          <span className="text-xs text-gray-400 font-normal hidden sm:inline">
            — aplica a todos los locales sin tarifa propia
          </span>
        </div>
        {collapsed
          ? <ChevronDown className="w-4 h-4 text-gray-400" />
          : <ChevronUp className="w-4 h-4 text-gray-400" />
        }
      </button>

      {!collapsed && (
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
            </div>
          ) : (
            <>
              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded p-2.5 mb-4">
                Fórmula: <strong>precio base + ((precio máx − precio base) / (dist. máx − dist. mín)) × (km − dist. mín)</strong>, redondeado al S/ 0.50 más cercano.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-600">☀️ Precio Base Diurno (S/)</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={precioBaseDiurno}
                    onChange={e => setPrecioBaseDiurno(e.target.value)}
                    className={`mt-1 h-9 text-sm ${errors.precioBaseDiurno ? "border-red-500" : ""}`}
                    disabled={updateMutation.isPending}
                  />
                  {errors.precioBaseDiurno && <p className="text-red-500 text-xs mt-1">{errors.precioBaseDiurno}</p>}
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">🌙 Precio Base Nocturno (S/)</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={precioBaseNocturno}
                    onChange={e => setPrecioBaseNocturno(e.target.value)}
                    className={`mt-1 h-9 text-sm ${errors.precioBaseNocturno ? "border-red-500" : ""}`}
                    disabled={updateMutation.isPending}
                  />
                  {errors.precioBaseNocturno && <p className="text-red-500 text-xs mt-1">{errors.precioBaseNocturno}</p>}
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Precio Máximo (S/)</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={precioMaximo}
                    onChange={e => setPrecioMaximo(e.target.value)}
                    className={`mt-1 h-9 text-sm ${errors.precioMaximo ? "border-red-500" : ""}`}
                    disabled={updateMutation.isPending}
                  />
                  {errors.precioMaximo && <p className="text-red-500 text-xs mt-1">{errors.precioMaximo}</p>}
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Distancia Mínima (km)</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={distanciaMinima}
                    onChange={e => setDistanciaMinima(e.target.value)}
                    className={`mt-1 h-9 text-sm ${errors.distanciaMinima ? "border-red-500" : ""}`}
                    disabled={updateMutation.isPending}
                  />
                  {errors.distanciaMinima && <p className="text-red-500 text-xs mt-1">{errors.distanciaMinima}</p>}
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Distancia Máxima (km)</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={distanciaMaxima}
                    onChange={e => setDistanciaMaxima(e.target.value)}
                    className={`mt-1 h-9 text-sm ${errors.distanciaMaxima ? "border-red-500" : ""}`}
                    disabled={updateMutation.isPending}
                  />
                  {errors.distanciaMaxima && <p className="text-red-500 text-xs mt-1">{errors.distanciaMaxima}</p>}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-brand-500 hover:bg-brand-600 text-white h-9 text-sm px-5"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                    : <><Save className="w-4 h-4 mr-2" /> Guardar</>
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalTarifaForm
