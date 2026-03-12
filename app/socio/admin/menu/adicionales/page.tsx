"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { Search, Loader2, ArrowLeft, Package, Plus, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { adicionalService, type Adicional } from "../../services/adicional.service"

function LoadingAdicionales() {
  return (
    <div className="text-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
      <p className="text-gray-600">Cargando adicionales...</p>
    </div>
  )
}

function AdicionalesContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [adicionales, setAdicionales] = useState<Adicional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAdicional, setEditingAdicional] = useState<Adicional | null>(null)
  const [formData, setFormData] = useState({ titulo: "", descripcion: "", precio: "" })
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const adicionalesResponse = await adicionalService.getAdicionales()
      setAdicionales(adicionalesResponse)
    } catch (error) {
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

  const handleOpenCreate = () => {
    setEditingAdicional(null)
    setFormData({ titulo: "", descripcion: "", precio: "" })
    setModalOpen(true)
  }

  const handleOpenEdit = (adicional: Adicional) => {
    setEditingAdicional(adicional)
    setFormData({
      titulo: adicional.titulo,
      descripcion: adicional.descripcion || "",
      precio: adicional.precio.toString(),
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.titulo.trim() || !formData.precio) {
      toast({ title: "Error", description: "Titulo y precio son requeridos", variant: "destructive" })
      return
    }

    try {
      setSaving(true)
      const data = new FormData()
      data.append("titulo", formData.titulo)
      data.append("descripcion", formData.descripcion)
      data.append("precio", formData.precio)
      data.append("status", "active")

      if (editingAdicional) {
        // Mantener menu_id si existe
        if (editingAdicional.menu_id) {
          data.append("menu_id", editingAdicional.menu_id.toString())
        }
        await adicionalService.updateAdicional(editingAdicional.id.toString(), data)
        toast({ title: "Éxito", description: "Adicional actualizado correctamente" })
      } else {
        await adicionalService.createAdicional(data)
        toast({ title: "Éxito", description: "Adicional creado correctamente" })
      }

      setModalOpen(false)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await adicionalService.deleteAdicional(id.toString())
      toast({ title: "Éxito", description: "Adicional eliminado correctamente" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (adicional: Adicional, newStatus: string) => {
    try {
      const data = new FormData()
      data.append("titulo", adicional.titulo)
      data.append("descripcion", adicional.descripcion || "")
      data.append("precio", adicional.precio.toString())
      data.append("status", newStatus)
      if (adicional.menu_id) {
        data.append("menu_id", adicional.menu_id.toString())
      }

      await adicionalService.updateAdicional(adicional.id.toString(), data)
      const labels: Record<string, string> = { active: "activado", inactive: "desactivado", "out-of-stock": "marcado como agotado" }
      toast({
        title: "Éxito",
        description: `Adicional ${labels[newStatus] || newStatus}`,
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar estado",
        variant: "destructive",
      })
    }
  }

  const filteredAdicionales = adicionales.filter((adicional) => {
    if (!searchTerm.trim()) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      adicional.titulo.toLowerCase().includes(searchLower) ||
      adicional.descripcion?.toLowerCase().includes(searchLower)
    )
  })

  const formatPrice = (price: number | string): string => {
    const num = typeof price === "string" ? parseFloat(price) : price
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto py-4 px-2 sm:px-4 sm:py-6 max-w-7xl">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Biblioteca de Adicionales</h1>
          </div>
        </div>

        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              Adicionales
              <span className="text-sm font-normal text-gray-500">
                ({filteredAdicionales.length} {filteredAdicionales.length === 1 ? "adicional" : "adicionales"})
              </span>
            </CardTitle>
            <Button onClick={handleOpenCreate} className="gap-2 bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4" />
              Nuevo Adicional
            </Button>
          </CardHeader>
          <CardContent className="p-3 sm:p-5 dark:bg-gray-800">
            <div className="space-y-4">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="pl-10 border-gray-300"
                  placeholder="Buscar adicionales..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Biblioteca de Adicionales:</strong> Crea aquí tus adicionales (ingredientes extras, salsas, etc). 
                  Luego podrás agregarlos a los <strong>Grupos de Adicionales</strong> y asignar esos grupos a tus productos.
                </p>
              </div>

              {/* Lista */}
              {loading ? (
                <LoadingAdicionales />
              ) : filteredAdicionales.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay adicionales</p>
                  <p className="text-sm">Crea tu primer adicional para comenzar</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAdicionales.map((adicional) => (
                    <div
                      key={adicional.id}
                      className="p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-colors overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 break-words line-clamp-2 min-w-0 flex-1">
                          {adicional.titulo}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge
                                className={`cursor-pointer ${
                                  adicional.status === "active"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : adicional.status === "out-of-stock"
                                      ? "bg-amber-500 hover:bg-amber-600"
                                      : "bg-gray-400 hover:bg-gray-500"
                                }`}
                              >
                                {adicional.status === "active" ? "Activo" : adicional.status === "out-of-stock" ? "Agotado" : "Inactivo"}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                className="text-green-600 focus:text-green-600 focus:bg-green-50"
                                onClick={() => handleStatusChange(adicional, "active")}
                              >
                                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                Activo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                                onClick={() => handleStatusChange(adicional, "out-of-stock")}
                              >
                                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                                Agotado
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-gray-600 focus:text-gray-600 focus:bg-gray-50"
                                onClick={() => handleStatusChange(adicional, "inactive")}
                              >
                                <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                                Inactivo
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(adicional)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar adicional?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El adicional será removido de todos los grupos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(adicional.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {adicional.descripcion && (
                        <p className="text-sm text-gray-500 truncate mt-1">{adicional.descripcion}</p>
                      )}
                      <p className="text-sm font-semibold text-red-600 mt-1">
                        S/ {formatPrice(adicional.precio)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal Crear/Editar Adicional */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[425px] p-6">
            <DialogHeader>
              <DialogTitle>{editingAdicional ? "Editar Adicional" : "Nuevo Adicional"}</DialogTitle>
              <DialogDescription>
                {editingAdicional
                  ? "Modifica los datos del adicional"
                  : "Crea un nuevo adicional para tu biblioteca"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Nombre *</Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Queso extra, Salsa BBQ"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (opcional, máx. 100 caracteres)</Label>
                <Input
                  id="descripcion"
                  placeholder="Descripción breve"
                  maxLength={100}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
                <p className="text-xs text-gray-500">{formData.descripcion.length}/100</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingAdicional ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingAdicionales />}>
      <AdicionalesContent />
    </Suspense>
  )
}
