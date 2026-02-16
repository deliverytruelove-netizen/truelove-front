"use client"

import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PagoCuotaSocio } from "../types/cuota-socio.types"
import { CheckCircle, XCircle, Clock, Eye, Search } from "lucide-react"
import { aprobarPago, rechazarPago } from "../services/cuota-socio.service"
import Image from "next/image"
import { showAlert, confirmAlert } from "@/components/ui/DataTable/Alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"

interface PagosRecibidosListProps {
  pagos: PagoCuotaSocio[]
}

export default function PagosRecibidosList({ pagos }: PagosRecibidosListProps) {
  const queryClient = useQueryClient()
  const [selectedPago, setSelectedPago] = useState<PagoCuotaSocio | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showRechazarModal, setShowRechazarModal] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState("")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE)

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["cuotas-pagos"] })
    queryClient.invalidateQueries({ queryKey: ["cuotas-socios-estadisticas"] })
  }

  const mutationAprobar = useMutation({
    mutationFn: (id: number) => aprobarPago(id),
    onSuccess: () => {
      invalidateQueries()
      showAlert({
        title: "¡Aprobado!",
        text: "Pago aprobado exitosamente",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message || "Error al aprobar",
        icon: "error",
      })
    },
  })

  const mutationRechazar = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      rechazarPago(id, motivo),
    onSuccess: () => {
      invalidateQueries()
      setMotivoRechazo("")
      setSelectedPago(null)
      showAlert({
        title: "Rechazado",
        text: "Pago rechazado exitosamente",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message || "Error al rechazar",
        icon: "error",
      })
      setShowRechazarModal(true)
    },
  })

  const handleAprobar = async (id: number) => {
    const result = await confirmAlert({
      title: "¿Aprobar este pago?",
      text: "Esta acción marcará el pago como aprobado",
      icon: "question",
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    mutationAprobar.mutate(id)
  }

  const handleRechazar = async () => {
    if (!selectedPago || !motivoRechazo.trim()) {
      showAlert({
        title: "Motivo requerido",
        text: "Debe indicar un motivo de rechazo",
        icon: "warning",
      })
      return
    }

    setShowRechazarModal(false)
    mutationRechazar.mutate({ id: selectedPago.id, motivo: motivoRechazo })
  }

  const isLoading = mutationAprobar.isPending || mutationRechazar.isPending

  const filteredPagos = useMemo(() => {
    if (!search.trim()) return pagos
    const term = search.toLowerCase()
    return pagos.filter((pago) => {
      const nombre = `${pago.socio?.name ?? ""} ${pago.socio?.lastName ?? ""}`.toLowerCase()
      const email = (pago.socio?.email ?? "").toLowerCase()
      const metodo = (pago.metodo_pago ?? "").toLowerCase()
      return nombre.includes(term) || email.includes(term) || metodo.includes(term)
    })
  }, [pagos, search])

  const totalPages = Math.max(1, Math.ceil(filteredPagos.length / perPage))
  const paginatedPagos = filteredPagos.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
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
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, email o método de pago..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-4 py-3">#</th>
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
            {paginatedPagos.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="text-gray-500">No hay pagos registrados</div>
                </td>
              </tr>
            ) : (
              paginatedPagos.map((pago, index) => (
                <tr key={pago.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">
                    {(currentPage - 1) * perPage + index + 1}
                  </td>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPago(pago)
                          setShowImageModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                    ) : (
                      <span className="text-gray-400">Sin comprobante</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{getEstadoBadge(pago.estado_pago)}</td>
                  <td className="px-4 py-3">
                    {pago.estado_pago === "pendiente" && (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAprobar(pago.id)}
                          disabled={isLoading}
                          className="text-green-600 hover:text-green-800 hover:bg-green-50 h-8 w-8"
                          title="Aprobar"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPago(pago)
                            setShowRechazarModal(true)
                          }}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 w-8"
                          title="Rechazar"
                        >
                          <XCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                    {pago.estado_pago === "rechazado" && pago.motivo_rechazo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-600 hover:text-red-800"
                        title={pago.motivo_rechazo}
                      >
                        Ver motivo
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredPagos.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPagos.length}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          itemsInCurrentPage={paginatedPagos.length}
        />
      )}

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
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRechazarModal(false)
                  setMotivoRechazo("")
                  setSelectedPago(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleRechazar}
                disabled={mutationRechazar.isPending || !motivoRechazo.trim()}
              >
                {mutationRechazar.isPending ? "Rechazando..." : "Rechazar Pago"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
