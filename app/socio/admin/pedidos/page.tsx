// app\socio\admin\pedidos\page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { fetchPedidos, getEstadoLabel, formatDate, type Pedido } from "../services/pedido.service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertCircle, Search, RefreshCw, X, Phone, MapPin, User, Package, 
  Bike, CreditCard, FileText, Receipt, ChevronDown, ChevronUp, ShoppingBag,
  CheckCircle2, History, Eye, Download, Printer
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { TicketModal } from "../components/ticket/TicketModal"

export default function PedidosPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [fechaFiltro, setFechaFiltro] = useState<string>("hoy")
  const [expandedPedido, setExpandedPedido] = useState<number | null>(null)
  const [fotoPagoUrl, setFotoPagoUrl] = useState<string | null>(null)

  const {
    data: pedidos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pedidos", fechaFiltro],
    queryFn: () => fetchPedidos(fechaFiltro, "finalizados"),
  })

  // Filtrar pedidos según búsqueda
  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (searchTerm === "") return true
    const search = searchTerm.toLowerCase()
    return (
      pedido.cliente.toLowerCase().includes(search) ||
      pedido.detalle.toLowerCase().includes(search) ||
      pedido.id.toString().includes(search) ||
      pedido.motorizado?.toLowerCase().includes(search) ||
      pedido.celular.includes(search)
    )
  })

  const toggleExpand = (id: number) => {
    setExpandedPedido(expandedPedido === id ? null : id)
  }

  // Descargar foto de pago - abre en nueva pestaña para descargar
  const handleDownloadFoto = (url: string) => {
    window.open(url, '_blank')
  }

  // Calcular subtotal de productos (sin delivery)
  const calcularSubtotal = (pedido: Pedido) => {
    const subtotal = pedido.detalleArray?.reduce((sum, item) => {
      return sum + parseFloat(item.precio) * item.cantidad
    }, 0) || 0
    const descuento = parseFloat(pedido.descuento || "0")
    return subtotal - descuento
  }

  // Renderizar tarjeta de pedido mejorada
  const renderPedidoCard = (pedido: Pedido) => {
    const estadoInfo = getEstadoLabel(pedido.estado)
    const isExpanded = expandedPedido === pedido.id
    const subtotal = calcularSubtotal(pedido)
    const tipoPedidoLabel = pedido.tipo_pedido === 0 ? "Delivery" : "Recojo"

    return (
      <Card key={pedido.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-all">
        {/* Header de la tarjeta */}
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          onClick={() => toggleExpand(pedido.id)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">#{pedido.id}</span>
              <Badge className={estadoInfo.color}>{estadoInfo.label}</Badge>
              <Badge variant="outline" className="text-xs">
                {tipoPedidoLabel}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formatDate(pedido.created_at)}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Info principal en una línea */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{pedido.cliente}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-4 w-4" />
              {pedido.celular}
            </span>
            {pedido.tipo_pago && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                {pedido.tipo_pago}
              </span>
            )}
            {pedido.motorizado && (
              <span className="flex items-center gap-1.5 text-blue-600">
                <Bike className="h-4 w-4" />
                {pedido.motorizado}
              </span>
            )}
            <span className="ml-auto font-bold text-green-600">
              S/ {subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Contenido expandido */}
        {isExpanded && (
          <CardContent className="pt-0 pb-4 px-4 border-t bg-gray-50/50 dark:bg-gray-800/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Columna izquierda - Datos del cliente y entrega */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-600" />
                  Datos del Cliente
                </h4>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{pedido.cliente}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{pedido.celular}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`tel:${pedido.celular}`)
                      }}
                    >
                      Llamar
                    </Button>
                  </div>
                  {pedido.direccion_entrega && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{pedido.direccion_entrega}</span>
                    </div>
                  )}
                </div>

                {/* Motorizado */}
                {pedido.motorizado && (
                  <>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mt-4">
                      <Bike className="h-4 w-4 text-blue-600" />
                      Motorizado
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pedido.motorizado}</span>
                      </div>
                      {pedido.celular_motorizado && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{pedido.celular_motorizado}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`tel:${pedido.celular_motorizado}`)
                            }}
                          >
                            Llamar
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Nota */}
                {pedido.nota && pedido.nota !== "Sin nota" && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span className="italic">{pedido.nota}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Columna derecha - Productos y totales */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-brand-600" />
                  Productos
                </h4>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  {pedido.detalleArray && pedido.detalleArray.length > 0 ? (
                    <div className="space-y-1.5">
                      {pedido.detalleArray.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.nombre} x{item.cantidad}
                            {item.tipo === "adicional" && (
                              <span className="text-blue-600 ml-1">(adic.)</span>
                            )}
                          </span>
                          <span className="font-medium tabular-nums">
                            S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{pedido.detalle}</p>
                  )}

                  {/* Totales */}
                  <div className="border-t mt-3 pt-3 space-y-1.5">
                    {pedido.descuento && parseFloat(pedido.descuento) > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento</span>
                        <span className="tabular-nums">-S/ {parseFloat(pedido.descuento).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-1">
                      <span>Total</span>
                      <span className="tabular-nums text-green-600">S/ {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Info de pago y comprobante */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Método de pago:</span>
                    <span>{pedido.tipo_pago || "Efectivo"}</span>
                  </div>
                  {pedido.tipo_comprobante && (
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Comprobante:</span>
                      <span>{pedido.tipo_comprobante}</span>
                      {pedido.documento && <span className="text-muted-foreground">({pedido.documento})</span>}
                    </div>
                  )}
                  
                  {/* Botón Ver Pago - si hay foto de pago */}
                  {pedido.foto_pago && (
                    <div className="flex items-center gap-2 pt-2 border-t mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFotoPagoUrl(pedido.foto_pago!)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver pago
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadFoto(pedido.foto_pago!)
                        }}
                        title="Descargar imagen"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 mt-4">
              <TicketModal
                pedido={pedido}
                trigger={
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Ticket
                  </Button>
                }
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/socio/admin/pedidos/${pedido.id}`)
                }}
              >
                Ver detalle completo
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-green-600" />
            Historial de Entregas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fechaFiltro === "hoy" && "Pedidos entregados del día de hoy"}
            {fechaFiltro === "todas" && "Todos los pedidos entregados"}
            {fechaFiltro !== "hoy" && fechaFiltro !== "todas" && `Pedidos del ${fechaFiltro}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => refetch()} title="Actualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filtro de Fecha */}
        <div className="flex gap-2">
          <Button
            variant={fechaFiltro === "hoy" ? "default" : "outline"}
            size="sm"
            onClick={() => setFechaFiltro("hoy")}
            className={fechaFiltro === "hoy" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            Hoy
          </Button>
          <Button
            variant={fechaFiltro === "todas" ? "default" : "outline"}
            size="sm"
            onClick={() => setFechaFiltro("todas")}
            className={fechaFiltro === "todas" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            Todas
          </Button>
          <Input
            type="date"
            value={fechaFiltro !== "hoy" && fechaFiltro !== "todas" ? fechaFiltro : ""}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="w-[150px] h-9"
            placeholder="Fecha específica"
          />
        </div>

        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por cliente, producto, motorizado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contador */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium">
          {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? "entrega" : "entregas"}
        </span>
      </div>

      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "No se pudieron cargar los pedidos."}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de pedidos */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, index) => (
            <Card key={index}>
              <div className="p-4">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium">
            {searchTerm ? "No se encontraron entregas" : "No hay entregas registradas"}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {searchTerm 
              ? "Intenta con otra búsqueda." 
              : "No hay pedidos entregados para el período seleccionado."}
          </p>
          {searchTerm && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
              Limpiar búsqueda
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosFiltrados.map(renderPedidoCard)}
        </div>
      )}

      {/* Dialog para ver foto de pago */}
      <Dialog open={!!fotoPagoUrl} onOpenChange={() => setFotoPagoUrl(null)}>
        <DialogContent className="sm:max-w-fit p-0 border-0 bg-transparent shadow-none [&>button]:bg-white [&>button]:rounded-full [&>button]:p-1 [&>button]:shadow-lg [&>button]:-right-2 [&>button]:-top-2 [&>button]:opacity-100">
          {fotoPagoUrl && (
            <img 
              src={fotoPagoUrl} 
              alt="Comprobante de pago" 
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
