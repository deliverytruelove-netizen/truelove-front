// app\admin\metodo-pago\page.tsx

"use client"

import type React from "react"
import MainLayout from "../components/MainLayout"
import GestionMetodosPago from "./components/gestion-metodos-pago"

const MetodoPagos: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <GestionMetodosPago />
      </div>
    </MainLayout>
  )
}

export default MetodoPagos
