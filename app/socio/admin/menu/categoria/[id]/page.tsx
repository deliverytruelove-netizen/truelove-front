// app\socio\admin\menu\categoria\[id]\page.tsx
"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { menuService, type Category, type MenuItem } from "../../../services/menu.service"
import { useToast } from "@/hooks/use-toast"
import { CreateMenuModal } from "../../../components/create-menu-modal"
import { ProductsList } from "../../../components/products-list"

// Componente de carga para Suspense
function LoadingProducts() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    </div>
  )
}

// Componente principal que maneja la lógica de datos
function CategoryContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [category, setCategory] = useState<Category | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const categoryId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Cargar categorías
      const categoriesResponse = await menuService.getCategories()

      if (categoriesResponse.success && categoriesResponse.data) {
        setAllCategories(categoriesResponse.data)

        // Encontrar la categoría actual
        const currentCategory = categoriesResponse.data.find((cat) => cat.id.toString() === categoryId)

        if (currentCategory) {
          setCategory(currentCategory)
        } else {
          toast({
            title: "Error",
            description: "Categoría no encontrada",
            variant: "destructive",
          })
          router.push("/socio/admin/menu")
          return
        }
      } else {
        throw new Error(categoriesResponse.message || "Error al cargar categorías")
      }

      // Cargar menús
      const menusResponse = await menuService.getMenus()

      // Filtrar solo los productos de esta categoría
      const categoryProducts = menusResponse.filter((item) => Number(item.categoria_id) === Number(categoryId))

      setMenuItems(categoryProducts)
    } catch (error: unknown) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [categoryId, router, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateMenu = async (formData: FormData) => {
    try {
      // Asegurarse de que el producto se cree con la categoría actual
      formData.set("categoria_id", categoryId)

      await menuService.createMenu(formData)
      await loadData()
      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      console.error("Error al crear producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el producto",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await menuService.updateMenuStatus(id.toString(), newStatus)
      await loadData()

      const statusMessages: Record<string, string> = {
        active: "Producto activado correctamente",
        inactive: "Producto desactivado correctamente",
        "out-of-stock": "Producto marcado como agotado",
      }

      toast({
        title: "Éxito",
        description: statusMessages[newStatus] || "Estado actualizado correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el estado",
        variant: "destructive",
      })
    }
  }

  const handleEditMenu = async (id: number, formData: FormData) => {
    try {
      await menuService.updateMenu(id.toString(), formData)
      await loadData()
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el producto",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMenu = async (id: number) => {
    try {
      await menuService.deleteMenu(id.toString())
      await loadData()
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <LoadingProducts />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/socio/admin/menu")}
              className="border-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{category?.nombre || "Categoría"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData} className="border-gray-300">
              <Loader2 className="mr-2 h-4 w-4" />
              Recargar datos
            </Button>
            <CreateMenuModal categories={allCategories} onSubmit={handleCreateMenu} defaultCategoryId={categoryId} />
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 py-4 bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">Productos en esta categoría</CardTitle>
            {/* <CreateMenuModal
              categories={allCategories}
              onSubmit={handleCreateMenu}
              defaultCategoryId={categoryId}
              trigger={
                <Button className="bg-red-600 hover:bg-red-700 text-white transition-colors gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo producto
                </Button>
              }
            /> */}
          </CardHeader>
          <CardContent className="p-5">
            <ProductsList
              menuItems={menuItems}
              categories={allCategories}
              onStatusChange={handleStatusChange}
              onEditMenu={handleEditMenu}
              onDeleteMenu={handleDeleteMenu}
              loading={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Página principal que usa Suspense
export default function Page() {
  return (
    <Suspense fallback={<LoadingProducts />}>
      <CategoryContent />
    </Suspense>
  )
}

