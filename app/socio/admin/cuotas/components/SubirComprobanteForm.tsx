"use client"

import { useState, useEffect } from "react"
import { Upload, X, Image as ImageIcon, Calculator, Receipt, CreditCard } from "lucide-react"
import { subirComprobantePeriodo } from "../services/pago-cuota.service"
import Image from "next/image"
import Swal from "sweetalert2"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SubirComprobanteFormProps {
  periodoId: number
  montoPeriodo: number | string
  periodosDisponibles?: number
  tipoCuota?: "monto_fijo" | "porcentaje"
  onSuccess: () => void
  isOpen: boolean
  onClose: () => void
}

export default function SubirComprobanteForm({
  periodoId,
  montoPeriodo,
  periodosDisponibles = 1,
  tipoCuota = "monto_fijo",
  onSuccess,
  isOpen,
  onClose,
}: SubirComprobanteFormProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [cantidadPeriodos, setCantidadPeriodos] = useState(1)

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

  useEffect(() => {
    const montoTotal = cantidadPeriodos * montoBase
    setFormData(prev => ({ ...prev, monto_pagado: montoTotal }))
  }, [cantidadPeriodos, montoBase])

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

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

      setCantidadPeriodos(1)
      setFormData({
        monto_pagado: montoBase,
        metodo_pago: "yape",
        numero_operacion: "",
        observaciones: "",
        comprobante_pago: null,
      })
      setPreview(null)
      onClose()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md max-h-[90vh] bg-white dark:bg-gray-900 sm:rounded-lg shadow-xl overflow-hidden rounded-t-2xl sm:rounded-t-lg animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Subir Comprobante de Pago
          </h2>
          <button
            onClick={() => !loading && onClose()}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-52px)]">
          {/* Selector de cantidad de períodos - solo para monto fijo */}
          {tipoCuota === "monto_fijo" && periodosDisponibles > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ¿Cuántos períodos deseas pagar?
              </label>
              <Select
                value={cantidadPeriodos.toString()}
                onValueChange={(value) => setCantidadPeriodos(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona períodos" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: Math.min(periodosDisponibles, 12) }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} período{num !== 1 ? "s" : ""} {num > 1 && "(adelantados)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tienes {periodosDisponibles} período{periodosDisponibles !== 1 ? "s" : ""} disponible{periodosDisponibles !== 1 ? "s" : ""} para pagar
              </p>
            </div>
          )}

          {/* Monto calculado automáticamente */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-green-700 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">Monto Total a Pagar</span>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              S/ {Number(formData.monto_pagado || 0).toFixed(2)}
            </p>
            {tipoCuota === "monto_fijo" && cantidadPeriodos > 1 && (
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                {cantidadPeriodos} × S/ {Number(montoBase).toFixed(2)}
              </p>
            )}
          </div>

          {/* Método de Pago */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Método de Pago
              </span>
            </label>
            <Select
              value={formData.metodo_pago}
              onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yape">Yape</SelectItem>
                <SelectItem value="plin">Plin</SelectItem>
                <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                <SelectItem value="deposito">Depósito Bancario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Número de Operación */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Número de Operación <span className="text-gray-400 dark:text-gray-500 font-normal">(Opcional)</span>
            </label>
            <Input
              type="text"
              value={formData.numero_operacion}
              onChange={(e) => setFormData({ ...formData, numero_operacion: e.target.value })}
              placeholder="Ej: 0012345678"
            />
          </div>

          {/* Comprobante de Pago */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Comprobante de Pago <span className="text-red-500">*</span>
            </label>

            {!preview ? (
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all cursor-pointer">
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium text-brand-600 hover:text-brand-500">
                      <span>Seleccionar imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, WEBP, HEIC hasta 5MB</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative border-2 border-green-200 dark:border-green-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain max-h-44"
                  />
                  <button
                    type="button"
                    onClick={removePreview}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {formData.comprobante_pago?.name}
                </p>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observaciones <span className="text-gray-400 dark:text-gray-500 font-normal">(Opcional)</span>
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-200 px-3 py-2 text-sm transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-[#f34739] focus-visible:outline-none focus-visible:border-[#f34739] disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
              placeholder="Alguna nota adicional..."
            />
          </div>

          {/* Botón de envío */}
          <Button
            type="submit"
            disabled={loading || !formData.comprobante_pago}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Subiendo...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Subir Comprobante
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
