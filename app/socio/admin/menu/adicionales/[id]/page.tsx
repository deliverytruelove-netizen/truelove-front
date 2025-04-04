"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { adicionalService, type CategoriaAdicional, type Adicional } from "../../../services/adicional.service"
import { CreateAdicionalModal } from "../../../components/create-adicional-modal"
import { AdicionalesList } from "../../../components/adicionales-list"

// Componente de carga para Suspense
function LoadingAdicionales() {
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
        <p className="text-gray-600">Cargando adicionales...</p>
      </div>
    </div>
  )
}

// Componente principal que maneja la lógica de datos
function CategoriaContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [categoria, setCategoria] = useState<CategoriaAdicional | null>(null)
  const [adicionales, setAdicionales] = useState<Adicional[]>([])
  const [allCategorias, setAllCategorias] = useState<CategoriaAdicional[]>([])
  const [loading, setLoading] = useState(true)

  const categoriaId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Cargar categorías
      const categoriasResponse = await adicionalService.getCategoriasAdicionales()

      if (categoriasResponse.success && categoriasResponse.data) {
        setAllCategorias(categoriasResponse.data)

        // Encontrar la categoría actual
        const currentCategoria = categoriasResponse.data.find((cat) => cat.id.toString() === categoriaId)

        if (currentCategoria) {
          setCategoria(currentCategoria)
        } else {
          toast({
            title: "Error",
            description: "Categoría no encontrada",
            variant: "destructive",
          })
          router.push("/socio/admin/menu/adicionales")
          return
        }
      } else {
        throw new Error(categoriasResponse.message || "Error al cargar categorías")
      }

      // Cargar adicionales
      const adicionalesResponse = await adicionalService.getAdicionales()

      // Filtrar solo los adicionales de esta categoría
      const categoriaAdicionales = adicionalesResponse.filter(
        (item) => Number(item.categoria_adicional_id) === Number(categoriaId),
      )

      setAdicionales(categoriaAdicionales)
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
  }, [categoriaId, router, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateAdicional = async (formData: FormData) => {
    try {
      // Asegurarse de que el adicional se cree con la categoría actual
      formData.set("categoria_adicional_id", categoriaId)

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

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const formData = new FormData()
      formData.append("status", newStatus)

      await adicionalService.updateAdicional(id.toString(), formData)
      await loadData()

      const statusMessages: Record<string, string> = {
        active: "Adicional activado correctamente",
        inactive: "Adicional desactivado correctamente",
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

  if (loading) {
    return <LoadingAdicionales />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/socio/admin/menu/adicionales")}
              className="border-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{categoria?.nombre || "Categoría"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData} className="border-gray-300">
              <Loader2 className="mr-2 h-4 w-4" />
              Recargar datos
            </Button>
            <CreateAdicionalModal
              categorias={allCategorias}
              onSubmit={handleCreateAdicional}
              defaultCategoriaId={categoriaId}
            />
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 py-4 bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">Adicionales en esta categoría</CardTitle>
            {/* <CreateAdicionalModal
              categorias={allCategorias}
              onSubmit={handleCreateAdicional}
              defaultCategoriaId={categoriaId}
              trigger={
                <Button className="bg-red-600 hover:bg-red-700 text-white transition-colors gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo adicional
                </Button>
              }
            /> */}
          </CardHeader>
          <CardContent className="p-5">
            <AdicionalesList
              adicionales={adicionales}
              categorias={allCategorias}
              onStatusChange={handleStatusChange}
              onEditAdicional={handleEditAdicional}
              onDeleteAdicional={handleDeleteAdicional}
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
    <Suspense fallback={<LoadingAdicionales />}>
      <CategoriaContent />
    </Suspense>
  )
}

