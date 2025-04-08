// app\motorizado\admin\page.tsx
"use client"

import { useState } from "react"
import { Bell, Menu, Search, Package, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import AvatarSettings from "./components/avatar-settings"
import PedidosActivos from "./components/pedidos-activos"
import ResumenEstadisticas from "./components/resumen-estadisticas"

export default function MotorizadoPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center h-16 border-b">
          <Package className="h-6 w-6 text-brand-600" />
          <h1 className="ml-3 text-xl font-semibold text-gray-800">Delivery App</h1>
        </div>
        <nav className="mt-6 px-3 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-left" asChild>
            <a href="#" className="flex items-center">
              <Package className="w-5 h-5 mr-3" />
              Pedidos
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-left" asChild>
            <a href="#" className="flex items-center">
              <MapPin className="w-5 h-5 mr-3" />
              Mapa de entregas
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-left" asChild>
            <a href="#" className="flex items-center">
              <Calendar className="w-5 h-5 mr-3" />
              Historial
            </a>
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 focus:outline-none lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative mx-4 lg:mx-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-5 h-5 text-gray-500" />
              </span>
              <Input
                className="pl-10 pr-4 rounded-md focus:border-indigo-600"
                type="search"
                placeholder="Buscar pedido"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5 text-gray-500" />
            </Button>
            <AvatarSettings />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Panel de Motorizado</h1>
              <div className="mt-4 md:mt-0">
                <Button>
                  <Package className="mr-2 h-4 w-4" />
                  Nuevo pedido
                </Button>
              </div>
            </div>

            <ResumenEstadisticas />

            <Separator className="my-6" />

            <Tabs defaultValue="activos" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="activos">Pedidos Activos</TabsTrigger>
                <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                <TabsTrigger value="entregados">Entregados</TabsTrigger>
              </TabsList>
              <TabsContent value="activos">
                <PedidosActivos />
              </TabsContent>
              <TabsContent value="pendientes">
                <div className="text-center py-10 text-muted-foreground">No hay pedidos pendientes en este momento</div>
              </TabsContent>
              <TabsContent value="entregados">
                <div className="text-center py-10 text-muted-foreground">Historial de pedidos entregados</div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
