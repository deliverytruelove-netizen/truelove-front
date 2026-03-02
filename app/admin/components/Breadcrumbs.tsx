// app\admin\components\Breadcrumbs.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import type React from "react"



// Mapeo de rutas personalizadas para títulos específicos
const customTitles: Record<string, string> = {
  "/admin/horarios": "Horarios",
  "/admin/horarios/create": "Crear Horario",
  "/admin/cuotas-socios": "Cuotas de Socios",
  "/admin/cuotas-motorizados": "Cuotas de Motorizados",
  "/admin/kilometros-tarifa": "Kilómetros Tarifa",
  "/admin/tarifas-rangos": "Tarifas por Rangos",
}

// Función para obtener el título del módulo basado en la última parte de la ruta
const getModuleTitle = (path: string): string => {
  // Verificar si hay un título personalizado para esta ruta exacta
  if (customTitles[path]) {
    return customTitles[path]
  }

  // Verificar patrones dinámicos (como /admin/horarios/[id]/edit)
  if (path.match(/\/admin\/horarios\/\d+\/edit$/)) {
    return "Editar Horario"
  }
  if (path.match(/\/admin\/horarios\/\d+$/)) {
    return "Ver Horario"
  }

  const segments = path.split("/").filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  // Capitalizar primera letra y convertir guiones a espacios
  return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ") : "Dashboard"
}

// Mapeo de nombres amigables para los breadcrumbs
const breadcrumbNames: Record<string, string> = {
  admin: "Admin",
  horarios: "Horarios",
  create: "Crear",
  edit: "Editar",
  "cuotas-socios": "Cuotas de Socios",
  "cuotas-motorizados": "Cuotas de Motorizados",
  "kilometros-tarifa": "Kilómetros Tarifa",
  "tarifas-rangos": "Tarifas por Rangos",
  socios: "Socios",
  motorizados: "Motorizados",
  usuarios: "Usuarios",
  locales: "Locales",
}

// Función para obtener el nombre amigable de un segmento
const getBreadcrumbName = (segment: string): string => {
  // Si es un número (ID), mostrar "Detalle"
  if (/^\d+$/.test(segment)) {
    return "Detalle"
  }
  
  // Si hay un nombre personalizado, usarlo
  if (breadcrumbNames[segment]) {
    return breadcrumbNames[segment]
  }
  
  // Capitalizar y reemplazar guiones
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
}

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname()
  const paths = pathname.split("/").filter(Boolean)
  const moduleTitle = getModuleTitle(pathname)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 py-2 sm:py-3 border-b border-gray-100 gap-1">
      {/* Título del módulo */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{moduleTitle}</h1>

      {/* Ruta de navegación - oculta en móvil muy pequeño */}
      <nav className="hidden sm:flex items-center text-sm text-gray-500">
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1
          const href = `/${paths.slice(0, index + 1).join("/")}`
          const displayName = getBreadcrumbName(path)

          return (
            <span key={`${path}-${index}`} className="flex items-center">
              {index > 0 && <ChevronRight className="h-3 w-3 mx-2 text-gray-300" />}
              {isLast ? (
                <span className="font-medium text-gray-700">{displayName}</span>
              ) : (
                <Link href={href} className="text-gray-500 hover:text-red-500 transition-colors">
                  {displayName}
                </Link>
              )}
            </span>
          )
        })}
      </nav>
    </div>
  )
}

