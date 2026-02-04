"use client"

import React from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Tag, ChevronRight, Plus } from 'lucide-react'
import { CategoryDialog } from "./category-dialog"
import type { Category, HorarioDia } from "../services/menu.service"
import Link from "next/link"

interface CategoryFormData {
  nombre: string
  horarios?: HorarioDia[] | null
}

interface CategoriesListProps {
  categories: Category[]
  productCounts: Record<number, number>
  onEditCategory: (id: number, data: CategoryFormData) => Promise<void>
  onDeleteCategory: (id: number) => Promise<void>
  onCreateCategory: (data: CategoryFormData) => Promise<void>
  isLoading: boolean
}

export const CategoriesList = React.memo<CategoriesListProps>(function CategoriesList({
  categories,
  productCounts,
  onEditCategory,
  onDeleteCategory,
  onCreateCategory,
  isLoading,
}) {
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
        <p className="text-gray-600">Cargando categorías...</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-800">
        <Plus className="h-12 w-12 text-gray-400 dark:text-gray-200 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">No hay categorías creadas</p>
        <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">Crea tu primera categoría para comenzar</p>
        <CategoryDialog
          onSubmit={onCreateCategory}
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
      {categories.map((category) => (
        <Card key={category.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border-b border-gray-100 py-3 px-3 sm:px-4 gap-2 dark:bg-gray-800 dark:border-gray-800">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Tag className="h-5 w-5 text-red-600 flex-shrink-0" />
              <CardTitle className="text-base sm:text-lg font-medium text-gray-800 truncate">
                {category.nombre}
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500">
                  ({productCounts[category.id] || 0})
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CategoryDialog
                category={category}
                onSubmit={(data) => onEditCategory(category.id, data)}
                onDelete={() => onDeleteCategory(category.id)}
                trigger={
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200 h-8 w-8">
                    <Edit className="h-4 w-4 text-gray-600 dark:text-gray-200" />
                    <span className="sr-only">Editar categoría</span>
                  </Button>
                }
              />
              <Link href={`/socio/admin/menu/categoria/${category.id}`} passHref>
                <Button variant="outline" size="sm" className="gap-1 dark:bg-brand-900 text-xs sm:text-sm whitespace-nowrap">
                  <span className="hidden sm:inline">Ver productos</span>
                  <span className="sm:hidden">Ver</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
})