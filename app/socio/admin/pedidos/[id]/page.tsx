// app\socio\admin\pedidos\[id]\page.tsx
"use client"

import { Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { fetchPedidos, getEstadoLabel, formatDate } from "../../services/pedido.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, MapPin, Phone, User, Clock, Package, Truck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

// Componente de carga para Suspense
function LoadingPedido() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/4 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente principal que maneja la lógica de datos
function PedidoDetalleContent() {
  const params = useParams()
  const router = useRouter()

  // Extraer el ID del pedido de los parámetros
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""
  const pedidoId = Number.parseInt(id)

  const {
    data: pedidos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pedidos"],
    queryFn: fetchPedidos,
  })

  const pedido = pedidos.find((p) => p.id === pedidoId)

  if (isLoading) {
    return <LoadingPedido />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "No se pudo cargar la información del pedido. Por favor, intente nuevamente."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pedido no encontrado</AlertTitle>
          <AlertDescription>
            No se encontró el pedido con ID {pedidoId}. Por favor, verifique el ID e intente nuevamente.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const estadoInfo = getEstadoLabel(pedido.estado)

  return (
    <div className="space-y-6">
      {/* Header con estilo TRUE LOVE */}
      <div className="bg-brand-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 -ml-3 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al historial
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Pedido #{pedido.id}</h1>
            <p className="text-brand-100 mt-1">Detalle de entrega completada</p>
          </div>
          <Badge className="bg-white text-brand-700 hover:bg-white shadow-md">
            {estadoInfo.label}
          </Badge>
        </div>
      </div>

      {/* Tarjetas con diseño TRUE LOVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del Cliente */}
        <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-brand-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-brand-100 text-brand-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-brand-600">Información del Cliente</CardTitle>
                <CardDescription>Datos del destinatario</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
              <User className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Cliente</p>
                <p className="text-sm font-semibold text-gray-900">{pedido.cliente}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
              <Phone className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                <p className="text-sm font-semibold text-gray-900">{pedido.celular}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-brand-50 rounded-lg">
              <MapPin className="h-5 w-5 text-brand-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Dirección de entrega</p>
                <p className="text-sm font-semibold text-gray-900">
                  {pedido.direccion_entrega || "No disponible"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles del Pedido */}
        <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-brand-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-brand-100 text-brand-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-brand-600">Detalles del Pedido</CardTitle>
                <CardDescription>Productos y estado</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-brand-50 rounded-lg border-2 border-dashed border-brand-200">
              <p className="text-xs text-brand-600 font-medium mb-2">Productos entregados</p>
              <p className="text-sm font-semibold text-gray-900">
                {pedido.detalle || "No hay detalles disponibles"}
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
              <Clock className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Fecha de entrega</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(pedido.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Truck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-green-700 font-medium">Estado de entrega</p>
                <Badge className={`${estadoInfo.color} mt-1`}>{estadoInfo.label}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Local */}
        <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-brand-500 md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-brand-100 text-brand-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-brand-600">Información del Local</CardTitle>
                <CardDescription>Datos del establecimiento</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
                <Package className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Nombre del local</p>
                  <p className="text-sm font-semibold text-gray-900">{pedido.local}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-brand-50 rounded-lg">
                <MapPin className="h-5 w-5 text-brand-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Dirección del local</p>
                  <p className="text-sm font-semibold text-gray-900">{pedido.direccion_local}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón de regreso con estilo TRUE LOVE */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={() => router.back()}
          className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg transition-all duration-300"
          size="lg"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Historial de Entregas
        </Button>
      </div>
    </div>
  )
}

// Página principal que usa Suspense
export default function Page() {
  return (
    <Suspense fallback={<LoadingPedido />}>
      <PedidoDetalleContent />
    </Suspense>
  )
}
