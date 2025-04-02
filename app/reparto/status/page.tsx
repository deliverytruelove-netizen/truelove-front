import { Suspense } from "react"
import RepartoStatusForm from "./RepartoStatusForm"

export default function RepartoStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin">Cargando...</div>
        </div>
      }
    >
      <RepartoStatusForm />
    </Suspense>
  )
}

