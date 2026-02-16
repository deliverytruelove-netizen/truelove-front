"use client"

import { useState } from "react"
import { CuotaSocio } from "../types/cuota-socio.types"
import { Pencil, Trash2, CheckCircle, XCircle, Search, X, RefreshCw, Calculator } from "lucide-react"
import { eliminarCuota } from "../services/cuota-socio.service"
import { calcularTodasLasCuotas } from "../services/cuota-admin.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { showAlert, confirmAlert } from "@/components/ui/DataTable/Alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"

interface CuotasListProps {
  cuotas: CuotaSocio[]
  onEdit: (cuota: CuotaSocio) => void
}

export default function CuotasList({ cuotas, onEdit }: CuotasListProps) {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState("")
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })

  const mutationDelete = useMutation({
    mutationFn: eliminarCuota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuotas-socios"] })
      showAlert({ title: "¡Eliminado!", text: "Cuota eliminada exitosamente", icon: "success" })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message || "Error al eliminar", icon: "error" })
    },
  })

  const mutationCalcular = useMutation({
    mutationFn: calcularTodasLasCuotas,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cuotas-socios"] })
      const message = typeof data === 'object' && data !== null && 'message' in data 
        ? (data as { message?: string }).message 
        : undefined
      showAlert({ 
        title: "¡Calculado!", 
        text: message || "Comisiones calculadas exitosamente", 
        icon: "success" 
      })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message || "Error al calcular comisiones", icon: "error" })
    },
  })

  const handleEliminar = async (id: number) => {
    const result = await confirmAlert({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la cuota permanentemente",
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })
    if (!result.isConfirmed) return
    mutationDelete.mutate(id)
  }

  const handleCalcular = async (cuota: CuotaSocio) => {
    if (cuota.tipo_cuota !== "porcentaje") {
      showAlert({ 
        title: "Información", 
        text: "Solo las cuotas de tipo porcentaje pueden calcularse automáticamente", 
        icon: "info" 
      })
      return
    }

    const result = await confirmAlert({
      title: "Calcular comisiones",
      text: `¿Calcular todas las comisiones pendientes para esta cuota? Esto calculará las ventas y comisiones de todos los socios asignados.`,
      icon: "question",
      confirmButtonText: "Sí, calcular",
      cancelButtonText: "Cancelar",
    })
    if (!result.isConfirmed) return
    mutationCalcular.mutate(cuota.id)
  }

  const getPeriodicidadLabel = (periodicidad: string) => {
    const labels: Record<string, string> = { diario: "Diario", semanal: "Semanal", quincenal: "Quincenal", mensual: "Mensual" }
    return labels[periodicidad] || periodicidad
  }

  const filteredCuotas = cuotas.filter((cuota) => {
    if (!globalFilter) return true
    const searchTerm = globalFilter.toLowerCase()
    return (
      getPeriodicidadLabel(cuota.periodicidad).toLowerCase().includes(searchTerm) ||
      String(cuota.monto_cuota).includes(searchTerm) ||
      cuota.numero_cuenta?.toLowerCase().includes(searchTerm) ||
      cuota.tipo_cuenta?.toLowerCase().includes(searchTerm) ||
      cuota.banco?.toLowerCase().includes(searchTerm) ||
      cuota.estado?.toLowerCase().includes(searchTerm)
    )
  })

  const paginatedCuotas = filteredCuotas.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Buscar..."
              className="w-full sm:w-64 pl-9 h-10"
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value)
                setPagination({ ...pagination, pageIndex: 0 })
              }}
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["cuotas-socios"] })}
            title="Actualizar"
          >
            <RefreshCw size={18} />
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-4 py-3 text-center w-12">#</th>
              <th scope="col" className="px-4 py-3">Periodicidad</th>
              <th scope="col" className="px-4 py-3">Tipo</th>
              <th scope="col" className="px-4 py-3">Monto/Comisión</th>
              <th scope="col" className="px-4 py-3">Cuenta Bancaria</th>
              <th scope="col" className="px-4 py-3">Banco</th>
              <th scope="col" className="px-4 py-3 text-center">Estado</th>
              <th scope="col" className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCuotas.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">No se encontraron cuotas</h3>
                  <p className="text-gray-500 mt-2">
                    {globalFilter ? "Intenta con otra búsqueda." : "No hay cuotas registradas."}
                  </p>
                  {globalFilter && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setGlobalFilter("")}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedCuotas.map((cuota, index) => {
                const rowNumber = pagination.pageSize * pagination.pageIndex + index + 1

                return (
                  <tr key={cuota.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center font-medium text-gray-600">{rowNumber}</td>
                    <td className="px-4 py-3"><span className="font-medium text-gray-800">{getPeriodicidadLabel(cuota.periodicidad)}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cuota.tipo_cuota === "porcentaje" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {cuota.tipo_cuota === "porcentaje" ? "Porcentaje" : "Monto Fijo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {cuota.tipo_cuota === "porcentaje" ? (
                        <div>
                          <div className="font-medium">{Number(cuota.porcentaje_comision).toFixed(2)}%</div>
                          {cuota.minimo_pedidos && (
                            <div className="text-xs text-gray-500">
                              Mín. {cuota.minimo_pedidos} pedidos
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>S/ {Number(cuota.monto_cuota).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-800">{cuota.numero_cuenta}</div>
                      {cuota.tipo_cuenta && <div className="text-xs text-gray-500">{cuota.tipo_cuenta}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cuota.banco || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      {cuota.estado === "activo" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Activo</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(cuota)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {cuota.tipo_cuota === "porcentaje" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCalcular(cuota)}
                            disabled={mutationCalcular.isPending}
                            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                            title="Calcular comisiones"
                          >
                            <Calculator className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEliminar(cuota.id)}
                          disabled={mutationDelete.isPending}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredCuotas.length > 0 && (
        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalPages={Math.ceil(filteredCuotas.length / pagination.pageSize)}
          totalItems={filteredCuotas.length}
          perPage={pagination.pageSize}
          onPageChange={(page) => setPagination({ ...pagination, pageIndex: page - 1 })}
          onPerPageChange={(perPage) => setPagination({ pageSize: perPage, pageIndex: 0 })}
          itemsInCurrentPage={paginatedCuotas.length}
        />
      )}
    </div>
  )
}
