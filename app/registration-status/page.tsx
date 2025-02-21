import { Suspense } from "react"
import RegistrationStatusForm from "./RegistroForm"

export default function RegistrationStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin">Cargando...</div>
        </div>
      }
    >
      <RegistrationStatusForm />
    </Suspense>
  )
}

