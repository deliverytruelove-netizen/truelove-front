// app\admin\components\Breadcrumbs.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import type React from "react"

// Función auxiliar para construir las rutas absolutas
const getAbsolutePath = (currentPath: string, path: string): string => {
  const currentAbsolutePath = currentPath.split("/").slice(0, -1).join("/")
  return `${currentAbsolutePath}/${path}`
}

// Función para obtener el título del módulo basado en la última parte de la ruta
const getModuleTitle = (path: string): string => {
  const segments = path.split("/").filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  // Capitalizar primera letra y convertir guiones a espacios
  return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ") : "Dashboard"
}

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname()
  const paths = pathname.split("/").filter(Boolean)
  const moduleTitle = getModuleTitle(pathname)

  return (
    <div className="flex items-center justify-between mb-6 py-3 border-b border-gray-100">
      {/* Título del módulo a la izquierda */}
      <h1 className="text-2xl font-bold text-gray-800">{moduleTitle}</h1>

      {/* Ruta de navegación a la derecha */}
      <nav className="flex items-center text-sm text-gray-500">
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1
          const href = getAbsolutePath(pathname, path)

          return (
            <span key={path} className="flex items-center">
              {index > 0 && <ChevronRight className="h-3 w-3 mx-2 text-gray-300" />}
              {isLast ? (
                <span className="font-medium text-gray-700 capitalize">{path}</span>
              ) : (
                <Link href={href} className="text-gray-500 hover:text-red-500 transition-colors capitalize">
                  {path}
                </Link>
              )}
            </span>
          )
        })}
      </nav>
    </div>
  )
}

