// app/admin/horarios/[id]/edit/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import MainLayout from "../../../components/MainLayout"
import { GrupoForm } from "../../components/GrupoForm"
import { fetchGrupoHorario } from "../../services/horarios.service"
import type { HorarioGrupo } from "../../types/horarios.types"
import { showAlert } from "@/components/ui/DataTable/Alert"

export default function EditHorarioPage() {
  const router = useRouter()
  const params = useParams()
  const [grupo, setGrupo] = useState<HorarioGrupo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGrupo = async () => {
      try {
        const id = Number(params.id)
        const data = await fetchGrupoHorario(id)
        setGrupo(data)
      } catch (error) {
        console.error("Error al cargar el horario:", error)
        showAlert({
          title: "Error",
          text: "No se pudo cargar el horario",
          icon: "error",
        })
        router.push("/admin/horarios")
      } finally {
        setLoading(false)
      }
    }

    loadGrupo()
  }, [params.id, router])

  const handleCancel = () => {
    router.push("/admin/horarios")
  }

  const handleSave = () => {
    router.push("/admin/horarios")
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!grupo) {
    return null
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <GrupoForm 
          grupo={grupo}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </div>
    </MainLayout>
  )
}
