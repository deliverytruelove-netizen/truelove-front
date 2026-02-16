"use client"

import React, { useState, useEffect } from "react"
import { Save, Plus, Trash2, Clock, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination } from "@/components/ui/pagination"
import type { TarifaConfiguracion, TarifaRango } from "@/app/admin/kilometros-tarifa/types/KilometrosTarifa.types"

interface TarifasRangosFormProps {
  configuracion: TarifaConfiguracion | null
  onSubmit: (data: Partial<TarifaConfiguracion>) => void
  isLoading: boolean
}

const TarifasRangosForm: React.FC<TarifasRangosFormProps> = ({
  configuracion,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    hora_inicio_nocturno: "19:00:00",
    hora_fin_nocturno: "23:59:59",
    activo: true,
  })

  const [rangos, setRangos] = useState<Partial<TarifaRango>[]>([
    { distancia_desde: "0", distancia_hasta: "3", precio_diurno: "3.00", precio_nocturno: "4.00" },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [rangoPage, setRangoPage] = useState({ pageSize: 10, pageIndex: 0 })

  useEffect(() => {
    if (configuracion) {
      setFormData({
        nombre: configuracion.nombre,
        descripcion: configuracion.descripcion || "",
        hora_inicio_nocturno: configuracion.hora_inicio_nocturno,
        hora_fin_nocturno: configuracion.hora_fin_nocturno,
        activo: configuracion.activo,
      })
      
      if (configuracion.rangos && configuracion.rangos.length > 0) {
        setRangos(configuracion.rangos.map(r => ({
          id: r.id,
          distancia_desde: String(r.distancia_desde || '0'),
          distancia_hasta: String(r.distancia_hasta || '0'),
          precio_diurno: String(r.precio_diurno || '0'),
          precio_nocturno: String(r.precio_nocturno || '0'),
        })))
      }
    } else {
      setFormData({
        nombre: "Configuración de Tarifas",
        descripcion: "",
        hora_inicio_nocturno: "19:00:00",
        hora_fin_nocturno: "23:59:59",
        activo: true,
      })
      setRangos([
        { distancia_desde: "0", distancia_hasta: "3", precio_diurno: "3.00", precio_nocturno: "4.00" },
      ])
    }
  }, [configuracion])

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
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-5">
      {/* Horario Nocturno */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-700">Horario Nocturno</h3>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hora_inicio_nocturno" className="text-xs font-medium text-gray-600">Hora Inicio</Label>
              <Input
                id="hora_inicio_nocturno"
                name="hora_inicio_nocturno"
                type="time"
                step="1"
                value={formData.hora_inicio_nocturno}
                onChange={handleInputChange}
                className={`mt-1 h-9 text-sm ${errors.hora_inicio_nocturno ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
              {errors.hora_inicio_nocturno && (
                <p className="text-red-500 text-xs mt-1">{errors.hora_inicio_nocturno}</p>
              )}
            </div>
            <div>
              <Label htmlFor="hora_fin_nocturno" className="text-xs font-medium text-gray-600">Hora Fin</Label>
              <Input
                id="hora_fin_nocturno"
                name="hora_fin_nocturno"
                type="time"
                step="1"
                value={formData.hora_fin_nocturno}
                onChange={handleInputChange}
                className={`mt-1 h-9 text-sm ${errors.hora_fin_nocturno ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
              {errors.hora_fin_nocturno && (
                <p className="text-red-500 text-xs mt-1">{errors.hora_fin_nocturno}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rangos de Distancia - Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-700">Rangos de Distancia</h3>
            <span className="text-xs text-gray-400 font-normal">({rangos.length} {rangos.length === 1 ? 'rango' : 'rangos'})</span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAddRango}
            className="bg-brand-500 hover:bg-brand-600 text-white h-8 text-xs"
            disabled={isLoading}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Agregar
          </Button>
        </div>

        {errors.rangos && (
          <div className="px-5 py-2 bg-red-50 border-b border-red-200">
            <p className="text-red-600 text-xs">{errors.rangos}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desde (km)</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hasta (km)</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">☀️ Diurno (S/)</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🌙 Nocturno (S/)</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rangos
                .slice(
                  rangoPage.pageIndex * rangoPage.pageSize,
                  (rangoPage.pageIndex + 1) * rangoPage.pageSize
                )
                .map((rango, pageIdx) => {
                  const index = rangoPage.pageIndex * rangoPage.pageSize + pageIdx
                  return (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2">
                        <span className="text-xs font-medium text-gray-400">{index + 1}</span>
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={rango.distancia_desde || ''}
                          onChange={(e) => handleRangoChange(index, 'distancia_desde', e.target.value)}
                          className={`h-8 text-sm w-28 ${errors[`rango_${index}_desde`] ? "border-red-500" : ""}`}
                          placeholder="0"
                          disabled={isLoading}
                        />
                        {errors[`rango_${index}_desde`] && (
                          <p className="text-red-500 text-[10px] mt-0.5">{errors[`rango_${index}_desde`]}</p>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={rango.distancia_hasta || ''}
                          onChange={(e) => handleRangoChange(index, 'distancia_hasta', e.target.value)}
                          className={`h-8 text-sm w-28 ${errors[`rango_${index}_hasta`] ? "border-red-500" : ""}`}
                          placeholder="3"
                          disabled={isLoading}
                        />
                        {errors[`rango_${index}_hasta`] && (
                          <p className="text-red-500 text-[10px] mt-0.5">{errors[`rango_${index}_hasta`]}</p>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={rango.precio_diurno || ''}
                          onChange={(e) => handleRangoChange(index, 'precio_diurno', e.target.value)}
                          className={`h-8 text-sm w-28 ${errors[`rango_${index}_diurno`] ? "border-red-500" : ""}`}
                          placeholder="3.00"
                          disabled={isLoading}
                        />
                        {errors[`rango_${index}_diurno`] && (
                          <p className="text-red-500 text-[10px] mt-0.5">{errors[`rango_${index}_diurno`]}</p>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={rango.precio_nocturno || ''}
                          onChange={(e) => handleRangoChange(index, 'precio_nocturno', e.target.value)}
                          className={`h-8 text-sm w-28 ${errors[`rango_${index}_nocturno`] ? "border-red-500" : ""}`}
                          placeholder="4.00"
                          disabled={isLoading}
                        />
                        {errors[`rango_${index}_nocturno`] && (
                          <p className="text-red-500 text-[10px] mt-0.5">{errors[`rango_${index}_nocturno`]}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {rangos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRango(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                            disabled={isLoading}
                            title="Eliminar rango"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {rangos.length > rangoPage.pageSize && (
          <div className="border-t border-gray-200">
            <Pagination
              currentPage={rangoPage.pageIndex + 1}
              totalPages={Math.ceil(rangos.length / rangoPage.pageSize)}
              totalItems={rangos.length}
              perPage={rangoPage.pageSize}
              onPageChange={(page) => setRangoPage({ ...rangoPage, pageIndex: page - 1 })}
              onPerPageChange={(perPage) => setRangoPage({ pageSize: perPage, pageIndex: 0 })}
              itemsInCurrentPage={
                rangos.slice(
                  rangoPage.pageIndex * rangoPage.pageSize,
                  (rangoPage.pageIndex + 1) * rangoPage.pageSize
                ).length
              }
            />
          </div>
        )}

        <div className="px-5 py-3 bg-blue-50/60 border-t border-blue-100">
          <p className="text-xs text-blue-700">
            <strong>Nota:</strong> Si un cliente está a 2.5km, se aplica el rango 0-3km → S/3.00 (día) / S/4.00 (noche).
          </p>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-brand-500 hover:bg-brand-600 text-white h-10 px-6 text-sm font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default TarifasRangosForm
