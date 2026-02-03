"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { Search, Loader2, ArrowLeft, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { adicionalService, type Adicional, type Menu } from "../../services/adicional.service"
import { AdicionalesList } from "../../components/adicionales-list"
import { CreateAdicionalModal } from "../../components/create-adicional-modal"
import { useRouter } from "next/navigation"

// Componente de carga para Suspense
function LoadingAdicionales() {
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
      <p className="text-gray-600">Cargando adicionales...</p>
    </div>
  )
}

// Componente principal que maneja la lógica de datos
function AdicionalesContent() {
  const router = useRouter()
  const [adicionales, setAdicionales] = useState<Adicional[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Cargar adicionales (ahora incluyen info del menú)
      const adicionalesResponse = await adicionalService.getAdicionales()
      console.log("Adicionales cargados:", adicionalesResponse)
      setAdicionales(adicionalesResponse)

      // Cargar menús para el selector de crear/editar
      const menusResponse = await adicionalService.getMenus()
      console.log("Menús cargados:", menusResponse)
      setMenus(menusResponse)
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

  const handleCreateAdicional = async (formData: FormData) => {
    try {
      await adicionalService.createAdicional(formData)
      await loadData()
      toast({
        title: "Éxito",
        description: "Adicional creado correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      console.error("Error al crear adicional:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el adicional",
        variant: "destructive",
      })
    }
  }

  const handleEditAdicional = async (id: number, formData: FormData) => {
    try {
      await adicionalService.updateAdicional(id.toString(), formData)
      await loadData()
      toast({
        title: "Éxito",
        description: "Adicional actualizado correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      console.error("Error al actualizar adicional:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el adicional",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAdicional = async (id: number) => {
    try {
      await adicionalService.deleteAdicional(id.toString())
      await loadData()
      toast({
        title: "Éxito",
        description: "Adicional eliminado correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      console.error("Error al eliminar adicional:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el adicional",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const adicional = adicionales.find(a => a.id === id)
      if (!adicional) return

      const formData = new FormData()
      formData.append("titulo", adicional.titulo)
      formData.append("descripcion", adicional.descripcion || "")
      formData.append("precio", adicional.precio.toString())
      formData.append("menu_id", adicional.menu_id.toString())
      formData.append("status", newStatus)

      await adicionalService.updateAdicional(id.toString(), formData)
      await loadData()
      toast({
        title: "Éxito",
        description: `Adicional ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`,
        variant: "default",
      })
    } catch (error: unknown) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cambiar el estado",
        variant: "destructive",
      })
    }
  }

  // Filtrar adicionales según el término de búsqueda
  const filteredAdicionales = adicionales.filter((adicional) => {
    if (!searchTerm.trim()) return true

    const searchLower = searchTerm.toLowerCase()
    
    // Buscar en título del adicional
    if (adicional.titulo.toLowerCase().includes(searchLower)) return true
    
    // Buscar en descripción
    if (adicional.descripcion && adicional.descripcion.toLowerCase().includes(searchLower)) return true
    
    // Buscar en nombre del producto/menú
    if (adicional.menu?.titulo && adicional.menu.titulo.toLowerCase().includes(searchLower)) return true

    return false
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/socio/admin/menu")}
              className="border-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al menú
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Todos los Adicionales</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Datos actuales:")
                console.log("Adicionales:", adicionales)
                console.log("Menús:", menus)
                loadData()
              }}
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Recargar
            </Button>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 py-4 bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              Adicionales por Producto
              <span className="text-sm font-normal text-gray-500">
                ({filteredAdicionales.length} {filteredAdicionales.length === 1 ? 'adicional' : 'adicionales'})
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <CreateAdicionalModal menus={menus} onSubmit={handleCreateAdicional} />
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  placeholder="Buscar por nombre de adicional o producto..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Separator className="my-6" />

              <AdicionalesList
                adicionales={filteredAdicionales}
                menus={menus}
                onStatusChange={handleStatusChange}
                onEditAdicional={handleEditAdicional}
                onDeleteAdicional={handleDeleteAdicional}
                loading={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Página principal que usa Suspense
export default function Page() {
  return (
    <Suspense fallback={<LoadingAdicionales />}>
      <AdicionalesContent />
    </Suspense>
  )
}
