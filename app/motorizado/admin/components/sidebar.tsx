"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, MapPin, Calendar, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Pedidos",
      icon: Package,
      href: "/motorizado/admin",
      active: pathname === "/motorizado/admin",
    },
    {
      label: "Mapa de entregas",
      icon: MapPin,
      href: "/motorizado/admin/mapa",
      active: pathname === "/motorizado/admin/mapa",
    },
    {
      label: "Historial",
      icon: Calendar,
      href: "/motorizado/admin/historial",
      active: pathname === "/motorizado/admin/historial",
    },
    {
      label: "Estadísticas",
      icon: BarChart3,
      href: "/motorizado/admin/estadisticas",
      active: pathname === "/motorizado/admin/estadisticas",
    },
    {
      label: "Configuración",
      icon: Settings,
      href: "/motorizado/admin/configuracion",
      active: pathname === "/motorizado/admin/configuracion",
    },
  ]

  return (
    <aside className={cn("flex h-full w-64 flex-col bg-white shadow-lg dark:bg-gray-800", className)}>
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="ml-3 text-xl font-semibold text-gray-800 dark:text-gray-100">Delivery App</h1>
      </div>
      <nav className="mt-6 flex-1 space-y-1 px-3">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={route.active ? "secondary" : "ghost"}
            className="w-full justify-start text-left"
            asChild
          >
            <Link href={route.href} className="flex items-center">
              <route.icon className="mr-3 h-5 w-5" />
              {route.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <p className="text-xs text-muted-foreground">© 2023 Delivery App</p>
      </div>
    </aside>
  )
}
