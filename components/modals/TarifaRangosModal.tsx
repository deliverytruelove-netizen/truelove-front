"use client"

import React, { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TarifaConfiguracion, TarifaRango } from "@/app/admin/kilometros-tarifa/types/KilometrosTarifa.types"

interface TarifaRangosModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<TarifaConfiguracion>) => void
  editingTarifa: TarifaConfiguracion | null
  isLoading: boolean
}

const TarifaRangosModal: React.FC<TarifaRangosModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTarifa,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    hora_inicio_nocturno: "19:00:00",
    hora_fin_nocturno: "23:59:59",
    activo: false,
  })

  const [rangos, setRangos] = useState<Partial<TarifaRango>[]>([
    { distancia_desde: "0", distancia_hasta: "3", precio_diurno: "3.00", precio_nocturno: "4.00" },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingTarifa) {
      setFormData({
        nombre: editingTarifa.nombre,
        descripcion: editingTarifa.descripcion || "",
        hora_inicio_nocturno: editingTarifa.hora_inicio_nocturno,
        hora_fin_nocturno: editingTarifa.hora_fin_nocturno,
        activo: editingTarifa.activo,
      })
      
      if (editingTarifa.rangos && editingTarifa.rangos.length > 0) {
        setRangos(editingTarifa.rangos.map(r => ({
          id: r.id,
          distancia_desde: String(r.distancia_desde || '0'),
          distancia_hasta: String(r.distancia_hasta || '0'),
          precio_diurno: String(r.precio_diurno || '0'),
          precio_nocturno: String(r.precio_nocturno || '0'),
        })))
      }
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        hora_inicio_nocturno: "19:00:00",
        hora_fin_nocturno: "23:59:59",
        activo: false,
      })
      setRangos([
        { distancia_desde: "0", distancia_hasta: "3", precio_diurno: "3.00", precio_nocturno: "4.00" },
      ])
    }
    setErrors({})
  }, [editingTarifa, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (!formData.hora_inicio_nocturno) {
      newErrors.hora_inicio_nocturno = "La hora de inicio es requerida"
    }

    if (!formData.hora_fin_nocturno) {
      newErrors.hora_fin_nocturno = "La hora de fin es requerida"
    }

    if (rangos.length === 0) {
      newErrors.rangos = "Debe haber al menos un rango de distancia"
    }

    // Validar rangos
    rangos.forEach((rango, index) => {
      if (!rango.distancia_desde || isNaN(Number(rango.distancia_desde)) || Number(rango.distancia_desde) < 0) {
        newErrors[`rango_${index}_desde`] = "Distancia desde inválida"
      }
      if (!rango.distancia_hasta || isNaN(Number(rango.distancia_hasta)) || Number(rango.distancia_hasta) <= 0) {
        newErrors[`rango_${index}_hasta`] = "Distancia hasta inválida"
      }
      if (Number(rango.distancia_desde) >= Number(rango.distancia_hasta)) {
        newErrors[`rango_${index}_hasta`] = "Debe ser mayor que 'desde'"
      }
      if (!rango.precio_diurno || isNaN(Number(rango.precio_diurno)) || Number(rango.precio_diurno) < 0) {
        newErrors[`rango_${index}_diurno`] = "Precio diurno inválido"
      }
      if (!rango.precio_nocturno || isNaN(Number(rango.precio_nocturno)) || Number(rango.precio_nocturno) < 0) {
        newErrors[`rango_${index}_nocturno`] = "Precio nocturno inválido"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleRangoChange = (index: number, field: keyof TarifaRango, value: string) => {
    const newRangos = [...rangos]
    newRangos[index] = {
      ...newRangos[index],
      [field]: value,
    }
    setRangos(newRangos)

    // Limpiar errores del rango
    const errorKey = `rango_${index}_${field.replace('distancia_', '').replace('precio_', '')}`
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }))
    }
  }

  const handleAddRango = () => {
    const lastRango = rangos[rangos.length - 1]
    const nextFrom = lastRango ? Number(lastRango.distancia_hasta) : 0
    
    setRangos([
      ...rangos,
      {
        distancia_desde: nextFrom.toString(),
        distancia_hasta: (nextFrom + 5).toString(),
        precio_diurno: "5.00",
        precio_nocturno: "6.00",
      },
    ])
  }

  const handleRemoveRango = (index: number) => {
    if (rangos.length > 1) {
      const newRangos = rangos.filter((_, i) => i !== index)
      setRangos(newRangos)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData = {
      nombre: formData.nombre,
      descripcion: formData.descripcion === "" ? undefined : formData.descripcion,
      hora_inicio_nocturno: formData.hora_inicio_nocturno,
      hora_fin_nocturno: formData.hora_fin_nocturno,
      activo: formData.activo,
      rangos: rangos.map(r => ({
        id: r.id,
        distancia_desde: Number(r.distancia_desde),
        distancia_hasta: Number(r.distancia_hasta),
        precio_diurno: Number(r.precio_diurno),
        precio_nocturno: Number(r.precio_nocturno),
      })),
    }

    onSubmit(submitData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {editingTarifa ? "Editar Configuración por Rangos" : "Nueva Configuración por Rangos"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
          {/* Información General */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
              Información General
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Configuración *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.nombre ? "border-red-500" : ""}`}
                  placeholder="ej. Tarifas por Zonas"
                  disabled={isLoading}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <Label htmlFor="activo">Estado</Label>
                <div className="mt-2">
                  <label className="flex items-center">
                    <input
                      id="activo"
                      name="activo"
                      type="checkbox"
                      checked={formData.activo}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-brand-500 shadow-sm focus:border-brand-500 focus:ring focus:ring-brand-500 focus:ring-opacity-50"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm text-gray-600">Configuración activa</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Solo puede haber una configuración activa a la vez
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción (Opcional)</Label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500"
                rows={2}
                placeholder="Descripción de la configuración..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Horario Nocturno */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
              Horario Nocturno
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hora_inicio_nocturno">Hora Inicio Nocturno *</Label>
                <Input
                  id="hora_inicio_nocturno"
                  name="hora_inicio_nocturno"
                  type="time"
                  step="1"
                  value={formData.hora_inicio_nocturno}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.hora_inicio_nocturno ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Desde esta hora se aplica precio nocturno</p>
                {errors.hora_inicio_nocturno && (
                  <p className="text-red-500 text-xs mt-1">{errors.hora_inicio_nocturno}</p>
                )}
              </div>

              <div>
                <Label htmlFor="hora_fin_nocturno">Hora Fin Nocturno *</Label>
                <Input
                  id="hora_fin_nocturno"
                  name="hora_fin_nocturno"
                  type="time"
                  step="1"
                  value={formData.hora_fin_nocturno}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.hora_fin_nocturno ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Hasta esta hora se aplica precio nocturno</p>
                {errors.hora_fin_nocturno && (
                  <p className="text-red-500 text-xs mt-1">{errors.hora_fin_nocturno}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Ejemplo:</strong> Si configuras de 19:00 a 23:59, los pedidos entre esas horas tendrán el precio nocturno.
              </p>
            </div>
          </div>

          {/* Rangos de Distancia */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 flex-1">
                Rangos de Distancia
              </h3>
              <Button
                type="button"
                onClick={handleAddRango}
                className="bg-brand-500 hover:bg-brand-600 text-white text-xs"
                disabled={isLoading}
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar Rango
              </Button>
            </div>

            {errors.rangos && <p className="text-red-500 text-xs">{errors.rangos}</p>}

            <div className="space-y-3">
              {rangos.map((rango, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Rango {index + 1}</h4>
                    {rangos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRango(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label htmlFor={`rango_${index}_desde`} className="text-xs">Desde (km) *</Label>
                      <Input
                        id={`rango_${index}_desde`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={rango.distancia_desde || ''}
                        onChange={(e) => handleRangoChange(index, 'distancia_desde', e.target.value)}
                        className={`mt-1 ${errors[`rango_${index}_desde`] ? "border-red-500" : ""}`}
                        placeholder="0"
                        disabled={isLoading}
                      />
                      {errors[`rango_${index}_desde`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`rango_${index}_desde`]}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`rango_${index}_hasta`} className="text-xs">Hasta (km) *</Label>
                      <Input
                        id={`rango_${index}_hasta`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={rango.distancia_hasta || ''}
                        onChange={(e) => handleRangoChange(index, 'distancia_hasta', e.target.value)}
                        className={`mt-1 ${errors[`rango_${index}_hasta`] ? "border-red-500" : ""}`}
                        placeholder="3"
                        disabled={isLoading}
                      />
                      {errors[`rango_${index}_hasta`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`rango_${index}_hasta`]}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`rango_${index}_diurno`} className="text-xs">☀️ Diurno (S/) *</Label>
                      <Input
                        id={`rango_${index}_diurno`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={rango.precio_diurno || ''}
                        onChange={(e) => handleRangoChange(index, 'precio_diurno', e.target.value)}
                        className={`mt-1 ${errors[`rango_${index}_diurno`] ? "border-red-500" : ""}`}
                        placeholder="3.00"
                        disabled={isLoading}
                      />
                      {errors[`rango_${index}_diurno`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`rango_${index}_diurno`]}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`rango_${index}_nocturno`} className="text-xs">🌙 Nocturno (S/) *</Label>
                      <Input
                        id={`rango_${index}_nocturno`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={rango.precio_nocturno || ''}
                        onChange={(e) => handleRangoChange(index, 'precio_nocturno', e.target.value)}
                        className={`mt-1 ${errors[`rango_${index}_nocturno`] ? "border-red-500" : ""}`}
                        placeholder="4.00"
                        disabled={isLoading}
                      />
                      {errors[`rango_${index}_nocturno`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`rango_${index}_nocturno`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-800">
                <strong>Ejemplo:</strong> Rango 0-3km = S/3 (día) / S/4 (noche). Si un cliente está a 2.5km del local, 
                se le cobrará S/3 en horario diurno y S/4 en horario nocturno, independientemente de la distancia exacta.
              </p>
            </div>
          </div>

          </div>
        </form>

        {/* Footer fijo */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-white sticky bottom-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-brand-500 hover:bg-brand-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : editingTarifa ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { TarifaRangosModal }
