// app\socio\admin\components\theme-provider.tsx
"use client"

import * as React from "react"

type Theme = "light" | "dark"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function AdminThemeProvider({ children, defaultTheme = "light", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)

  React.useEffect(() => {
    // Cargar tema guardado específico para admin
    const savedTheme = localStorage.getItem("admin-theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  React.useEffect(() => {
    // Guardar tema en localStorage
    localStorage.setItem("admin-theme", theme)

    // Aplicar clase dark al elemento HTML
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // También aplicamos el atributo data-theme para CSS personalizado
    const adminContainer = document.querySelector("[data-admin-theme]")
    if (adminContainer) {
      adminContainer.setAttribute("data-theme", theme)
    }
  }, [theme])

  const toggleTheme = React.useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }, [])

  const value = {
    theme,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {/* Añadimos data-admin-theme para poder aplicar estilos específicos */}
      <div data-admin-theme data-theme={theme} className="min-h-screen">
        {children}
      </div>
    </ThemeProviderContext.Provider>
  )
}

export const useAdminTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useAdminTheme must be used within a AdminThemeProvider")

  return context
}
