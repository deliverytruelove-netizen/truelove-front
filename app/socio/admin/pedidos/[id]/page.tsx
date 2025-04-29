// app\socio\admin\pedidos\[id]\page.tsx
"use client"

import { useState, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchPedidos, actualizarEstadoPedido, getEstadoLabel, formatDate } from "../../services/pedido.service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, MapPin, Phone, User, Clock, Package, Truck, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
    const queryClient = useQueryClient()
  const params = useParams()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

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

  const actualizarEstadoMutation = useMutation({
    mutationFn: ({ pedidoId, estado }: { pedidoId: number; estado: number }) =>
        actualizarEstadoPedido(pedidoId, estado),
      onSuccess: async () => {
        // Invalidar la consulta para refrescar los datos
       await queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === "pedidos" || 
          (query.queryKey[0] === "pedido" && query.queryKey[1] === pedidoId)
      })
        setIsUpdating(false)
      },
    onError: (error) => {
      console.error("Error al actualizar el estado:", error)
      setIsUpdating(false)
    },
  })

  const handleActualizarEstado = (estado: number) => {
    setIsUpdating(true)
    actualizarEstadoMutation.mutate({ pedidoId, estado })
  }

  // Mapeo de estados a números según el backend
  const estadosDisponibles = [
    { value: 1, label: "Pendiente" },
    { value: 2, label: "Aceptado" },
    { value: 3, label: "En preparación" },
    { value: 4, label: "Listo para entrega" },
    { value: 5, label: "En camino" },
    { value: 6, label: "Entregado" },
    { value: 7, label: "Cancelado" },
  ]

  // Determinar el siguiente estado lógico
  const getNextState = (currentState: string): number | null => {
    switch (currentState) {
      case "Pendiente":
        return 2 // Aceptado
      case "Aceptado":
        return 3 // En preparación
      case "En preparación":
        return 4 // Listo para entrega
      case "Listo para entrega":
        return 5 // En camino
      case "En camino":
        return 6 // Entregado
      default:
        return null
    }
  }

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
  const nextState = pedido ? getNextState(pedido.estado) : null
  const nextStateLabel = nextState ? estadosDisponibles.find((e) => e.value === nextState)?.label : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Pedido #{pedido.id}</h1>
          <Badge className={estadoInfo.color}>{estadoInfo.label}</Badge>
        </div>
        <div className="flex gap-2">
          {nextState && pedido.estado !== "Entregado" && pedido.estado !== "Cancelado" && (
            <Button
              onClick={() => handleActualizarEstado(nextState)}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? "Actualizando..." : `Marcar como ${nextStateLabel}`}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
          {pedido.estado !== "Cancelado" && pedido.estado !== "Entregado" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancelar pedido</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción cancelará el pedido #{pedido.id} y no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleActualizarEstado(7)} className="bg-red-600 hover:bg-red-700">
                    Confirmar cancelación
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del pedido</CardTitle>
          <CardDescription>Pedido realizado el {formatDate(pedido.created_at)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Información del cliente</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Nombre:</span> {pedido.cliente}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Teléfono:</span> {pedido.celular}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Dirección de entrega:</span>{" "}
                    {pedido.direccion_entrega || "No disponible"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Información del restaurante</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Nombre:</span> {pedido.local}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Dirección:</span> {pedido.direccion_local}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Detalles del pedido</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Productos:</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm">{pedido.detalle || "No hay detalles disponibles"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Estado del pedido</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Fecha de creación:</span> {formatDate(pedido.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Estado actual:</span>
                    <Badge className={estadoInfo.color}>{estadoInfo.label}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Cambiar estado</h3>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => handleActualizarEstado(Number.parseInt(value))}
                    disabled={isUpdating || pedido.estado === "Entregado" || pedido.estado === "Cancelado"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar nuevo estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosDisponibles.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value.toString()}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Volver a la lista
          </Button>
          {pedido.estado !== "Entregado" && pedido.estado !== "Cancelado" && nextState && (
            <Button
              onClick={() => handleActualizarEstado(nextState)}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? "Actualizando..." : `Marcar como ${nextStateLabel}`}
            </Button>
          )}
        </CardFooter>
      </Card>
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
