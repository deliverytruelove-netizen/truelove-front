"use client"

import { useState, useEffect, useCallback } from "react"
import { ShoppingBag, User, RefreshCw } from "lucide-react"
import { fetchPedidosPeriodo, type PedidoPeriodo } from "../services/pago-cuota.service"

interface PedidosPeriodoListProps {
  periodoId: number
  porcentajeComision?: number | null
}

export default function PedidosPeriodoList({ periodoId }: PedidosPeriodoListProps) {
  const [pedidos, setPedidos] = useState<PedidoPeriodo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPedidos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPedidosPeriodo(periodoId)
      setPedidos(data.pedidos)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }, [periodoId])

  useEffect(() => {
    loadPedidos()
  }, [loadPedidos])

  const totalVentas = pedidos.reduce((sum, p) => sum + p.subtotal, 0)
  const totalComision = pedidos.reduce((sum, p) => sum + p.comision, 0)

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha)
    return d.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" })
  }

  const formatHora = (fecha: string) => {
    const d = new Date(fecha)
    return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-brand-500" />
          Pedidos del Período
          {pedidos.length > 0 && (
            <span className="text-xs font-normal bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 px-1.5 py-0.5 rounded-full">
              {pedidos.length}
            </span>
          )}
        </h3>
        {!loading && (
          <button
            onClick={loadPedidos}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            title="Actualizar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cargando pedidos...</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-center">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button onClick={loadPedidos} className="text-xs text-brand-600 hover:underline mt-1">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && pedidos.length === 0 && (
        <div className="p-6 text-center">
          <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay pedidos completados en este período</p>
        </div>
      )}

      {!loading && !error && pedidos.length > 0 && (
        <div>
          {/* Lista de pedidos */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        #{pedido.codigo || pedido.id}
                      </span>
                    </div>
                    {pedido.cliente && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{pedido.cliente}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatFecha(pedido.fecha)} {formatHora(pedido.fecha)}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      S/ {pedido.subtotal.toFixed(2)}
                    </p>
                    <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                      -{" "}S/ {pedido.comision.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {pedido.num_productos} producto{pedido.num_productos !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} completado{pedidos.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Ventas: </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">S/ {totalVentas.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Comisión: </span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">S/ {totalComision.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
