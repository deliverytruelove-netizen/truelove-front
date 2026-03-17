"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import MainLayout from "../components/MainLayout"
import { fetchSocios } from "@/app/admin/socios/services/Socios.service"
import { fetchEstadoPagosSocio, fetchPagos } from "./services/cuota-socio.service"
import type { Socio } from "@/app/admin/socios/types/Socios.types"

const tabs = [
  { label: "Cuotas Configuradas", href: "/admin/cuotas-socios", key: "config" },
  { label: "Pagos Recibidos", href: "/admin/cuotas-socios/pagos-recibidos", key: "pagos" },
  { label: "Socios con Cuota", href: "/admin/cuotas-socios/socios-asignados", key: "socios" },
]

export default function CuotasSociosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  tabs.find((tab) => tab.href === pathname) || tabs[0]
  const [alertCount, setAlertCount] = useState<number>(0)
  const [pagosPendientesCount, setPagosPendientesCount] = useState<number>(0)

  // Cargar conteo de socios con pagos vencidos o por vencer
  useEffect(() => {
    const loadAlertCount = async () => {
      try {
        const socios = await fetchSocios()
        const sociosConCuota = socios.filter((s: Socio) => s.cuota_socio_id != null)

        let count = 0
        const results = await Promise.all(
          sociosConCuota.map(async (s: Socio) => {
            try {
              const estado = await fetchEstadoPagosSocio(s.id)
              return estado
            } catch {
              return null
            }
          })
        )

        results.forEach((estado) => {
          if (!estado) return
          // Solo contar vencidos o los que vencen hoy/mañana (1 día o menos)
          if (estado.periodos_vencidos > 0) {
            count++
          } else if (estado.periodos_pendientes > 0 && estado.dias_vencimiento !== null && estado.dias_vencimiento <= 1) {
            count++
          }
        })

        setAlertCount(count)
      } catch {
        // silenciar errores
      }
    }

    loadAlertCount()

    // Cargar pagos pendientes de revisión
    const loadPagosPendientes = async () => {
      try {
        const pagos = await fetchPagos("pendiente")
        setPagosPendientesCount(pagos.length)
      } catch {
        // silenciar errores
      }
    }
    loadPagosPendientes()
  }, [])

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
                  {tab.label}{tab.key === "socios" && alertCount > 0 ? ` (${alertCount})` : ""}{tab.key === "pagos" && pagosPendientesCount > 0 ? ` (${pagosPendientesCount})` : ""}
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
                  className={`relative px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.key === "socios" && alertCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px]">
                      {alertCount}
                    </span>
                  )}
                  {tab.key === "pagos" && pagosPendientesCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-yellow-500 rounded-full min-w-[18px]">
                      {pagosPendientesCount}
                    </span>
                  )}
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
