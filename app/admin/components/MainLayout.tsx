// app\admin\components\MainLayout.tsx
"use client"

import type React from "react"
import { Breadcrumbs } from "./Breadcrumbs"
import SidebarWrap from "./SidebarWrap"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"

const queryClient = new QueryClient()

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Detectar si el sidebar está colapsado
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Función para verificar si el sidebar está colapsado
    const checkSidebarState = () => {
      const sidebar = document.querySelector("[data-sidebar]")
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains("w-20"))
      }
    }

    // Verificar inicialmente
    checkSidebarState()

    // Escuchar el evento personalizado de cambio de estado del sidebar
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed)
    }

    window.addEventListener("sidebarStateChange", handleSidebarStateChange as EventListener)

    // Configurar un observador de mutación para detectar cambios en las clases del sidebar
    const observer = new MutationObserver(checkSidebarState)
    const sidebar = document.querySelector("[data-sidebar]")

    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] })
    }

    return () => {
      observer.disconnect()
      window.removeEventListener("sidebarStateChange", handleSidebarStateChange as EventListener)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-full bg-gray-50">
        <SidebarWrap />
        <main className={`${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"} min-h-screen transition-all duration-300`}>
          <div className="pt-16 sm:pt-20 lg:pt-24 px-2 sm:px-6 pb-6 max-w-[100vw] overflow-x-hidden">
            <Breadcrumbs />
            <div>{children}</div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default MainLayout
