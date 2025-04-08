import { Loader2 } from "lucide-react"

export function EstadoVerificacion() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-red-500" />
        <p className="mt-4 text-gray-600">Verificando registro...</p>
      </div>
    </div>
  )
}

