"use client"

import { usePathname, useRouter } from "next/navigation"
import MainLayout from "../components/MainLayout"

const tabs = [
  { label: "Cuotas Configuradas", href: "/admin/cuotas-socios" },
  { label: "Pagos Recibidos", href: "/admin/cuotas-socios/pagos-recibidos" },
  { label: "Socios con Cuota", href: "/admin/cuotas-socios/socios-asignados" },
]

export default function CuotasSociosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Tabs de navegación */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <nav className="flex border-b border-gray-200 overflow-x-auto">
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
