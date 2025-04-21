"use client"

import type React from "react"
import {NavigationProvider } from "./context/navigation-context"

export default function AdminLayout({
    children,
}: {
    children : React.ReactNode
}) {
    return (
        <NavigationProvider>{children}</NavigationProvider>
    )
}