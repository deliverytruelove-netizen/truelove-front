"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, LayoutGrid, ListPlus, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CreateMenuModal } from "../components/create-menu-modal"
import { menuService, type Category, type MenuItem } from "../services/menu.service"
import { useToast } from "@/hooks/use-toast"
import { CategoryDialog } from "../components/category-dialog"
import { CategorySection } from "../components/category-section"
import { OptionsView } from "../components/options-view"

export default function Page() {
  const [activeView, setActiveView] = useState<"menu" | "options">("menu")
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const empresa_id = "1" // Este ID debería venir de tu sistema de autenticación

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [categoriesData, menusData] = await Promise.all([
        menuService.getCategories(empresa_id),
        menuService.getMenus(empresa_id),
      ])

      // Debug the data structure
      console.log("Categorías cargadas:", categoriesData)
      console.log(
        "IDs de categorías:",
        categoriesData.map((c: Category) => c.id),
      )
      console.log("Menús cargados:", menusData)
      console.log(
        "IDs de categoría en menús:",
        menusData.map((m: MenuItem) => m.categoria_id),
      )

      setCategories(categoriesData)
      setMenuItems(Array.isArray(menusData) ? menusData : [])
    } catch (error: unknown) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "No se pudo cargar la información del menú",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [empresa_id, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateMenu = async (formData: FormData) => {
    try {
      await menuService.createMenu(formData)
      await loadData() // Recargar datos después de crear
      toast({
        title: "Éxito",
        description: "Menú creado correctamente",
      })
    } catch (error: unknown) {
      console.error("Error al crear menú:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "No se pudo crear el menú",
        variant: "destructive",
      })
    }
  }

  const handleCreateCategory = async (nombre: string) => {
    try {
      await menuService.createCategory({ nombre, empresa_id })
      await loadData()
      toast({
        title: "Éxito",
        description: "Categoría creada correctamente",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message || "No se pudo crear la categoría",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = async (id: number, nombre: string) => {
    try {
      await menuService.updateCategory(id.toString(), { nombre, empresa_id })
      await loadData()
      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message || "No se pudo actualizar la categoría",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await menuService.updateMenuStatus(id.toString(), newStatus)
      await loadData()
      toast({
        title: "Éxito",
        description: "Estado actualizado correctamente",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message || "No se pudo actualizar el estado",
        variant: "destructive",
      })
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menú</h1>
          <Select defaultValue={empresa_id}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Seleccionar local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={empresa_id}>Mi Restaurante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="flex lg:flex-col gap-2">
                  <Button
                    variant={activeView === "menu" ? "default" : "ghost"}
                    className={cn(
                      "flex-1 lg:w-full justify-start",
                      activeView === "menu" && "bg-red-600 hover:bg-red-600/90",
                    )}
                    onClick={() => setActiveView("menu")}
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Secciones y productos</span>
                  </Button>
                  <Button
                    variant={activeView === "options" ? "default" : "ghost"}
                    className={cn(
                      "flex-1 lg:w-full justify-start",
                      activeView === "options" && "bg-red-600 hover:bg-red-600/90",
                    )}
                    onClick={() => setActiveView("options")}
                  >
                    <ListPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Opciones y adicionales</span>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                <CardTitle>{activeView === "menu" ? "Secciones y productos" : "Opciones y adicionales"}</CardTitle>
                <div className="flex gap-2">
                  {activeView === "menu" && (
                    <>
                      <CategoryDialog
                        onSubmit={handleCreateCategory}
                        trigger={
                          <Button variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva categoría
                          </Button>
                        }
                      />
                      <CreateMenuModal categories={categories} onSubmit={handleCreateMenu} empresa_id={empresa_id} />
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {activeView === "menu" ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        className="pl-10"
                        placeholder="Búsqueda"
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {loading ? (
                      <div className="text-center py-4">Cargando...</div>
                    ) : categories.length === 0 ? (
                      <div className="text-center py-4">
                        <p>No hay categorías creadas.</p>
                        <CategoryDialog onSubmit={handleCreateCategory} />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categories.map((category) => {
                          const categoryMenuItems = menuItems.filter((item) => {
                            // Debug the comparison
                            console.log(
                              `Comparando menu.categoria_id: ${item.categoria_id} con category.id: ${category.id}`,
                            )
                            return Number(item.categoria_id) === Number(category.id)
                          })

                          console.log(`Menús filtrados para categoría ${category.id}:`, categoryMenuItems)

                          return (
                            <CategorySection
                              key={category.id}
                              category={category}
                              menuItems={categoryMenuItems}
                              onEditCategory={handleEditCategory}
                              onStatusChange={handleStatusChange}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <OptionsView />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

