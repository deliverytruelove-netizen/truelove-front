"use client"

import { useState } from "react"
import { CuotaSocio } from "../types/cuota-socio.types"
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react"
import { eliminarCuota } from "../services/cuota-socio.service"
import Swal from "sweetalert2"

interface CuotasListProps {
  cuotas: CuotaSocio[]
  onEdit: (cuota: CuotaSocio) => void
  onRefresh: () => void
}

export default function CuotasList({ cuotas, onEdit, onRefresh }: CuotasListProps) {
  const [loading, setLoading] = useState(false)

  const handleEliminar = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la cuota permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    setLoading(true)
    try {
      await eliminarCuota(id)
      await Swal.fire({
        title: "¡Eliminado!",
        text: "Cuota eliminada exitosamente",
        icon: "success",
        confirmButtonColor: "#dc2626",
      })
      onRefresh()
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al eliminar",
        icon: "error",
        confirmButtonColor: "#dc2626",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPeriodicidadLabel = (periodicidad: string) => {
    const labels: Record<string, string> = {
      diario: "Diario",
      semanal: "Semanal",
      quincenal: "Quincenal",
      mensual: "Mensual",
    }
    return labels[periodicidad] || periodicidad
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-4 py-3">
              Periodicidad
            </th>
            <th scope="col" className="px-4 py-3">
              Monto
            </th>
            <th scope="col" className="px-4 py-3">
              Cuenta Bancaria
            </th>
            <th scope="col" className="px-4 py-3">
              Banco
            </th>
            <th scope="col" className="px-4 py-3 text-center">
              Estado
            </th>
            <th scope="col" className="px-4 py-3 text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {cuotas.length === 0 ? (
            <tr className="bg-white">
              <td colSpan={6} className="px-4 py-12 text-center">
                <div className="text-gray-500">No hay cuotas registradas</div>
              </td>
            </tr>
          ) : (
            cuotas.map((cuota) => (
              <tr key={cuota.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-800">
                    {getPeriodicidadLabel(cuota.periodicidad)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">S/ {Number(cuota.monto_cuota).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div className="text-gray-800">{cuota.numero_cuenta}</div>
                  {cuota.tipo_cuenta && <div className="text-xs text-gray-500">{cuota.tipo_cuenta}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">{cuota.banco || "-"}</td>
                <td className="px-4 py-3 text-center">
                  {cuota.estado === "activo" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(cuota)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEliminar(cuota.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded disabled:opacity-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
