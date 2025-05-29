// app\socio\admin\layout.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Menu, Home, Utensils, ShoppingBag, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import AvatarSettings from "./components/AvatarSettings"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Providers from "./providers"
import { usePathname } from "next/navigation"

const menuItems = [
  { name: "Inicio", href: "/socio/admin", icon: Home },
  { name: "Menú", href: "/socio/admin/menu", icon: Utensils },
  { name: "Pedidos", href: "/socio/admin/pedidos", icon: ShoppingBag },
  // { name: "Finanzas", href: "/socio/admin/finanzas", icon: PieChart },
  { name: "Configuración", href: "/socio/admin/configuracion", icon: Settings },
]

export default function SocioAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  // Cerrar el menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r shadow-sm transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-[280px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PS</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Panel Socio</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn("p-0 h-8 w-8 rounded-full hover:bg-gray-100", isCollapsed && "mx-auto")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-3">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200",
                        isCollapsed ? "px-0 justify-center h-10 w-10 mx-auto" : "px-3",
                        isActive && "bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-800 font-medium",
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-brand-600")} />
                      {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-brand-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-700">Modo Socio</p>
                  <p className="text-xs text-gray-500">v1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={cn("flex-1 transition-all duration-300 ease-in-out", isCollapsed ? "md:ml-[72px]" : "md:ml-[280px]")}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden rounded-full w-9 h-9 p-0"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-800">Panel de Administración</h1>
            </div>
            <AvatarSettings />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <Providers>{children}</Providers>
        </main>
      </div>
    </div>
  )
}
