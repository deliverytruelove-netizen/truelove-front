// app\socio\admin\pedidos\page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { fetchPedidos, getEstadoLabel, formatDate, type Pedido } from "../services/pedido.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Search, RefreshCw, X, Phone, MapPin, User, Clock, Package } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function PedidosPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const {
    data: pedidos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pedidos"],
    queryFn: fetchPedidos,
  })

  // Filtrar pedidos según búsqueda (solo pedidos entregados)
  const pedidosFiltrados = pedidos.filter((pedido) => {
    return (
      searchTerm === "" ||
      pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.detalle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.id.toString().includes(searchTerm)
    )
  })

  // Función para renderizar la tarjeta de pedido
  const renderPedidoCard = (pedido: Pedido) => {
    const estadoInfo = getEstadoLabel(pedido.estado)

    return (
      <Card key={pedido.id} className="mb-4 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Pedido #{pedido.id}
                <Badge className={estadoInfo.color}>{estadoInfo.label}</Badge>
              </CardTitle>
              <CardDescription className="mt-1">{formatDate(pedido.created_at)}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/socio/admin/pedidos/${pedido.id}`)}>
                Ver detalles
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Cliente:</span> {pedido.cliente}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Teléfono:</span> {pedido.celular}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Dirección:</span>{" "}
                <span className="truncate">{pedido.direccion_entrega || "No disponible"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Productos:</span>{" "}
                <span className="truncate">{pedido.detalle || "No hay detalles disponibles"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Última actualización:</span>{" "}
                {formatDate(pedido.updated_at || pedido.created_at)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historial de Entregas</h1>
          <p className="text-gray-600 mt-1">Pedidos entregados del día de hoy</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar entregas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
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
          <Button variant="ghost" size="icon" onClick={() => refetch()} title="Actualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "No se pudieron cargar los pedidos. Por favor, intente nuevamente."}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Total de entregas: 
              <Badge variant="secondary" className="ml-2">
                {pedidos.length}
              </Badge>
            </span>
          </div>
        </div>

        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              {searchTerm ? "No se encontraron entregas" : "No hay entregas registradas"}
            </h3>
            <p className="text-gray-500 mt-2">
              {searchTerm 
                ? "Intenta con otra búsqueda." 
                : "No hay pedidos entregados para el día de hoy."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          pedidosFiltrados.map(renderPedidoCard)
        )}
      </div>
    </div>
  )
}
