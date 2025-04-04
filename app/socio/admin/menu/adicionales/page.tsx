"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { Search, Loader2, Plus, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { adicionalService, type CategoriaAdicional, type Adicional } from "../../services/adicional.service"
import { CategoriaAdicionalDialog } from "../../components/categoria-adicional-dialog"
import { CategoriasAdicionalesList } from "../../components/categorias-adicionales-list"
import { CreateAdicionalModal } from "../../components/create-adicional-modal"
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
      <p className="text-gray-600">Cargando categorías de adicionales...</p>
    </div>
  )
}

// Componente principal que maneja la lógica de datos
function AdicionalesContent() {
  const router = useRouter()
  const [categorias, setCategorias] = useState<CategoriaAdicional[]>([])
  const [adicionales, setAdicionales] = useState<Adicional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Cargar categorías de adicionales
      const categoriasResponse = await adicionalService.getCategoriasAdicionales()

      if (categoriasResponse.success) {
        setCategorias(categoriasResponse.data || [])
        console.log("Categorías de adicionales cargadas:", categoriasResponse.data)
      } else {
        throw new Error(categoriasResponse.message || "Error al cargar categorías de adicionales")
      }

      // Cargar adicionales
      const adicionalesResponse = await adicionalService.getAdicionales()
      console.log("Respuesta completa de adicionales:", adicionalesResponse)
      setAdicionales(adicionalesResponse)
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

  const handleCreateCategoria = async (nombre: string) => {
    try {
      await adicionalService.createCategoriaAdicional({ nombre })
      await loadData()
      toast({
        title: "Éxito",
        description: "Categoría de adicional creada correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la categoría",
        variant: "destructive",
      })
    }
  }

  const handleEditCategoria = async (id: number, nombre: string) => {
    try {
      await adicionalService.updateCategoriaAdicional(id.toString(), { nombre })
      await loadData()
      toast({
        title: "Éxito",
        description: "Categoría de adicional actualizada correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la categoría",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategoria = async (id: number) => {
    try {
      await adicionalService.deleteCategoriaAdicional(id.toString())
      await loadData()
      toast({
        title: "Éxito",
        description: "Categoría de adicional eliminada correctamente",
        variant: "default",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    }
  }

  // Calcular el número de adicionales por categoría
  const adicionalesCounts: Record<number, number> = {}
  categorias.forEach((categoria) => {
    adicionalesCounts[categoria.id] = adicionales.filter(
      (item) => Number(item.categoria_adicional_id) === Number(categoria.id),
    ).length
  })

  // Filtrar categorías según el término de búsqueda
  const filteredCategorias = categorias.filter((categoria) => {
    // Si no hay término de búsqueda, mostrar todas las categorías
    if (!searchTerm.trim()) return true

    // Buscar en el nombre de la categoría
    if (categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return true

    // Buscar en los adicionales de la categoría
    const categoriaAdicionales = adicionales.filter((item) => {
      // Convertir ambos a número para comparación segura
      return Number(item.categoria_adicional_id) === Number(categoria.id)
    })

    return categoriaAdicionales.some(
      (item) =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
    )
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
            <h1 className="text-2xl font-bold text-gray-900">Opciones y Adicionales</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Datos actuales:")
                console.log("Categorías:", categorias)
                console.log("Adicionales:", adicionales)
                loadData()
              }}
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Recargar datos
            </Button>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 py-4 bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">Categorías de Adicionales</CardTitle>
            <div className="flex gap-2">
              <CategoriaAdicionalDialog
                onSubmit={handleCreateCategoria}
                trigger={
                  <Button variant="outline" className="gap-2 border-gray-300">
                    <Plus className="h-4 w-4" />
                    Nueva categoría
                  </Button>
                }
              />
              <CreateAdicionalModal categorias={categorias} onSubmit={handleCreateAdicional} />
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  placeholder="Buscar por nombre de categoría o adicional..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Separator className="my-6" />

              <CategoriasAdicionalesList
                categorias={filteredCategorias}
                adicionalesCounts={adicionalesCounts}
                onEditCategoria={handleEditCategoria}
                onDeleteCategoria={handleDeleteCategoria}
                onCreateCategoria={handleCreateCategoria}
                isLoading={loading}
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
    <Suspense fallback={<LoadingCategories />}>
      <AdicionalesContent />
    </Suspense>
  )
}

