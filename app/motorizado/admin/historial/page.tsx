"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Search, CheckCircle, Clock, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MotorizadoProvider } from "../context/MotorizadoContext"
import Sidebar from "../components/sidebar"
import Header from "../components/header"
import { getAuthToken, getUserId } from "../services/auth"

interface PedidoHistorial {
  id: number
  direccion_entrega: string
  estado: string
  tiempo_estimado: number
  cliente: string
  celular: string
  total: string
  detalle: string
  local: string
  direccion_local: string
  fecha_entrega: string
  calificacion?: number
}

function HistorialContent() {
  const [historial, setHistorial] = useState<PedidoHistorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = getAuthToken()
        const userId = getUserId()

        if (!token || !userId) {
          throw new Error("No se encontró el token de autenticación o ID de usuario")
        }

        const API_URL = process.env.NEXT_PUBLIC_API_WEB || ""
        const response = await fetch(`${API_URL}/biker/historial/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("No se pudo obtener el historial")
        }

        const data = await response.json()
        setHistorial(data)
      } catch (error) {
        console.error("Error al cargar historial:", error)
        setError("No se pudo cargar el historial de pedidos")
        setHistorial([])
      } finally {
        setLoading(false)
      }
    }

    cargarHistorial()
  }, [])

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha)
  }

  const filtrarHistorial = () => {
    return historial
      .filter((pedido) => {
        // Filtrar por estado
        if (filtro !== "todos" && pedido.estado.toLowerCase() !== filtro) {
          return false
        }

        // Filtrar por búsqueda
        if (
          busqueda &&
          !pedido.cliente.toLowerCase().includes(busqueda.toLowerCase()) &&
          !pedido.direccion_entrega.toLowerCase().includes(busqueda.toLowerCase()) &&
          !pedido.id.toString().includes(busqueda)
        ) {
          return false
        }

        // Filtrar por fecha de inicio
        if (fechaInicio && new Date(pedido.fecha_entrega) < new Date(fechaInicio)) {
          return false
        }

        // Filtrar por fecha de fin
        if (fechaFin && new Date(pedido.fecha_entrega) > new Date(fechaFin)) {
          return false
        }

        return true
      })
      .sort((a, b) => new Date(b.fecha_entrega).getTime() - new Date(a.fecha_entrega).getTime())
  }

  const pedidosFiltrados = filtrarHistorial()

  const renderEstrellas = (calificacion = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < calificacion ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ))
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Historial de Entregas</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label htmlFor="busqueda" className="mb-2 block text-sm font-medium">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busqueda"
                  placeholder="Cliente, dirección o ID"
                  className="pl-8"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="estado" className="mb-2 block text-sm font-medium">
                Estado
              </label>
              <Select value={filtro} onValueChange={setFiltro}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="fecha-inicio" className="mb-2 block text-sm font-medium">
                Fecha Inicio
              </label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="fecha-fin" className="mb-2 block text-sm font-medium">
                Fecha Fin
              </label>
              <Input id="fecha-fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="flex flex-col items-center gap-2">
            <Package className="h-10 w-10 animate-pulse text-primary" />
            <h2 className="text-xl font-semibold">Cargando historial...</h2>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Package className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="mb-4 text-center text-muted-foreground">{error}</p>
          <Button>Intentar nuevamente</Button>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Package className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-center text-muted-foreground">No hay historial de pedidos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <Card key={pedido.id}>
              <CardContent className="p-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Pedido #{pedido.id}</h3>
                      <Badge
                        variant={pedido.estado.toLowerCase() === "entregado" ? "success" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {pedido.estado.toLowerCase() === "entregado" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {pedido.estado}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{pedido.direccion_entrega}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatFecha(pedido.fecha_entrega)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Cliente</p>
                    <p className="text-sm text-muted-foreground">{pedido.cliente}</p>
                    <p className="text-sm text-muted-foreground">{pedido.celular}</p>
                    <p className="mt-1 text-sm font-medium">Total</p>
                    <p className="text-sm font-semibold text-primary">{pedido.total}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Restaurante</p>
                    <p className="text-sm text-muted-foreground">{pedido.local}</p>
                    <p className="text-sm text-muted-foreground">{pedido.direccion_local}</p>
                    <div className="mt-1">
                      <p className="text-sm font-medium">Calificación</p>
                      <div className="text-lg">{renderEstrellas(pedido.calificacion)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HistorialPage() {
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
            <HistorialContent />
          </main>
        </div>
      </div>
    </MotorizadoProvider>
  )
}
