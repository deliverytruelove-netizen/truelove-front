"use client"

import { useState } from "react"
import { PagoCuotaSocio } from "../types/cuota-socio.types"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { aprobarPago, rechazarPago } from "../services/cuota-socio.service"
import Image from "next/image"
import Swal from "sweetalert2"

interface PagosRecibidosListProps {
  pagos: PagoCuotaSocio[]
  onRefresh: () => void
}

export default function PagosRecibidosList({ pagos, onRefresh }: PagosRecibidosListProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPago, setSelectedPago] = useState<PagoCuotaSocio | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showRechazarModal, setShowRechazarModal] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState("")

  const handleAprobar = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Aprobar este pago?",
      text: "Esta acción marcará el pago como aprobado",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    // Mostrar loader profesional
    Swal.fire({
      title: "Aprobando pago...",
      html: "Por favor espera mientras procesamos la aprobación",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    setLoading(true)
    try {
      await aprobarPago(id)
      await Swal.fire({
        title: "¡Aprobado!",
        text: "Pago aprobado exitosamente",
        icon: "success",
        confirmButtonColor: "#dc2626",
      })
      onRefresh()
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al aprobar",
        icon: "error",
        confirmButtonColor: "#dc2626",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRechazar = async () => {
    if (!selectedPago || !motivoRechazo.trim()) {
      await Swal.fire({
        title: "Motivo requerido",
        text: "Debe indicar un motivo de rechazo",
        icon: "warning",
        confirmButtonColor: "#dc2626",
      })
      return
    }

    // Cerrar el modal de rechazo
    setShowRechazarModal(false)

    // Mostrar loader profesional
    Swal.fire({
      title: "Rechazando pago...",
      html: "Por favor espera mientras procesamos el rechazo",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    setLoading(true)
    try {
      await rechazarPago(selectedPago.id, motivoRechazo)
      await Swal.fire({
        title: "Rechazado",
        text: "Pago rechazado exitosamente",
        icon: "success",
        confirmButtonColor: "#dc2626",
      })
      setMotivoRechazo("")
      setSelectedPago(null)
      onRefresh()
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al rechazar",
        icon: "error",
        confirmButtonColor: "#dc2626",
      })
      // Reabrir el modal si hay error
      setShowRechazarModal(true)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    if (estado === "aprobado") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprobado
        </span>
      )
    }
    if (estado === "rechazado") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rechazado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pendiente
      </span>
    )
  }

  return (
    <>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-4 py-3">Socio</th>
              <th scope="col" className="px-4 py-3">Monto</th>
              <th scope="col" className="px-4 py-3">Método</th>
              <th scope="col" className="px-4 py-3">Fecha Pago</th>
              <th scope="col" className="px-4 py-3 text-center">Comprobante</th>
              <th scope="col" className="px-4 py-3 text-center">Estado</th>
              <th scope="col" className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="text-gray-500">No hay pagos registrados</div>
                </td>
              </tr>
            ) : (
              pagos.map((pago) => (
                <tr key={pago.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {pago.socio?.name} {pago.socio?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{pago.socio?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800">S/ {Number(pago.monto_pagado).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{pago.metodo_pago || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    {pago.comprobante_pago ? (
                      <button
                        onClick={() => {
                          setSelectedPago(pago)
                          setShowImageModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    ) : (
                      <span className="text-gray-400">Sin comprobante</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{getEstadoBadge(pago.estado_pago)}</td>
                  <td className="px-4 py-3">
                    {pago.estado_pago === "pendiente" && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAprobar(pago.id)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1.5 rounded disabled:opacity-50 transition-colors"
                          title="Aprobar"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPago(pago)
                            setShowRechazarModal(true)
                          }}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded disabled:opacity-50 transition-colors"
                          title="Rechazar"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {pago.estado_pago === "rechazado" && pago.motivo_rechazo && (
                      <button
                        className="text-xs text-red-600 hover:text-red-800 hover:underline"
                        title={pago.motivo_rechazo}
                      >
                        Ver motivo
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Ver Imagen */}
      {showImageModal && selectedPago?.comprobante_pago && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <Image
              src={`/storage/${selectedPago.comprobante_pago}`}
              alt="Comprobante"
              width={800}
              height={600}
              className="rounded-lg object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Modal Rechazar */}
      {showRechazarModal && selectedPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Rechazar Pago</h3>
            <p className="text-sm text-gray-600 mb-4">
              Indique el motivo del rechazo para el pago de{" "}
              <strong>
                {selectedPago.socio?.name} {selectedPago.socio?.lastName}
              </strong>
            </p>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="Escriba el motivo del rechazo..."
              required
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRechazarModal(false)
                  setMotivoRechazo("")
                  setSelectedPago(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={loading || !motivoRechazo.trim()}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Rechazando..." : "Rechazar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
