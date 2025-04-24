// app\motorizado\admin\page.tsx
"use client"

import { useState } from "react"
import { Package } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MotorizadoProvider, useMotorizado } from "./context/MotorizadoContext"
import Sidebar from "./components/sidebar"
import Header from "./components/header"
import PedidosActivos from "./components/pedidos-activos"
import ResumenEstadisticas from "./components/resumen-estadisticas"

function MotorizadoPanelContent() {
  const { loading } = useMotorizado()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Package className="h-10 w-10 animate-pulse text-primary" />
          <h2 className="text-xl font-semibold">Cargando panel de motorizado...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel de Motorizado</h1>
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
          <div className="py-10 text-center text-muted-foreground">No hay pedidos pendientes en este momento</div>
        </TabsContent>
        <TabsContent value="entregados">
          <div className="py-10 text-center text-muted-foreground">Historial de pedidos entregados</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function MotorizadoPanel() {
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
            <MotorizadoPanelContent />
          </main>
        </div>
      </div>
    </MotorizadoProvider>
  )
}
