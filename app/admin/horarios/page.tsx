// app/admin/horarios/page.tsx
"use client"

import MainLayout from "../components/MainLayout"
import { GruposList } from "./components/GruposList"

export default function HorariosPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <GruposList />
      </div>
    </MainLayout>
  )
}
