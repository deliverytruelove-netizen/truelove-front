"use client"

import { useState, useEffect } from "react"
import { Upload, X, Image as ImageIcon, Calculator } from "lucide-react"
import { subirComprobantePeriodo } from "../services/pago-cuota.service"
import Image from "next/image"
import Swal from "sweetalert2"

interface SubirComprobanteFormProps {
  periodoId: number
  montoPeriodo: number | string // Puede venir como string del backend
  periodosDisponibles?: number // Cuántos períodos pendientes tiene el socio
  onSuccess: () => void
}

export default function SubirComprobanteForm({
  periodoId,
  montoPeriodo,
  periodosDisponibles = 1,
  onSuccess
}: SubirComprobanteFormProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [cantidadPeriodos, setCantidadPeriodos] = useState(1)

  // Asegurar que montoPeriodo siempre sea un número válido (puede venir como string del backend)
  const montoBase = (() => {
    if (typeof montoPeriodo === 'number' && !isNaN(montoPeriodo)) {
      return montoPeriodo
    }
    if (typeof montoPeriodo === 'string') {
      const parsed = parseFloat(montoPeriodo)
      return !isNaN(parsed) ? parsed : 0
    }
    return 0
  })()

  const [formData, setFormData] = useState({
    monto_pagado: montoBase,
    metodo_pago: "yape",
    numero_operacion: "",
    observaciones: "",
    comprobante_pago: null as File | null,
  })

  // Calcular monto automáticamente cuando cambia la cantidad de períodos
  useEffect(() => {
    const montoTotal = cantidadPeriodos * montoBase
    setFormData(prev => ({ ...prev, monto_pagado: montoTotal }))
  }, [cantidadPeriodos, montoBase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: "Archivo muy grande",
          text: "La imagen no debe superar 5MB",
          icon: "warning",
          confirmButtonColor: "#dc2626",
        })
        return
      }

      setFormData({ ...formData, comprobante_pago: file })

      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.comprobante_pago) {
      await Swal.fire({
        title: "Comprobante requerido",
        text: "Debe seleccionar un comprobante de pago",
        icon: "warning",
        confirmButtonColor: "#dc2626",
      })
      return
    }

    // Mostrar loader profesional
    Swal.fire({
      title: "Subiendo comprobante...",
      html: "Por favor espera mientras procesamos tu pago",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    setLoading(true)
    try {
      await subirComprobantePeriodo(
        periodoId,
        formData.comprobante_pago,
        formData.monto_pagado,
        formData.metodo_pago,
        formData.numero_operacion || undefined,
        formData.observaciones || undefined,
      )

      await Swal.fire({
        title: "¡Éxito!",
        text: "Comprobante subido exitosamente. En espera de aprobación.",
        icon: "success",
        confirmButtonColor: "#dc2626",
      })

      // Reset form
      setCantidadPeriodos(1)
      setFormData({
        monto_pagado: montoBase,
        metodo_pago: "yape",
        numero_operacion: "",
        observaciones: "",
        comprobante_pago: null,
      })
      setPreview(null)
      onSuccess()
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al subir comprobante",
        icon: "error",
        confirmButtonColor: "#dc2626",
      })
    } finally {
      setLoading(false)
    }
  }

  const removePreview = () => {
    setPreview(null)
    setFormData({ ...formData, comprobante_pago: null })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Subir Comprobante de Pago</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de cantidad de períodos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Cuántos períodos deseas pagar?
          </label>
          <select
            value={cantidadPeriodos}
            onChange={(e) => setCantidadPeriodos(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {Array.from({ length: Math.min(periodosDisponibles, 12) }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} período{num !== 1 ? "s" : ""} {num > 1 && `(adelantados)`}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-2">
            Tienes {periodosDisponibles} período{periodosDisponibles !== 1 ? "s" : ""} disponible{periodosDisponibles !== 1 ? "s" : ""} para pagar
          </p>
        </div>

        {/* Monto calculado automáticamente (NO editable) */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-gray-700" />
            <label className="block text-sm font-medium text-gray-700">
              Monto Total a Pagar
            </label>
          </div>
          <div className="text-3xl font-bold text-green-600">
            S/ {Number(formData.monto_pagado || 0).toFixed(2)}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {cantidadPeriodos} × S/ {Number(montoBase).toFixed(2)} = S/ {Number(formData.monto_pagado || 0).toFixed(2)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
          <select
            value={formData.metodo_pago}
            onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="yape">Yape</option>
            <option value="transferencia">Transferencia</option>
            <option value="deposito">Depósito</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Operación (Opcional)</label>
          <input
            type="text"
            value={formData.numero_operacion}
            onChange={(e) => setFormData({ ...formData, numero_operacion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 0012345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante de Pago (Imagen) *</label>

          {!preview ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Subir imagen</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleFileChange}
                      className="sr-only"
                      required
                    />
                  </label>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
              </div>
            </div>
          ) : (
            <div className="relative mt-2">
              <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={300}
                  className="w-full h-auto object-contain max-h-64"
                />
                <button
                  type="button"
                  onClick={removePreview}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                {formData.comprobante_pago?.name}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (Opcional)</label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Alguna nota adicional..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.comprobante_pago}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Subiendo..." : "Subir Comprobante"}
        </button>
      </form>
    </div>
  )
}
