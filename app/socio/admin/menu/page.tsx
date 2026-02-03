// app\socio\admin\menu\page.tsx
"use client"

import { useState, Suspense, useMemo } from "react"
import { Search, LayoutGrid, ListPlus, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { CreateMenuModal } from "../components/create-menu-modal"
import { CategoryDialog } from "../components/category-dialog"
import { CategoriesList } from "../components/categories-list"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

// React Query hooks
import {
  useCategories,
  useMenus,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateMenu,
} from "../hooks/use-menu-queries"
import { useProductCounts } from "../hooks/use-product-counts"

// Componente de carga para Suspense
function LoadingCategories() {
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

// Componente principal que maneja la lógica de datos
function MenuContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  // React Query hooks para menú
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: menuItems = [], isLoading: menusLoading } = useMenus()

  // Mutations para menú
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()
  const createMenuMutation = useCreateMenu()

  // Hook personalizado para contadores
  const productCounts = useProductCounts(categories, menuItems)

  // Estado de carga general
  const isLoading = categoriesLoading || menusLoading

  // Handlers optimizados - ahora son async y devuelven Promise<void>
  const handleCreateMenu = async (formData: FormData): Promise<void> => {
    return new Promise((resolve, reject) => {
      createMenuMutation.mutate(formData, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      })
    })
  }

  const handleCreateCategory = async (data: { nombre: string; hora_inicio?: string | null; hora_fin?: string | null }): Promise<void> => {
    return new Promise((resolve, reject) => {
      createCategoryMutation.mutate(data, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      })
    })
  }

  const handleEditCategory = async (id: number, data: { nombre: string; hora_inicio?: string | null; hora_fin?: string | null }): Promise<void> => {
    return new Promise((resolve, reject) => {
      updateCategoryMutation.mutate({ id, ...data }, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      })
    })
  }

  const handleDeleteCategory = async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      deleteCategoryMutation.mutate(id, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      })
    })
  }

  // Filtrar categorías según el término de búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories

    return categories.filter((category) => {
      // Buscar en el nombre de la categoría
      if (category.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return true

      // Buscar en los productos de la categoría
      const categoryMenuItems = menuItems.filter((item) => {
        return Number(item.categoria_id) === Number(category.id)
      })

      return categoryMenuItems.some(
        (item) =>
          item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    })
  }, [categories, menuItems, searchTerm])

  return (
    <div className="bg-gray-50 dark:bg-gray-800 dark:text-gray-200">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Menú</h1>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {isLoading ? "Cargando..." : `${categories.length} categorías, ${menuItems.length} productos`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 ">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-sm sticky top-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-600">
                <CardTitle className="text-lg font-medium">Navegación</CardTitle>
              </CardHeader>
              <CardContent className="p-2 ">
                <nav className="flex flex-col gap-1 ">
                  <Button
                    variant="default"
                    className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Secciones y productos
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push("/socio/admin/menu/adicionales")}
                  >
                    <ListPlus className="mr-2 h-4 w-4" />
                    Todos los Adicionales
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border border-gray-200 dark:border-gray-900 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 py-4 bg-gray-50 border-b border-gray-100 dark:bg-gray-700 dark:border-gray-800 sticky top-[4rem] z-20">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Secciones y productos
                </CardTitle>
                <div className="flex gap-2">
                  <CategoryDialog
                    onSubmit={handleCreateCategory}
                    trigger={
                      <Button
                        variant="outline"
                        className="gap-2 border-gray-300 dark:bg-gray-700"
                        disabled={createCategoryMutation.isPending}
                      >
                        <Plus className="h-4 w-4" />
                        Nueva categoría
                      </Button>
                    }
                  />
                  <CreateMenuModal categories={categories} onSubmit={handleCreateMenu} />
                </div>
              </CardHeader>
              <CardContent className="p-5 dark:bg-gray-700">
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-900"
                      placeholder="Buscar por nombre de categoría o producto..."
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Separator className="my-6" />

                  <CategoriesList
                    categories={filteredCategories}
                    productCounts={productCounts}
                    onEditCategory={handleEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onCreateCategory={handleCreateCategory}
                    isLoading={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Página principal que usa Suspense
export default function Page() {
  return (
    <Suspense fallback={<LoadingCategories />}>
      <MenuContent />
    </Suspense>
  )
}
