// app\admin\components\Breadcrumbs.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ChevronRight } from "lucide-react"
import type React from "react" // Import React

// Función auxiliar para construir las rutas absolutas
const getAbsolutePath = (currentPath: string, path: string): string => {
  const currentAbsolutePath = currentPath.split("/").slice(0, -1).join("/")
  return `${currentAbsolutePath}/${path}`
}

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname()
  const paths = pathname.split("/").filter(Boolean)

  return (
    <nav className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm">
      {/* Icono de inicio */}
      <Link
        href="/admin/dashboard"
        className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {/* Generación dinámica de breadcrumbs */}
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1
        const href = getAbsolutePath(pathname, path)

        return (
          <span key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{path}</span>
            ) : (
              <Link
                href={href}
                className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors capitalize"
              >
                {path}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

