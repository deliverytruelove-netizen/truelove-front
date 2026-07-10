"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error en /reparto:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-xl font-bold text-gray-900">
          Algo salió mal
        </h2>
        <p className="text-gray-600">
          Ocurrió un error inesperado. Por favor, intenta nuevamente.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Intentar de nuevo
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/reparto"}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
