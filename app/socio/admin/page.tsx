'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SalesChart } from './components/Grafico'
import AvatarSettings from './components/AvatarSettings'
import Link from 'next/link'

export default function SocioDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white w-64 min-h-screen p-4 ${sidebarOpen ? '' : 'hidden'} md:block`}>
        <nav>
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <ul>
            {[
              { name: 'Dashboard', href: '/socio/admin' },
              { name: 'Menú', href: '/socio/admin/menu' },
              { name: 'Pedidos', href: '/socio/admin/pedidos' },
              { name: 'Finanzas', href: '/socio/admin/finanzas' },
              { name: 'Configuración', href: '/socio/admin/configuracion' }
            ].map((item) => (
              <li key={item.name} className="mb-2">
                <Link href={item.href}>
                  <Button variant="ghost" className="w-full justify-start">{item.name}</Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <Button variant="ghost" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard de Socio</h1>
            <AvatarSettings />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Ventas Totales', value: 'S/ 4,000', description: 'Último mes' },
                { title: 'Pedidos', value: '120', description: 'Último mes' },
                { title: 'Clientes Nuevos', value: '25', description: 'Último mes' },
                { title: 'Calificación', value: '4.8', description: 'Promedio' },
              ].map((item, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions and Chart */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Link href="/socio/admin/menu">
                    <Button variant="outline" className="w-full">Gestionar Menú</Button>
                  </Link>
                  <Link href="/socio/admin/pedidos">
                    <Button variant="outline" className="w-full">Ver Pedidos Pendientes</Button>
                  </Link>
                  <Link href="/socio/admin/configuracion">
                    <Button variant="outline" className="w-full">Actualizar Horario</Button>
                  </Link>
                  <Button variant="outline" className="w-full">Contactar Soporte</Button>
                </CardContent>
              </Card>

              {/* Sales Chart */}
              <SalesChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

