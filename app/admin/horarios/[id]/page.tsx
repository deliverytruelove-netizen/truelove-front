// app/admin/horarios/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import MainLayout from "../../components/MainLayout"
import { CalendarioVista } from "../components/CalendarioVista"
import { fetchGrupoHorario } from "../services/horarios.service"
import type { HorarioGrupo } from "../types/horarios.types"
import { showAlert } from "@/components/ui/DataTable/Alert"

export default function ViewHorarioPage() {
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

  const handleBack = () => {
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
        <CalendarioVista 
          grupo={grupo}
          onBack={handleBack}
        />
      </div>
    </MainLayout>
  )
}
