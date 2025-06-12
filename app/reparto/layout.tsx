// app\reparto\layout.tsx
"use client"

import type React from "react"

import { useEffect } from "react"
import { initTokenSyncListener } from "@/services/repartoTokenService"

export default function RepartoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Inicializar el listener de sincronización de tokens
  useEffect(() => {
    initTokenSyncListener()
  }, [])

  return <div className="min-h-screen bg-gray-50">{children}</div>
}
