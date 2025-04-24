"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Clock, CheckCircle, Package } from "lucide-react"
import { MotorizadoProvider } from "../context/MotorizadoContext"
import Sidebar from "../components/sidebar"
import Header from "../components/header"
import { getAuthToken, getUserId } from "../services/auth"

interface EstadisticasData {
  pedidosCompletados: number
  pedidosCancelados: number
  tiempoPromedioEntrega: number
  calificacionPromedio: number
  ingresosTotales: number
  pedidosPorDia: { fecha: string; cantidad: number }[]
  calificacionesPorDia: { fecha: string; calificacion: number }[]
  tiemposPorDia: { fecha: string; tiempo: number }[]
}

function EstadisticasContent() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState("semana")

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = getAuthToken()
        const userId = getUserId()

        if (!token || !userId) {
          throw new Error("No se encontró el token de autenticación o ID de usuario")
        }

        const API_URL = process.env.NEXT_PUBLIC_API_WEB || ""
        const response = await fetch(`${API_URL}/biker/estadisticas/${userId}?periodo=${periodo}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("No se pudieron obtener las estadísticas")
        }

        const data = await response.json()
        setEstadisticas(data)
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
        setError("No se pudieron cargar las estadísticas")
        setEstadisticas(null)
      } finally {
        setLoading(false)
      }
    }

    cargarEstadisticas()
  }, [periodo])

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
    }).format(fecha)
  }

  const renderGraficoBarras = (datos: { fecha: string; cantidad: number }[]) => {
    const maxValor = Math.max(...datos.map((item) => item.cantidad))

    return (
      <div className="mt-4 flex h-64 items-end gap-1">
        {datos.map((item, index) => {
          const altura = (item.cantidad / maxValor) * 100
          return (
            <div key={index} className="flex flex-1 flex-col items-center">
              <div className="w-full rounded-t bg-primary" style={{ height: `${altura}%`, minHeight: "4px" }}></div>
              <div className="mt-2 w-full truncate text-center text-xs">{formatFecha(item.fecha)}</div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderGraficoLinea = (
    datos: { fecha: string; calificacion: number }[] | { fecha: string; tiempo: number }[],
  ) => {
    const maxValor = Math.max(...datos.map((item) => ("calificacion" in item ? item.calificacion : item.tiempo)))
    const minValor = Math.min(...datos.map((item) => ("calificacion" in item ? item.calificacion : item.tiempo)))
    const rango = maxValor - minValor

    return (
      <div className="mt-4 flex h-64 items-end">
        <svg className="h-full w-full" viewBox={`0 0 ${datos.length * 50} 100`} preserveAspectRatio="none">
          <polyline
            points={datos
              .map((item, index) => {
                const valor = "calificacion" in item ? item.calificacion : item.tiempo
                const y = 100 - ((valor - minValor) / (rango || 1)) * 80 - 10
                return `${index * 50 + 25},${y}`
              })
              .join(" ")}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          {datos.map((item, index) => {
            const valor = "calificacion" in item ? item.calificacion : item.tiempo
            const y = 100 - ((valor - minValor) / (rango || 1)) * 80 - 10
            return (
              <g key={index}>
                <circle cx={index * 50 + 25} cy={y} r="3" fill="hsl(var(--primary))" />
                <text
                  x={index * 50 + 25}
                  y="98"
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  className="text-xs"
                >
                  {formatFecha(item.fecha)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Estadísticas</h1>
        <div className="mt-4 md:mt-0">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Última semana</SelectItem>
              <SelectItem value="mes">Último mes</SelectItem>
              <SelectItem value="trimestre">Último trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="flex flex-col items-center gap-2">
            <BarChart3 className="h-10 w-10 animate-pulse text-primary" />
            <h2 className="text-xl font-semibold">Cargando estadísticas...</h2>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10">
          <BarChart3 className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="mb-4 text-center text-muted-foreground">{error}</p>
        </div>
      ) : !estadisticas ? (
        <div className="flex flex-col items-center justify-center py-10">
          <BarChart3 className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-center text-muted-foreground">No hay estadísticas disponibles</p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Completados</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.pedidosCompletados}</div>
                <p className="text-xs text-muted-foreground">
                  {periodo === "semana"
                    ? "En la última semana"
                    : periodo === "mes"
                      ? "En el último mes"
                      : "En el último trimestre"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.tiempoPromedioEntrega} min</div>
                <p className="text-xs text-muted-foreground">Por entrega</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calificación</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.calificacionPromedio.toFixed(1)}/5</div>
                <p className="text-xs text-muted-foreground">Promedio de clientes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">S/ {estadisticas.ingresosTotales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total estimado</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pedidos" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
              <TabsTrigger value="calificaciones">Calificaciones</TabsTrigger>
              <TabsTrigger value="tiempos">Tiempos de Entrega</TabsTrigger>
            </TabsList>

            <TabsContent value="pedidos">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos por Día</CardTitle>
                </CardHeader>
                <CardContent>{renderGraficoBarras(estadisticas.pedidosPorDia)}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calificaciones">
              <Card>
                <CardHeader>
                  <CardTitle>Calificaciones por Día</CardTitle>
                </CardHeader>
                <CardContent>{renderGraficoLinea(estadisticas.calificacionesPorDia)}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tiempos">
              <Card>
                <CardHeader>
                  <CardTitle>Tiempos de Entrega por Día (min)</CardTitle>
                </CardHeader>
                <CardContent>{renderGraficoLinea(estadisticas.tiemposPorDia)}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export default function EstadisticasPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MotorizadoProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:translate-x-0 lg:static lg:inset-0`}
        >
          <Sidebar />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Main content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 dark:bg-gray-900">
            <EstadisticasContent />
          </main>
        </div>
      </div>
    </MotorizadoProvider>
  )
}
