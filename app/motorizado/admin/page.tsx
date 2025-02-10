"use client"

import { useState } from "react"
import { Bell, ChevronDown, Menu, Search, Package } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function MotorizadoPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center h-20 border-b">
          <Image src="/logo-placeholder.svg" alt="Logo" width={40} height={40} />
          <h1 className="ml-3 text-xl font-semibold text-gray-800">Delivery App</h1>
        </div>
        <nav className="mt-6">
          <a className="flex items-center px-6 py-3 text-gray-700 bg-gray-200" href="#">
            <Package className="w-5 h-5 mr-3" />
            Pedidos
          </a>
          {/* Puedes agregar más opciones de navegación aquí si es necesario */}
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
          <div className="flex items-center">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5 text-gray-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-4">
                  <Avatar>
                    <AvatarImage src="/avatar-placeholder.png" />
                    <AvatarFallback>MO</AvatarFallback>
                  </Avatar>
                  <span className="ml-2">Motorizado</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <h3 className="text-3xl font-medium text-gray-700">Mis Pedidos</h3>
            <div className="mt-8">
              {/* Tabla de pedidos */}
              <div className="flex flex-col mt-8">
                <div className="py-2 -my-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  <div className="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                            ID Pedido
                          </th>
                          <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                            Dirección
                          </th>
                          <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                            Tiempo estimado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {[
                          { id: "PED001", address: "Calle Principal 123", status: "En camino", eta: "15 min" },
                          { id: "PED002", address: "Avenida Central 456", status: "Pendiente", eta: "30 min" },
                          { id: "PED003", address: "Plaza Mayor 789", status: "Entregado", eta: "0 min" },
                        ].map((pedido, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                              <div className="text-sm leading-5 text-gray-900">{pedido.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                              <div className="text-sm leading-5 text-gray-900">{pedido.address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                              <Badge
                                variant={
                                  pedido.status === "En camino"
                                    ? "outline"
                                    : pedido.status === "Entregado"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {pedido.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                              <div className="text-sm leading-5 text-gray-900">{pedido.eta}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

