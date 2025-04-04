"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Tag, ChevronRight, Plus } from "lucide-react"
import { CategoriaAdicionalDialog } from "./categoria-adicional-dialog"
import type { CategoriaAdicional } from "../services/adicional.service"
import Link from "next/link"

interface CategoriasAdicionalesListProps {
  categorias: CategoriaAdicional[]
  adicionalesCounts: Record<number, number>
  onEditCategoria: (id: number, nombre: string) => Promise<void>
  onDeleteCategoria: (id: number) => Promise<void>
  onCreateCategoria: (nombre: string) => Promise<void>
  isLoading: boolean
}

export function CategoriasAdicionalesList({
  categorias,
  adicionalesCounts,
  onEditCategoria,
  onDeleteCategoria,
  onCreateCategoria,
  isLoading,
}: CategoriasAdicionalesListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <p className="text-gray-600">Cargando categorías de adicionales...</p>
      </div>
    )
  }

  if (categorias.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Plus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No hay categorías de adicionales creadas</p>
        <p className="text-sm text-gray-500 mt-1">Crea tu primera categoría para comenzar</p>
        <CategoriaAdicionalDialog
          onSubmit={onCreateCategoria}
          trigger={
            <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Crear categoría
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categorias.map((categoria) => (
        <Card key={categoria.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b border-gray-100 py-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg font-medium text-gray-800">
                {categoria.nombre}
                <span className="ml-2 text-sm text-gray-500">
                  ({adicionalesCounts[categoria.id] || 0}{" "}
                  {(adicionalesCounts[categoria.id] || 0) === 1 ? "adicional" : "adicionales"})
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <CategoriaAdicionalDialog
                categoria={categoria}
                onSubmit={(nombre) => onEditCategoria(categoria.id, nombre)}
                onDelete={() => onDeleteCategoria(categoria.id)}
                trigger={
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200">
                    <Edit className="h-4 w-4 text-gray-600" />
                    <span className="sr-only">Editar categoría</span>
                  </Button>
                }
              />
              <Link href={`/socio/admin/menu/adicionales/${categoria.id}`} passHref>
                <Button variant="outline" size="sm" className="gap-1">
                  Ver adicionales
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

