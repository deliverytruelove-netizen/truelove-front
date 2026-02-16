"use client"

import React from "react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchTarifasRangos,
  createTarifaRango,
  updateTarifaRango,
} from "@/app/admin/kilometros-tarifa/services/KilometrosTarifa.service"
import type { TarifaConfiguracion } from "@/app/admin/kilometros-tarifa/types/KilometrosTarifa.types"
import { showAlert } from "@/components/ui/DataTable/Alert"
import TarifasRangosForm from "./TarifasRangosForm"
import { Loader2 } from "lucide-react"

const TarifasRangosList: React.FC = () => {
  const queryClient = useQueryClient()

  const {
    data: tarifasRangos = [],
    isLoading: isLoadingRangos,
  } = useQuery<TarifaConfiguracion[], Error>({
    queryKey: ["tarifas-rangos"],
    queryFn: fetchTarifasRangos,
  })

  // Obtener la configuración activa (debería ser solo una)
  const configuracionActiva = tarifasRangos.find(t => t.activo) || tarifasRangos[0] || null

  const createMutation = useMutation({
    mutationFn: createTarifaRango,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifas-rangos"] })
      showAlert({
        title: "Éxito",
        text: "Configuración guardada exitosamente.",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateTarifaRango,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifas-rangos"] })
      showAlert({
        title: "Éxito",
        text: "Configuración actualizada exitosamente.",
        icon: "success",
      })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const handleSubmit = (data: Partial<TarifaConfiguracion>) => {
    if (configuracionActiva) {
      updateMutation.mutate({ id: configuracionActiva.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  if (isLoadingRangos) {
    return (
      <Section title="">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <span className="ml-3 text-gray-600">Cargando configuración...</span>
        </div>
      </Section>
    )
  }

  return (
    <Section title="" >
      <TarifasRangosForm
        configuracion={configuracionActiva}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </Section>
  )
}

export default TarifasRangosList
