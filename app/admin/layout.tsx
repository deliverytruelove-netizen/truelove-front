"use client"

import type React from "react"
import {NavigationProvider } from "./context/navigation-context"

// Deshabilitar SSG para evitar errores con librerías del navegador
export const dynamic = 'force-dynamic'

export default function AdminLayout({
    children,
}: {
    children : React.ReactNode
}) {
    return (
        <NavigationProvider>{children}</NavigationProvider>
    )
}