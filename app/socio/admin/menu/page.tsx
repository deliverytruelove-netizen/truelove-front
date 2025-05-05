// app\socio\admin\menu\page.tsx
"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { Search, LayoutGrid, ListPlus, Loader2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CreateMenuModal } from "../components/create-menu-modal"
import { menuService, type Category, type MenuItem } from "../services/menu.service"
import { useToast } from "@/hooks/use-toast"
import { CategoryDialog } from "../components/category-dialog"
import { CategoriesList } from "../components/categories-list"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

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
  const [activeView, setActiveView] = useState<"menu" | "options">("menu")
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  // Modificar la función loadData para mostrar más información de depuración
  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Cargar categorías
      const categoriesResponse = await menuService.getCategories()

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || [])
        console.log("Categorías cargadas:", categoriesResponse.data)
      } else {
        throw new Error(categoriesResponse.message || "Error al cargar categorías")
      }

      // Cargar menús
      const menusResponse = await menuService.getMenus()
      console.log("Respuesta completa de menús:", menusResponse)

      // Los menús ya vienen procesados del servicio
      setMenuItems(menusResponse)
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
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Efecto para redirigir a la página de adicionales cuando se selecciona esa vista
  useEffect(() => {
    if (activeView === "options") {
      router.push("/socio/admin/menu/adicionales")
    }
  }, [activeView, router])

  const handleCreateMenu = async (formData: FormData) => {
    try {
      const response = await menuService.createMenu(formData)

      // Si tenemos datos en la respuesta, añadimos el nuevo producto al estado
      if (response && response.data) {
        const newMenuItem = response.data as MenuItem
        setMenuItems((prevItems) => [...prevItems, newMenuItem])

        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
          variant: "default",
        })
      } else {
        // Si no hay datos claros en la respuesta, recargamos todo
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

  // Reemplazar la función handleCreateCategory completa con esta versión corregida
  const handleCreateCategory = async (nombre: string) => {
    try {
      const response = await menuService.createCategory({ nombre })

      // Si tenemos datos en la respuesta, añadimos la nueva categoría al estado
      if (response && response.data) {
        // Asegurarnos de que response.data no sea undefined antes de actualizar el estado
        const newCategory = response.data
        setCategories((prevCategories) => [...prevCategories, newCategory])

        toast({
          title: "Éxito",
          description: "Categoría creada correctamente",
          variant: "default",
        })
      } else {
        // Si no hay datos claros, recargamos todo
        await loadData()

        toast({
          title: "Éxito",
          description: "Categoría creada correctamente",
          variant: "default",
        })
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la categoría",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = async (id: number, nombre: string) => {
    try {
      await menuService.updateCategory(id.toString(), { nombre })

      // Actualizar solo la categoría modificada en el estado
      setCategories((prevCategories) =>
        prevCategories.map((category) => (category.id === id ? { ...category, nombre } : category)),
      )

      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la categoría",
        variant: "destructive",
      })

      // En caso de error, recargamos para asegurar consistencia
      await loadData()
    }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      await menuService.deleteCategory(id.toString())

      // Eliminar la categoría del estado
      setCategories((prevCategories) => prevCategories.filter((category) => category.id !== id))

      // También eliminar los productos asociados a esta categoría
      setMenuItems((prevItems) => prevItems.filter((item) => Number(item.categoria_id) !== id))

      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la categoría",
        variant: "destructive",
      })

      // En caso de error, recargamos para asegurar consistencia
      await loadData()
    }
  }

  // Calcular el número de productos por categoría
  const productCounts: Record<number, number> = {}
  categories.forEach((category) => {
    productCounts[category.id] = menuItems.filter((item) => {
      const categoryId = Number(category.id)
      const itemCategoryId = Number(item.categoria_id)
      return !isNaN(categoryId) && !isNaN(itemCategoryId) && categoryId === itemCategoryId
    }).length
  })
  

  // Filtrar categorías según el término de búsqueda
  const filteredCategories = categories.filter((category) => {
    // Si no hay término de búsqueda, mostrar todas las categorías
    if (!searchTerm.trim()) return true

    // Buscar en el nombre de la categoría
    if (category.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return true

    // Buscar en los productos de la categoría
    const categoryMenuItems = menuItems.filter((item) => {
      // Convertir ambos a número para comparación segura
      return Number(item.categoria_id) === Number(category.id)
    })

    return categoryMenuItems.some(
      (item) =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menú</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Datos actuales:")
                console.log("Categorías:", categories)
                console.log("Menús:", menuItems)
                loadData()
              }}
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Recargar datos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-sm sticky top-6">
              <CardHeader className="py-3 px-4 border-b border-gray-100">
                <CardTitle className="text-lg font-medium">Navegación</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="flex flex-col gap-1">
                  <Button
                    variant={activeView === "menu" ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      activeView === "menu" && "bg-red-600 hover:bg-red-700 text-white",
                    )}
                    onClick={() => setActiveView("menu")}
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Secciones y productos
                  </Button>
                  <Button
                    variant={activeView === "options" ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      activeView === "options" && "bg-red-600 hover:bg-red-700 text-white",
                    )}
                    onClick={() => setActiveView("options")}
                  >
                    <ListPlus className="mr-2 h-4 w-4" />
                    Opciones y adicionales
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 py-4 bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  {activeView === "menu" ? "Secciones y productos" : "Opciones y adicionales"}
                </CardTitle>
                <div className="flex gap-2">
                  {activeView === "menu" && (
                    <>
                      <CategoryDialog
                        onSubmit={handleCreateCategory}
                        trigger={
                          <Button variant="outline" className="gap-2 border-gray-300">
                            <Plus className="h-4 w-4" />
                            Nueva categoría
                          </Button>
                        }
                      />
                      <CreateMenuModal categories={categories} onSubmit={handleCreateMenu} />
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {activeView === "menu" && (
                  <div className="space-y-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
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
                      isLoading={loading}
                    />
                  </div>
                )}
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
