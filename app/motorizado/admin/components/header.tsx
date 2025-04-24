"use client"

import type React from "react"

import { useState } from "react"
import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AvatarSettings from "./avatar-settings"
import { useMotorizado } from "../context/MotorizadoContext"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { actualizarPedidos } = useMotorizado()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar búsqueda de pedidos
    console.log("Buscando:", searchQuery)
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-gray-500 focus:outline-none lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <form onSubmit={handleSearch} className="relative mx-4 lg:mx-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-500" />
          </span>
          <Input
            className="pl-10 pr-4 focus:border-primary"
            type="search"
            placeholder="Buscar pedido"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => actualizarPedidos()}>
          Actualizar
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-500" />
        </Button>
        <AvatarSettings />
      </div>
    </header>
  )
}
