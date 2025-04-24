import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Panel de Motorizado | Delivery App",
  description: "Panel de control para motorizados de la aplicación de delivery",
}

export default function MotorizadoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
