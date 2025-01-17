'use client'

import { useState } from 'react'
import { Menu, Home, Utensils, ShoppingBag, PieChart, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import AvatarSettings from './components/AvatarSettings'
import Link from 'next/link'
import { cn } from "@/lib/utils"

const menuItems = [
  { name: 'Inicio', href: '/socio/admin', icon: Home },
  { name: 'Menú', href: '/socio/admin/menu', icon: Utensils },
  { name: 'Pedidos', href: '/socio/admin/pedidos', icon: ShoppingBag },
  { name: 'Finanzas', href: '/socio/admin/finanzas', icon: PieChart },
  { name: 'Configuración', href: '/socio/admin/configuracion', icon: Settings }
]

export default function SocioAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-white border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[72px]" : "w-[280px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!isCollapsed && (
            <h2 className="text-xl font-semibold text-gray-800">Panel de Socio</h2>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "p-0 h-8 w-8",
              isCollapsed && "mx-auto"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                      isCollapsed ? "px-0 justify-center" : "px-3"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:ml-[72px]" : "md:ml-[280px]"
      )}>
        {/* Header */}
        <header className="h-16 bg-white border-b sticky top-0 z-30">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="md:hidden"
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
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

