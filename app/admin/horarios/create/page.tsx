// app/admin/horarios/create/page.tsx
"use client"

import { useRouter } from "next/navigation"
import MainLayout from "../../components/MainLayout"
import { GrupoForm } from "../components/GrupoForm"

export default function CreateHorarioPage() {
  const router = useRouter()

  const handleCancel = () => {
    router.push("/admin/horarios")
  }

  const handleSave = () => {
    router.push("/admin/horarios")
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <GrupoForm 
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </div>
    </MainLayout>
  )
}
