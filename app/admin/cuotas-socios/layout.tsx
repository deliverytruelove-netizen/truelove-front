"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import MainLayout from "../components/MainLayout"

const tabs = [
  { label: "Cuotas Configuradas", href: "/admin/cuotas-socios" },
  { label: "Pagos Recibidos", href: "/admin/cuotas-socios/pagos-recibidos" },
  { label: "Socios con Cuota", href: "/admin/cuotas-socios/socios-asignados" },
]

export default function CuotasSociosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const activeTab = tabs.find((tab) => tab.href === pathname) || tabs[0]

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Mobile: dropdown */}
        <div className="sm:hidden">
          <div className="relative">
            <select
              value={pathname}
              onChange={(e) => router.push(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {tabs.map((tab) => (
                <option key={tab.href} value={tab.href}>
                  {tab.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Desktop: tabs */}
        <div className="hidden sm:block bg-white shadow-sm rounded-lg border border-gray-200">
          <nav className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <button
                  key={tab.href}
                  onClick={() => router.push(tab.href)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenido del tab activo */}
        {children}
      </div>
    </MainLayout>
  )
}
