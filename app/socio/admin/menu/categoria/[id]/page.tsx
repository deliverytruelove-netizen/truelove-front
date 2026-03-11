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
        console.log("Categorías cargadas:", categoriesResponse.data)

        // Encontrar la categoría actual
        const currentCategory = categoriesResponse.data.find((cat) => cat.id.toString() === categoryId)

        if (currentCategory) {
          setCategory(currentCategory)
          console.log("Categoría actual:", currentCategory)
        } else {
          console.error("Categoría no encontrada con ID:", categoryId)
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

      // Usar el nuevo método para cargar menús por categoría
      const categoryProducts = await menuService.getMenusByCategory(categoryId)
      console.log("Productos de esta categoría:", categoryProducts)

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
  
      // Crear el producto
      const response = await menuService.createMenu(formData)
  
      // Si tenemos datos en la respuesta, solo añadimos el nuevo producto al estado
      if (response && response.data) {
        const newMenuItem = response.data as MenuItem
        setMenuItems((prevItems) => [...prevItems, newMenuItem])
  
        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
          variant: "default",
        })
      } else {
        // Si no hay datos claros en la respuesta, entonces sí recargamos
        await loadData()
        
        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
          variant: "default",
        })
      }
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

      // Actualizar solo el producto modificado en el estado local
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, status: newStatus as "active" | "inactive" | "out-of-stock" } : item,
        ),
      )

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
      const response = await menuService.updateMenu(id.toString(), formData)

      // Si tenemos datos en la respuesta, actualizamos solo ese producto
      if (response && response.data) {
        const updatedMenuItem = response.data as MenuItem

        setMenuItems((prevItems) => prevItems.map((item) => (item.id === id ? updatedMenuItem : item)))
      } else {
        // Si no hay datos en la respuesta, actualizamos con los datos del formulario
        setMenuItems((prevItems) =>
          prevItems.map((item) => {
            if (item.id === id) {
              // Crear un objeto actualizado con los datos del formulario
              return {
                ...item,
                titulo: (formData.get("titulo") as string) || item.titulo,
                descripcion: (formData.get("descripcion") as string) || item.descripcion,
                precio: (formData.get("precio") as string) || item.precio,
                status: (formData.get("status") as "active" | "inactive" | "out-of-stock") || item.status,
                // No actualizamos la foto aquí porque necesitaríamos la URL procesada del servidor
              }
            }
            return item
          }),
        )
      }

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

      // En caso de error, recargamos los datos para asegurar consistencia
      await loadData()
    }
  }

  const handleReorderMenus = async (menus: { id: number; orden: number }[]) => {
    try {
      await menuService.reorderMenus(menus)
      toast({ title: "Éxito", description: "Orden actualizado" })
    } catch {
      toast({ title: "Error", description: "No se pudo reordenar", variant: "destructive" })
    }
  }

  const handleDeleteMenu = async (id: number) => {
    try {
      await menuService.deleteMenu(id.toString())

      // Eliminar el producto del estado local
      setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id))

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

      // En caso de error, recargamos los datos para asegurar consistencia
      await loadData()
    }
  }

  if (loading) {
    return <LoadingProducts />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 overflow-x-hidden">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/socio/admin/menu")}
              className="border-gray-300 dark:border-gray-800 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-200 truncate flex-1 min-w-0">{category?.nombre || "Categoría"}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} className="border-gray-300 dark:border-gray-800 flex-1 sm:flex-none">
              <Loader2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Recargar</span>
            </Button>
            <CreateMenuModal categories={allCategories} onSubmit={handleCreateMenu} defaultCategoryId={categoryId} />
          </div>
        </div>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="py-3 sm:py-4 px-3 sm:px-4 bg-gray-50 border-b dark:bg-gray-800 border-gray-100 dark:border-gray-800">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">Productos en esta categoría</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-5">
            <ProductsList
              menuItems={menuItems}
              categories={allCategories}
              onStatusChange={handleStatusChange}
              onEditMenu={handleEditMenu}
              onDeleteMenu={handleDeleteMenu}
              onReorder={handleReorderMenus}
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
