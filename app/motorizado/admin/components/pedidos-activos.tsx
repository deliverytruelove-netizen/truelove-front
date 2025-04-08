"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, CheckCircle, Clock } from "lucide-react"

type Pedido = {
  id: string
  direccion: string
  estado: "Pendiente" | "En camino" | "Entregado"
  eta: string
  cliente: string
  total: string
  items: number
}

const pedidosEjemplo: Pedido[] = [
  {
    id: "PED001",
    direccion: "Calle Principal 123",
    estado: "En camino",
    eta: "15 min",
    cliente: "Juan Pérez",
    total: "S/ 45.90",
    items: 3,
  },
  {
    id: "PED002",
    direccion: "Avenida Central 456",
    estado: "Pendiente",
    eta: "30 min",
    cliente: "María López",
    total: "S/ 32.50",
    items: 2,
  },
  {
    id: "PED003",
    direccion: "Plaza Mayor 789",
    estado: "Entregado",
    eta: "0 min",
    cliente: "Carlos Rodríguez",
    total: "S/ 78.20",
    items: 5,
  },
]

export default function PedidosActivos() {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosEjemplo)

  const actualizarEstado = (id: string, nuevoEstado: "Pendiente" | "En camino" | "Entregado") => {
    setPedidos(pedidos.map((pedido) => (pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido)))
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "En camino":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Entregado":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return <Clock className="h-4 w-4" />
      case "En camino":
        return <Navigation className="h-4 w-4" />
      case "Entregado":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pedidos.map((pedido) => (
        <Card key={pedido.id} className="overflow-hidden">
          <CardHeader className="bg-muted/30 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{pedido.id}</CardTitle>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}
              >
                {getEstadoIcon(pedido.estado)}
                <span>{pedido.estado}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Dirección de entrega</p>
                  <p className="text-sm text-muted-foreground">{pedido.direccion}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{pedido.cliente}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Items</p>
                  <p className="font-medium">{pedido.items}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">{pedido.total}</p>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                {pedido.estado === "Pendiente" && (
                  <Button className="w-full" onClick={() => actualizarEstado(pedido.id, "En camino")}>
                    Iniciar entrega
                  </Button>
                )}

                {pedido.estado === "En camino" && (
                  <Button className="w-full" onClick={() => actualizarEstado(pedido.id, "Entregado")}>
                    Confirmar entrega
                  </Button>
                )}

                {pedido.estado === "Entregado" && (
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
