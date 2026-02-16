"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { KilometrosTarifa } from "@/app/admin/kilometros-tarifa/types/KilometrosTarifa.types"

interface KilometrosTarifaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<KilometrosTarifa>) => void
  editingTarifa: KilometrosTarifa | null
  isLoading: boolean
}

const KilometrosTarifaModal: React.FC<KilometrosTarifaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTarifa,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio_base_diurno: "",
    precio_base_nocturno: "",
    precio_por_km_diurno: "",
    precio_por_km_nocturno: "",
    precio_maximo: "",
    distancia_minima: "",
    distancia_maxima: "",
    activo: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingTarifa) {
      setFormData({
        nombre: editingTarifa.nombre,
        descripcion: editingTarifa.descripcion || "",
        precio_base_diurno: editingTarifa.precio_base_diurno.toString(),
        precio_base_nocturno: editingTarifa.precio_base_nocturno.toString(),
        precio_por_km_diurno: editingTarifa.precio_por_km_diurno.toString(),
        precio_por_km_nocturno: editingTarifa.precio_por_km_nocturno.toString(),
        precio_maximo: editingTarifa.precio_maximo?.toString() || "",
        distancia_minima: editingTarifa.distancia_minima?.toString() || "",
        distancia_maxima: editingTarifa.distancia_maxima?.toString() || "",
        activo: editingTarifa.activo,
      })
    } else {
      // Valores por defecto para nueva configuración
      setFormData({
        nombre: "",
        descripcion: "",
        precio_base_diurno: "4.00",
        precio_base_nocturno: "5.50",
        precio_por_km_diurno: "0.80",
        precio_por_km_nocturno: "1.00",
        precio_maximo: "25.00",
        distancia_minima: "",
        distancia_maxima: "",
        activo: false,
      })
    }
    setErrors({})
  }, [editingTarifa, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    // Campos obligatorios
    const requiredFields = [
      { key: "precio_base_diurno", label: "Precio base diurno" },
      { key: "precio_base_nocturno", label: "Precio base nocturno" },
      { key: "precio_por_km_diurno", label: "Precio por km diurno" },
      { key: "precio_por_km_nocturno", label: "Precio por km nocturno" },
    ]

    requiredFields.forEach(({ key, label }) => {
      const value = formData[key as keyof typeof formData] as string
      if (!value || isNaN(Number(value)) || Number(value) < 0) {
        newErrors[key] = `${label} debe ser un número válido mayor o igual a 0`
      }
    })

    // Campos opcionales (solo validar si tienen valor)
    const optionalFields = [
      { key: "precio_maximo", label: "Precio máximo" },
      { key: "distancia_minima", label: "Distancia mínima" },
      { key: "distancia_maxima", label: "Distancia máxima" },
    ]

    optionalFields.forEach(({ key, label }) => {
      const value = formData[key as keyof typeof formData] as string
      if (value && (isNaN(Number(value)) || Number(value) < 0)) {
        newErrors[key] = `${label} debe ser un número válido mayor o igual a 0`
      }
    })

    // Validaciones específicas solo si hay valores
    if (formData.distancia_minima && formData.distancia_maxima) {
      if (Number(formData.distancia_minima) >= Number(formData.distancia_maxima)) {
        newErrors.distancia_minima = "La distancia mínima debe ser menor que la máxima"
      }
    }

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

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
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
      precio_base_diurno: Number(formData.precio_base_diurno),
      precio_base_nocturno: Number(formData.precio_base_nocturno),
      precio_por_km_diurno: Number(formData.precio_por_km_diurno),
      precio_por_km_nocturno: Number(formData.precio_por_km_nocturno),
      precio_maximo: formData.precio_maximo ? Number(formData.precio_maximo) : null,
      distancia_minima: formData.distancia_minima ? Number(formData.distancia_minima) : null,
      distancia_maxima: formData.distancia_maxima ? Number(formData.distancia_maxima) : null,
      activo: formData.activo,
    }

    onSubmit(submitData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingTarifa ? "Editar Configuración de Tarifa" : "Nueva Configuración de Tarifa"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  placeholder="ej. Configuración Principal"
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
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                rows={2}
                placeholder="Descripción de la configuración..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Configuración de Precios */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
              Configuración de Precios
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio_base_diurno">Precio Base Diurno (S/) *</Label>
                <Input
                  id="precio_base_diurno"
                  name="precio_base_diurno"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_base_diurno}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.precio_base_diurno ? "border-red-500" : ""}`}
                  placeholder="4.00"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Precio inicial (05:00 - 22:59)</p>
                {errors.precio_base_diurno && (
                  <p className="text-red-500 text-xs mt-1">{errors.precio_base_diurno}</p>
                )}
              </div>

              <div>
                <Label htmlFor="precio_por_km_diurno">Precio por Km Diurno (S/) *</Label>
                <Input
                  id="precio_por_km_diurno"
                  name="precio_por_km_diurno"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_por_km_diurno}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.precio_por_km_diurno ? "border-red-500" : ""}`}
                  placeholder="0.80"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Cobro por cada kilómetro</p>
                {errors.precio_por_km_diurno && (
                  <p className="text-red-500 text-xs mt-1">{errors.precio_por_km_diurno}</p>
                )}
              </div>

              <div>
                <Label htmlFor="precio_base_nocturno">Precio Base Nocturno (S/) *</Label>
                <Input
                  id="precio_base_nocturno"
                  name="precio_base_nocturno"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_base_nocturno}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.precio_base_nocturno ? "border-red-500" : ""}`}
                  placeholder="5.50"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Precio inicial (23:00 - 04:59)</p>
                {errors.precio_base_nocturno && (
                  <p className="text-red-500 text-xs mt-1">{errors.precio_base_nocturno}</p>
                )}
              </div>

              <div>
                <Label htmlFor="precio_por_km_nocturno">Precio por Km Nocturno (S/) *</Label>
                <Input
                  id="precio_por_km_nocturno"
                  name="precio_por_km_nocturno"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_por_km_nocturno}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.precio_por_km_nocturno ? "border-red-500" : ""}`}
                  placeholder="1.00"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Cobro por cada kilómetro</p>
                {errors.precio_por_km_nocturno && (
                  <p className="text-red-500 text-xs mt-1">{errors.precio_por_km_nocturno}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label htmlFor="precio_maximo">Precio Máximo (S/) (Opcional)</Label>
                <Input
                  id="precio_maximo"
                  name="precio_maximo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_maximo}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.precio_maximo ? "border-red-500" : ""}`}
                  placeholder="25.00"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Límite máximo de cobro (tope de seguridad)</p>
                {errors.precio_maximo && <p className="text-red-500 text-xs mt-1">{errors.precio_maximo}</p>}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Ejemplo de cálculo:</strong> Si el precio base diurno es S/ 4.00 y el precio por km es S/ 0.80,
                un viaje de 5 km costará: S/ 4.00 + (5 × S/ 0.80) = <strong>S/ 8.00</strong>
              </p>
            </div>
          </div>

          {/* Configuración de Distancias (Opcional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
              Configuración de Distancias (Opcional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="distancia_minima">Distancia Mínima (km)</Label>
                <Input
                  id="distancia_minima"
                  name="distancia_minima"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.distancia_minima}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.distancia_minima ? "border-red-500" : ""}`}
                  placeholder="Dejar vacío si no aplica"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Solo para referencia (no afecta el cálculo)</p>
                {errors.distancia_minima && (
                  <p className="text-red-500 text-xs mt-1">{errors.distancia_minima}</p>
                )}
              </div>

              <div>
                <Label htmlFor="distancia_maxima">Distancia Máxima (km)</Label>
                <Input
                  id="distancia_maxima"
                  name="distancia_maxima"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.distancia_maxima}
                  onChange={handleInputChange}
                  className={`mt-1 ${errors.distancia_maxima ? "border-red-500" : ""}`}
                  placeholder="Dejar vacío si no aplica"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Solo para referencia (no afecta el cálculo)</p>
                {errors.distancia_maxima && (
                  <p className="text-red-500 text-xs mt-1">{errors.distancia_maxima}</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-800">
                <strong>Nota:</strong> Estos campos son opcionales y solo sirven como referencia. 
                El cálculo ahora usa únicamente: <strong>Precio Base + (Distancia × Precio por Km)</strong>
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-brand-500 hover:bg-brand-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : editingTarifa ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export { KilometrosTarifaModal }