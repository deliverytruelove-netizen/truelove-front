// app\motorizado\admin\components\pedidos-activos.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, CheckCircle, Clock, Phone, User, PackageIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useMotorizado } from "../context/MotorizadoContext"

export default function PedidosActivos() {
  const { pedidos, loading, error, iniciarEntrega, confirmarEntrega, abrirMapa, llamarCliente, actualizarPedidos } =
    useMotorizado()

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "en camino":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "entregado":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return <Clock className="h-4 w-4" />
      case "en camino":
        return <Navigation className="h-4 w-4" />
      case "entregado":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="mt-1 h-4 w-4" />
                  <div className="w-full">
                    <Skeleton className="mb-1 h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Skeleton className="mb-1 h-3 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div>
                    <Skeleton className="mb-1 h-3 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div>
                    <Skeleton className="mb-1 h-3 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <PackageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
        <p className="mb-4 text-center text-muted-foreground">{error}</p>
        <Button onClick={actualizarPedidos}>Intentar nuevamente</Button>
      </div>
    )
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <PackageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
        <p className="text-center text-muted-foreground">No hay pedidos activos en este momento</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pedidos.map((pedido) => (
        <Card key={pedido.id} className="overflow-hidden">
          <CardHeader className="bg-muted/30 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pedido #{pedido.id}</CardTitle>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 px-2 py-1 text-xs font-medium ${getEstadoColor(pedido.estado)}`}
              >
                {getEstadoIcon(pedido.estado)}
                <span>{pedido.estado}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dirección de entrega</p>
                  <p className="text-sm text-muted-foreground">{pedido.direccion_entrega}</p>
                  <div className="mt-1 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => abrirMapa(pedido.latitud, pedido.longitud)}
                    >
                      <Navigation className="mr-1 h-3 w-3" /> Ver ruta
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <PackageIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Restaurante</p>
                  <p className="text-sm text-muted-foreground">{pedido.local}</p>
                  <p className="text-xs text-muted-foreground">{pedido.direccion_local}</p>
                  <div className="mt-1 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => abrirMapa(pedido.lat_local, pedido.lon_local)}
                    >
                      <Navigation className="mr-1 h-3 w-3" /> Ver local
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Cliente</p>
                  </div>
                  <p className="font-medium">{pedido.cliente}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Contacto</p>
                  </div>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm font-medium"
                    onClick={() => llamarCliente(pedido.celular)}
                  >
                    {pedido.celular}
                  </Button>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">Detalle</p>
                <p className="font-medium">{pedido.detalle}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tiempo estimado</p>
                  <p className="font-medium">{pedido.tiempo_estimado} min</p>
                </div>
                {pedido.estado.toLowerCase() === "pendiente" && (
                  <Button className="w-full" onClick={() => iniciarEntrega(pedido.id)}>
                    Iniciar entrega
                  </Button>
                )}

                {pedido.estado.toLowerCase() === "en camino" && (
                  <Button className="w-full" onClick={() => confirmarEntrega(pedido.id)}>
                    Confirmar entrega
                  </Button>
                )}

                {pedido.estado.toLowerCase() === "entregado" && (
                  <Button variant="outline" className="w-full" disabled>
                    Entregado
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
