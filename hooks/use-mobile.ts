"use client"

import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Función para actualizar el estado
    const updateSize = () => {
      setIsMobile(window.innerWidth < 1024) // 1024px es el breakpoint lg de Tailwind
    }

    // Establecer el estado inicial
    updateSize()

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener("resize", updateSize)

    // Limpiar listener
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return isMobile
}

