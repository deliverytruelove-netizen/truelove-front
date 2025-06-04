// app\socio\admin\components\theme-toggle.tsx
"use client"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminTheme } from "./theme-provider"

export function ThemeToggle() {
  // Usamos theme para mostrar el icono correcto según el tema actual
  const { theme, toggleTheme } = useAdminTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
