// app\admin\dashboard\page.tsx
"use client"

import type React from "react"
import MainLayout from "../components/MainLayout"

const Dashboard: React.FC = () => {
  return (
    <MainLayout>
      <div className="grid gap-6">
        {/* Contenedor del dashboard con fondo blanco y sombra suave */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Bienvenido al panel de administración</p>
        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard


