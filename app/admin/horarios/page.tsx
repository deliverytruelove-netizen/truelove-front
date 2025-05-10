// app/admin/horarios/page.tsx
"use client"

import { useState } from "react"
import MainLayout from "../components/MainLayout"
import { GruposList } from "./components/grupos-list"
import { GrupoForm } from "./components/grupo-form"
import type { Grupo } from "./types/horarios.types"

export default function Horarios() {
  const [showForm, setShowForm] = useState(false)
  const [currentGrupo, setCurrentGrupo] = useState<Grupo | undefined>(undefined)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEdit = (grupo: Grupo) => {
    setCurrentGrupo(grupo)
    setShowForm(true)
  }

  const handleNew = () => {
    setCurrentGrupo(undefined)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setCurrentGrupo(undefined)
  }

  const handleSave = () => {
    setShowForm(false)
    setCurrentGrupo(undefined)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
      
        
        {showForm ? (
          <GrupoForm 
            grupo={currentGrupo} 
            onCancel={handleCancel} 
            onSave={handleSave} 
          />
        ) : (
          <GruposList 
            onEdit={handleEdit} 
            onNew={handleNew} 
            refreshTrigger={refreshTrigger} 
          />
        )}
      </div>
    </MainLayout>
  )
}