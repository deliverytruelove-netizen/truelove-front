// app\email\page.tsx
"use client"

import { Suspense } from "react"
import { PaginaVerificacionEmail } from "./components/pagina-verificacion-email"

export default function VerificacionEmailWrapper() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PaginaVerificacionEmail />
    </Suspense>
  )
}
