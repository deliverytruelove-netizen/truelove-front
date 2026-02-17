"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Save, Trash2, Plus, Loader2, Clock, MapPin, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { saveConfigLocal, deleteConfigLocal } from "@/app/admin/kilometros-tarifa/services/KilometrosTarifa.service"
import { showAlert, confirmAlert } from "@/components/ui/DataTable/Alert"
import type { LocalConConfig, TarifaConfiguracion, TarifaRango } from "@/app/admin/kilometros-tarifa/types/KilometrosTarifa.types"

interface LocalTarifaModalProps {
  local: LocalConConfig | null
  isOpen: boolean
  onClose: () => void
}

const HORA_INICIO_DEFAULT = "23:00:00"
const HORA_FIN_DEFAULT = "05:00:00"

const LocalTarifaModal: React.FC<LocalTarifaModalProps> = ({ local, isOpen, onClose }) => {
  const queryClient = useQueryClient()

  const [modoTarifa, setModoTarifa] = useState<'rangos' | 'precio_por_km'>('rangos')
  const [horaInicio, setHoraInicio] = useState(HORA_INICIO_DEFAULT)
  const [horaFin, setHoraFin] = useState(HORA_FIN_DEFAULT)

  // Campos para precio_por_km
  const [precioBaseDiurno, setPrecioBaseDiurno] = useState("3.00")
  const [precioBaseNocturno, setPrecioBaseNocturno] = useState("4.00")
  const [precioKmDiurno, setPrecioKmDiurno] = useState("0.80")
  const [precioKmNocturno, setPrecioKmNocturno] = useState("1.00")
  const [precioMaximo, setPrecioMaximo] = useState("25.00")

  // Campos para rangos
  const [rangos, setRangos] = useState<Partial<TarifaRango>[]>([
    { distancia_desde: "0", distancia_hasta: "3", precio_diurno: "3.00", precio_nocturno: "4.00" },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Cargar datos existentes del local cuando se abre el modal
  useEffect(() => {
    if (!isOpen || !local) return

    if (local.config) {
      const c = local.config
      setModoTarifa(c.modo_tarifa ?? 'rangos')
      setHoraInicio(c.hora_inicio_nocturno ?? HORA_INICIO_DEFAULT)
      setHoraFin(c.hora_fin_nocturno ?? HORA_FIN_DEFAULT)
      setPrecioBaseDiurno(String(c.precio_base_diurno ?? "3.00"))
      setPrecioBaseNocturno(String(c.precio_base_nocturno ?? "4.00"))
      setPrecioKmDiurno(String(c.precio_por_km_diurno ?? "0.80"))
      setPrecioKmNocturno(String(c.precio_por_km_nocturno ?? "1.00"))
      setPrecioMaximo(String(c.precio_maximo ?? "25.00"))
      if (c.rangos && c.rangos.length > 0) {
        setRangos(c.rangos.map(r => ({
          id: r.id,
          distancia_desde: String(r.distancia_desde),
          distancia_hasta: String(r.distancia_hasta),
          precio_diurno: String(r.precio_diurno),
          precio_nocturno: String(r.precio_nocturno),
        })))
      } else {
        setRangos([{ distancia_desde: "0", distancia_hasta: "3", precio_diurno: "3.00", precio_nocturno: "4.00" }])
      }
    } else {
      // Sin config propia: valores por defecto
      setModoTarifa('rangos')
      setHoraInicio(HORA_INICIO_DEFAULT)
      setHoraFin(HORA_FIN_DEFAULT)
      setPrecioBaseDiurno("3.00")
      setPrecioBaseNocturno("4.00")
      setPrecioKmDiurno("0.80")
      setPrecioKmNocturno("1.00")
      setPrecioMaximo("25.00")
      setRangos([{ distancia_desde: "0", distancia_hasta: "3", precio_diurno: "3.00", precio_nocturno: "4.00" }])
    }
    setErrors({})
  }, [isOpen, local])

  const saveMutation = useMutation({
    mutationFn: (data: Partial<TarifaConfiguracion>) => saveConfigLocal(local!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locales-con-config"] })
      showAlert({ title: "Éxito", text: "Tarifa del local guardada.", icon: "success" })
      onClose()
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteConfigLocal(local!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locales-con-config"] })
      showAlert({ title: "Listo", text: "El local ahora usa la tarifa global.", icon: "success" })
      onClose()
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const handleAddRango = () => {
    const last = rangos[rangos.length - 1]
    const nextFrom = last ? Number(last.distancia_hasta) : 0
    setRangos([...rangos, {
      distancia_desde: nextFrom.toString(),
      distancia_hasta: (nextFrom + 5).toString(),
      precio_diurno: "5.00",
      precio_nocturno: "6.00",
    }])
  }

  const handleRemoveRango = (index: number) => {
    if (rangos.length > 1) setRangos(rangos.filter((_, i) => i !== index))
  }

  const handleRangoChange = (index: number, field: keyof TarifaRango, value: string) => {
    const updated = [...rangos]
    updated[index] = { ...updated[index], [field]: value }
    setRangos(updated)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!horaInicio) newErrors.horaInicio = "Requerido"
    if (!horaFin) newErrors.horaFin = "Requerido"

    if (modoTarifa === 'precio_por_km') {
      if (!precioBaseDiurno || isNaN(Number(precioBaseDiurno))) newErrors.precioBaseDiurno = "Inválido"
      if (!precioBaseNocturno || isNaN(Number(precioBaseNocturno))) newErrors.precioBaseNocturno = "Inválido"
      if (!precioKmDiurno || isNaN(Number(precioKmDiurno))) newErrors.precioKmDiurno = "Inválido"
      if (!precioKmNocturno || isNaN(Number(precioKmNocturno))) newErrors.precioKmNocturno = "Inválido"
    } else {
      rangos.forEach((r, i) => {
        if (isNaN(Number(r.distancia_desde))) newErrors[`r${i}_desde`] = "Inválido"
        if (isNaN(Number(r.distancia_hasta))) newErrors[`r${i}_hasta`] = "Inválido"
        if (Number(r.distancia_desde) >= Number(r.distancia_hasta)) newErrors[`r${i}_hasta`] = "Debe ser > desde"
        if (isNaN(Number(r.precio_diurno))) newErrors[`r${i}_diurno`] = "Inválido"
        if (isNaN(Number(r.precio_nocturno))) newErrors[`r${i}_nocturno`] = "Inválido"
      })
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const baseData = {
      hora_inicio_nocturno: horaInicio,
      hora_fin_nocturno: horaFin,
      modo_tarifa: modoTarifa,
    }

    if (modoTarifa === 'precio_por_km') {
      saveMutation.mutate({
        ...baseData,
        precio_base_diurno: Number(precioBaseDiurno),
        precio_base_nocturno: Number(precioBaseNocturno),
        precio_por_km_diurno: Number(precioKmDiurno),
        precio_por_km_nocturno: Number(precioKmNocturno),
        precio_maximo: precioMaximo ? Number(precioMaximo) : null,
      })
    } else {
      saveMutation.mutate({
        ...baseData,
        rangos: rangos.map((r, i) => ({
          distancia_desde: Number(r.distancia_desde),
          distancia_hasta: Number(r.distancia_hasta),
          precio_diurno: Number(r.precio_diurno),
          precio_nocturno: Number(r.precio_nocturno),
          orden: i + 1,
        })),
      })
    }
  }

  const handleDeleteConfig = async () => {
    const result = await confirmAlert({
      title: "¿Eliminar tarifa personalizada?",
      text: `${local?.nombre} volverá a usar la tarifa global.`,
      icon: "warning",
      confirmButtonText: "Sí, usar tarifa global",
    })
    if (result.isConfirmed) deleteMutation.mutate()
  }

  if (!isOpen || !local) return null

  const isLoading = saveMutation.isPending || deleteMutation.isPending

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-xl shadow-2xl sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-500 to-rose-500 sm:rounded-t-xl flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg">{local.nombre}</h2>
            <p className="text-white/80 text-xs mt-0.5">
              {local.tiene_config_propia ? "Tarifa personalizada activa" : "Sin tarifa propia — usa la global"}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Selector de modo */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Modo de tarifa</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModoTarifa('rangos')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border-2 text-center transition-colors ${
                  modoTarifa === 'rangos'
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-semibold leading-tight">Por rangos</p>
                <p className="text-[10px] text-gray-400 leading-tight">Precio fijo por distancia</p>
              </button>
              <button
                type="button"
                onClick={() => setModoTarifa('precio_por_km')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border-2 text-center transition-colors ${
                  modoTarifa === 'precio_por_km'
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-semibold leading-tight">Precio por km</p>
                <p className="text-[10px] text-gray-400 leading-tight">Base + tarifa × km</p>
              </button>
            </div>
          </div>

          {/* Horario nocturno */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-700">Horario Nocturno</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-gray-600">Hora Inicio</Label>
                <Input
                  type="time" step="1"
                  value={horaInicio}
                  onChange={e => setHoraInicio(e.target.value)}
                  className={`mt-1 h-9 text-sm ${errors.horaInicio ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">Hora Fin</Label>
                <Input
                  type="time" step="1"
                  value={horaFin}
                  onChange={e => setHoraFin(e.target.value)}
                  className={`mt-1 h-9 text-sm ${errors.horaFin ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Campos según modo */}
          {modoTarifa === 'precio_por_km' ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700">Precio por Kilómetro</h3>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-xs text-blue-700 bg-blue-50 rounded p-2">
                  Fórmula: <strong>Precio Base + (S/km × distancia)</strong>. Ej: 3.00 + (0.80 × 2km) = S/ 4.60
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">☀️ Precio Base Diurno (S/)</Label>
                    <Input
                      type="number" step="0.01" min="0"
                      value={precioBaseDiurno}
                      onChange={e => setPrecioBaseDiurno(e.target.value)}
                      className={`mt-1 h-9 text-sm ${errors.precioBaseDiurno ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {errors.precioBaseDiurno && <p className="text-red-500 text-xs mt-1">{errors.precioBaseDiurno}</p>}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">🌙 Precio Base Nocturno (S/)</Label>
                    <Input
                      type="number" step="0.01" min="0"
                      value={precioBaseNocturno}
                      onChange={e => setPrecioBaseNocturno(e.target.value)}
                      className={`mt-1 h-9 text-sm ${errors.precioBaseNocturno ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">☀️ Tarifa por km Diurno (S/)</Label>
                    <Input
                      type="number" step="0.01" min="0"
                      value={precioKmDiurno}
                      onChange={e => setPrecioKmDiurno(e.target.value)}
                      className={`mt-1 h-9 text-sm ${errors.precioKmDiurno ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">🌙 Tarifa por km Nocturno (S/)</Label>
                    <Input
                      type="number" step="0.01" min="0"
                      value={precioKmNocturno}
                      onChange={e => setPrecioKmNocturno(e.target.value)}
                      className={`mt-1 h-9 text-sm ${errors.precioKmNocturno ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Precio Máximo (S/) — opcional</Label>
                    <Input
                      type="number" step="0.01" min="0"
                      value={precioMaximo}
                      onChange={e => setPrecioMaximo(e.target.value)}
                      className="mt-1 h-9 text-sm"
                      placeholder="Sin límite"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-gray-700 whitespace-nowrap">Rangos</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">({rangos.length})</span>
                </div>
                <Button
                  type="button" size="sm"
                  onClick={handleAddRango}
                  className="bg-brand-500 hover:bg-brand-600 text-white h-8 text-xs flex-shrink-0"
                  disabled={isLoading}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Agregar
                </Button>
              </div>
              {/* Desktop: tabla */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-8">#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Desde (km)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Hasta (km)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">☀️ Diurno</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">🌙 Nocturno</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rangos.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2"><Input type="number" step="0.01" min="0" value={r.distancia_desde ?? ''} onChange={e => handleRangoChange(i, 'distancia_desde', e.target.value)} className={`h-8 text-sm w-24 ${errors[`r${i}_desde`] ? 'border-red-500' : ''}`} disabled={isLoading} /></td>
                        <td className="px-3 py-2"><Input type="number" step="0.01" min="0" value={r.distancia_hasta ?? ''} onChange={e => handleRangoChange(i, 'distancia_hasta', e.target.value)} className={`h-8 text-sm w-24 ${errors[`r${i}_hasta`] ? 'border-red-500' : ''}`} disabled={isLoading} /></td>
                        <td className="px-3 py-2"><Input type="number" step="0.01" min="0" value={r.precio_diurno ?? ''} onChange={e => handleRangoChange(i, 'precio_diurno', e.target.value)} className="h-8 text-sm w-24" disabled={isLoading} /></td>
                        <td className="px-3 py-2"><Input type="number" step="0.01" min="0" value={r.precio_nocturno ?? ''} onChange={e => handleRangoChange(i, 'precio_nocturno', e.target.value)} className="h-8 text-sm w-24" disabled={isLoading} /></td>
                        <td className="px-3 py-2 text-center">
                          {rangos.length > 1 && (
                            <button type="button" onClick={() => handleRemoveRango(i)} className="text-gray-400 hover:text-red-500 transition-colors p-1" disabled={isLoading}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile: cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {rangos.map((r, i) => (
                  <div key={i} className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Rango {i + 1}</span>
                      {rangos.length > 1 && (
                        <button type="button" onClick={() => handleRemoveRango(i)} className="text-gray-400 hover:text-red-500 p-1" disabled={isLoading}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">Desde (km)</Label>
                        <Input type="number" step="0.01" min="0" value={r.distancia_desde ?? ''} onChange={e => handleRangoChange(i, 'distancia_desde', e.target.value)} className="h-8 text-sm mt-0.5" disabled={isLoading} />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Hasta (km)</Label>
                        <Input type="number" step="0.01" min="0" value={r.distancia_hasta ?? ''} onChange={e => handleRangoChange(i, 'distancia_hasta', e.target.value)} className="h-8 text-sm mt-0.5" disabled={isLoading} />
                        {errors[`r${i}_hasta`] && <p className="text-red-500 text-[10px]">{errors[`r${i}_hasta`]}</p>}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">☀️ Diurno (S/)</Label>
                        <Input type="number" step="0.01" min="0" value={r.precio_diurno ?? ''} onChange={e => handleRangoChange(i, 'precio_diurno', e.target.value)} className="h-8 text-sm mt-0.5" disabled={isLoading} />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">🌙 Nocturno (S/)</Label>
                        <Input type="number" step="0.01" min="0" value={r.precio_nocturno ?? ''} onChange={e => handleRangoChange(i, 'precio_nocturno', e.target.value)} className="h-8 text-sm mt-0.5" disabled={isLoading} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer fijo con acciones */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
          {local.tiene_config_propia ? (
            <button
              type="button"
              onClick={handleDeleteConfig}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors"
              disabled={isLoading}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Usar global</span>
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <Button
              type="button" variant="outline" onClick={onClose}
              className="h-9 text-sm" disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-brand-500 hover:bg-brand-600 text-white h-9 text-sm px-5"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Guardar</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default LocalTarifaModal
