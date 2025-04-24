// app\motorizado\admin\components\resumen-estadisticas.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMotorizado } from "../context/MotorizadoContext"

export default function ResumenEstadisticas() {
  const { estadisticas, loading } = useMotorizado()

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const porcentajeEntregados =
    estadisticas.totalPedidos > 0 ? Math.round((estadisticas.pedidosEntregados / estadisticas.totalPedidos) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estadisticas.totalPedidos}</div>
          {estadisticas.cambioTotal > 0 && (
            <p className="text-xs text-muted-foreground">+{estadisticas.cambioTotal} desde ayer</p>
          )}
          {estadisticas.cambioTotal === 0 && <p className="text-xs text-muted-foreground">Sin cambios desde ayer</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos Entregados</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estadisticas.pedidosEntregados}</div>
          <p className="text-xs text-muted-foreground">{porcentajeEntregados}% del total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estadisticas.tiempoPromedio} min</div>
          {estadisticas.cambioTiempo !== 0 && (
            <p className="text-xs text-muted-foreground">
              {estadisticas.cambioTiempo > 0 ? "+" : ""}
              {estadisticas.cambioTiempo} min desde ayer
            </p>
          )}
          {estadisticas.cambioTiempo === 0 && <p className="text-xs text-muted-foreground">Sin cambios desde ayer</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calificación</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {estadisticas.calificacion > 0 ? estadisticas.calificacion.toFixed(1) : "N/A"}/5
          </div>
          {estadisticas.cambioCalificacion !== 0 && (
            <p className="text-xs text-muted-foreground">
              {estadisticas.cambioCalificacion > 0 ? "+" : ""}
              {estadisticas.cambioCalificacion.toFixed(1)} desde ayer
            </p>
          )}
          {estadisticas.cambioCalificacion === 0 && estadisticas.calificacion > 0 && (
            <p className="text-xs text-muted-foreground">Sin cambios desde ayer</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
