//app\reparto\status\secure\page.tsx
import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { SecureRepartoContent } from "./SecureRepartoContent"

// Componente de carga para el Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-100">
      <Card className="max-w-md w-full p-8 border-none shadow-xl">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 animate-spin mx-auto text-[#f34739] mb-6" />
          <h1 className="text-2xl font-bold mb-4">Cargando</h1>
          <p className="text-gray-600">Estamos preparando tu información...</p>
        </div>
      </Card>
    </div>
  )
}

// Componente de página principal (Server Component)
export default function SecureRepartoStatusPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SecureRepartoContent />
    </Suspense>
  )
}
