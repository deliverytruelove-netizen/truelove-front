"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, Plus, Loader2, Layers, Pencil, Trash2, ChevronDown, ChevronRight, Check, X, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getGrupos,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  addItemToGrupo,
  removeItemFromGrupo,
  getAvailableItems,
  type GrupoAdicional,
  type GrupoAdicionalItem,
} from "../../services/grupo-adicional.service"
import { CreateAdicionalInline } from "../../components/create-adicional-inline"

export default function GruposPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [grupos, setGrupos] = useState<GrupoAdicional[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedGrupo, setExpandedGrupo] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Crear/editar grupo inline
  const [showNewGrupo, setShowNewGrupo] = useState(false)
  const [editingGrupoId, setEditingGrupoId] = useState<number | null>(null)
  const [grupoForm, setGrupoForm] = useState({ nombre: "", minimo: 0, maximo: 1 })
  const [savingGrupo, setSavingGrupo] = useState(false)

  // Agregar item a grupo
  const [addingToGrupoId, setAddingToGrupoId] = useState<number | null>(null)
  const [availableItems, setAvailableItems] = useState<GrupoAdicionalItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string>("")
  const [itemPrecio, setItemPrecio] = useState<string>("")
  const [addingItem, setAddingItem] = useState(false)

  // Crear nuevo adicional inline
  const [creatingAdicionalInGrupo, setCreatingAdicionalInGrupo] = useState<number | null>(null)

  const loadGrupos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getGrupos()
      setGrupos(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar grupos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadGrupos()
  }, [loadGrupos])

  // Filtrar grupos
  const filteredGrupos = grupos.filter((grupo) => {
    if (!searchTerm.trim()) return true
    return grupo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Expandir grupo
  const handleToggleExpand = async (grupoId: number) => {
    if (expandedGrupo === grupoId) {
      setExpandedGrupo(null)
      setAddingToGrupoId(null)
      setCreatingAdicionalInGrupo(null)
    } else {
      setExpandedGrupo(grupoId)
      setAddingToGrupoId(null)
      setCreatingAdicionalInGrupo(null)
    }
  }

  // Crear nuevo grupo
  const handleCreateGrupo = async () => {
    if (!grupoForm.nombre.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" })
      return
    }

    try {
      setSavingGrupo(true)
      await createGrupo(grupoForm)
      toast({ title: "Éxito", description: "Grupo creado correctamente" })
      setShowNewGrupo(false)
      setGrupoForm({ nombre: "", minimo: 0, maximo: 1 })
      loadGrupos()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear grupo",
        variant: "destructive",
      })
    } finally {
      setSavingGrupo(false)
    }
  }

  // Iniciar edición de grupo
  const handleStartEditGrupo = (e: React.MouseEvent, grupo: GrupoAdicional) => {
    e.stopPropagation()
    setEditingGrupoId(grupo.id)
    setGrupoForm({ nombre: grupo.nombre, minimo: grupo.minimo, maximo: grupo.maximo })
  }

  // Guardar edición de grupo
  const handleSaveEditGrupo = async (grupoId: number) => {
    if (!grupoForm.nombre.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" })
      return
    }

    try {
      setSavingGrupo(true)
      await updateGrupo(grupoId, grupoForm)
      toast({ title: "Éxito", description: "Grupo actualizado correctamente" })
      setEditingGrupoId(null)
      loadGrupos()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar grupo",
        variant: "destructive",
      })
    } finally {
      setSavingGrupo(false)
    }
  }

  // Eliminar grupo
  const handleDeleteGrupo = async (id: number) => {
    try {
      await deleteGrupo(id)
      toast({ title: "Éxito", description: "Grupo eliminado correctamente" })
      if (expandedGrupo === id) setExpandedGrupo(null)
      loadGrupos()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar grupo",
        variant: "destructive",
      })
    }
  }

  // Iniciar agregar item existente
  const handleStartAddItem = async (grupoId: number) => {
    setAddingToGrupoId(grupoId)
    setCreatingAdicionalInGrupo(null)
    setSelectedItem("")
    setItemPrecio("")
    setLoadingItems(true)

    try {
      const items = await getAvailableItems(grupoId)
      setAvailableItems(items)
    } catch {
      toast({
        title: "Error",
        description: "Error al cargar adicionales disponibles",
        variant: "destructive",
      })
      setAddingToGrupoId(null)
    } finally {
      setLoadingItems(false)
    }
  }

  // Agregar item existente al grupo
  const handleAddItem = async (grupoId: number) => {
    if (!selectedItem || !itemPrecio) {
      toast({ title: "Error", description: "Selecciona un adicional y precio", variant: "destructive" })
      return
    }

    try {
      setAddingItem(true)
      await addItemToGrupo(grupoId, {
        adicional_id: parseInt(selectedItem),
        precio: parseFloat(itemPrecio),
      })
      toast({ title: "Éxito", description: "Adicional agregado al grupo" })
      setAddingToGrupoId(null)
      setSelectedItem("")
      setItemPrecio("")
      loadGrupos()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar adicional",
        variant: "destructive",
      })
    } finally {
      setAddingItem(false)
    }
  }

  // Remover item del grupo
  const handleRemoveItem = async (grupoId: number, adicionalId: number) => {
    try {
      await removeItemFromGrupo(grupoId, adicionalId)
      toast({ title: "Éxito", description: "Adicional removido del grupo" })
      loadGrupos()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al remover adicional",
        variant: "destructive",
      })
    }
  }

  // Seleccionar item disponible (auto-llenar precio)
  const handleSelectItem = (value: string) => {
    setSelectedItem(value)
    const item = availableItems.find(i => i.id.toString() === value)
    if (item) {
      setItemPrecio(typeof item.precio === "string" ? item.precio : item.precio.toString())
    }
  }

  // Callback cuando se crea un adicional nuevo
  const handleAdicionalCreated = async (grupoId: number, adicional: { id: number; titulo: string; precio: number }) => {
    try {
      await addItemToGrupo(grupoId, {
        adicional_id: adicional.id,
        precio: adicional.precio,
      })
      toast({ title: "Éxito", description: "Adicional creado y agregado al grupo" })
      setCreatingAdicionalInGrupo(null)
      loadGrupos()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar al grupo",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number | string): string => {
    const num = typeof price === "string" ? parseFloat(price) : price
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/socio/admin/menu")}
            className="border-gray-300 mb-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Grupos de Adicionales</h1>
          <p className="text-sm text-gray-500">Organiza tus adicionales en grupos con reglas de selección</p>
        </div>

        {/* Buscador y botón nuevo */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {!showNewGrupo && (
            <Button 
              onClick={() => {
                setShowNewGrupo(true)
                setGrupoForm({ nombre: "", minimo: 0, maximo: 1 })
              }} 
              className="gap-2 bg-red-600 hover:bg-red-700 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Nuevo Grupo
            </Button>
          )}
        </div>

        {/* Formulario nuevo grupo */}
        {showNewGrupo && (
          <Card className="mb-6 border-2 border-dashed border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Crear Nuevo Grupo</h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Label className="text-xs text-gray-600">Nombre del grupo *</Label>
                  <Input
                    placeholder="Ej: Elige tu salsa"
                    value={grupoForm.nombre}
                    onChange={(e) => setGrupoForm({ ...grupoForm, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={grupoForm.minimo}
                    onChange={(e) => setGrupoForm({ ...grupoForm, minimo: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-400 mt-1">0 = opcional</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Máximo</Label>
                  <Input
                    type="number"
                    min="1"
                    value={grupoForm.maximo}
                    onChange={(e) => setGrupoForm({ ...grupoForm, maximo: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleCreateGrupo}
                  disabled={savingGrupo || !grupoForm.nombre.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {savingGrupo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear Grupo
                </Button>
                <Button variant="outline" onClick={() => setShowNewGrupo(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de grupos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : filteredGrupos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-gray-500">
              <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No hay grupos de adicionales</p>
              <p className="text-sm">Crea tu primer grupo para organizar tus adicionales</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredGrupos.map((grupo) => {
              const isExpanded = expandedGrupo === grupo.id
              const isEditing = editingGrupoId === grupo.id
              const itemCount = grupo.items?.length || 0

              return (
                <Card 
                  key={grupo.id} 
                  className="overflow-hidden transition-all"
                >
                  {/* Header del grupo */}
                  <div 
                    className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isExpanded ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' : ''}`}
                    onClick={() => !isEditing && handleToggleExpand(grupo.id)}
                  >
                    {/* Icono expandir */}
                    <div className="text-gray-400 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>

                    {/* Info del grupo */}
                    {isEditing ? (
                      <div className="flex-1 grid gap-2 grid-cols-2 sm:grid-cols-4 items-end min-w-0" onClick={(e) => e.stopPropagation()}>
                        <div className="col-span-2">
                          <Input
                            value={grupoForm.nombre}
                            onChange={(e) => setGrupoForm({ ...grupoForm, nombre: e.target.value })}
                            placeholder="Nombre del grupo"
                          />
                        </div>
                        <Input
                          type="number"
                          min="0"
                          value={grupoForm.minimo}
                          onChange={(e) => setGrupoForm({ ...grupoForm, minimo: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                          type="number"
                          min="1"
                          value={grupoForm.maximo}
                          onChange={(e) => setGrupoForm({ ...grupoForm, maximo: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{grupo.nombre}</h3>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {grupo.minimo === 0 ? 'Opcional' : `Mínimo: ${grupo.minimo}`} | Máximo: {grupo.maximo}
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEditGrupo(grupo.id)}
                            disabled={savingGrupo}
                            className="bg-green-600 hover:bg-green-700 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0"
                          >
                            {savingGrupo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingGrupoId(null)} className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge className={`${grupo.estado === "active" ? "bg-green-500" : "bg-gray-400"} text-xs`}>
                            {grupo.estado === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={(e) => handleStartEditGrupo(e, grupo)} className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar grupo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará el grupo &quot;{grupo.nombre}&quot; y todas sus relaciones con productos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteGrupo(grupo.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contenido expandido */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                      {/* Lista de adicionales */}
                      {itemCount === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                          <p className="text-sm">Este grupo no tiene adicionales</p>
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2 mb-4">
                          {grupo.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.titulo}</p>
                                <p className="text-sm text-green-600 font-semibold">
                                  S/ {formatPrice(item.pivot?.precio || item.precio)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleRemoveItem(grupo.id, item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Agregar adicional existente */}
                      {addingToGrupoId === grupo.id ? (
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <h5 className="text-sm font-medium mb-3">Seleccionar adicional existente</h5>
                          {loadingItems ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            </div>
                          ) : availableItems.length === 0 ? (
                            <p className="text-sm text-gray-500 py-2">
                              No hay adicionales disponibles. Crea uno nuevo.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              <Select value={selectedItem} onValueChange={handleSelectItem}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un adicional" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableItems.map((item) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                      {item.titulo} - S/ {formatPrice(item.precio)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div>
                                <Label className="text-xs">Precio en este grupo</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={itemPrecio}
                                  onChange={(e) => setItemPrecio(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleAddItem(grupo.id)}
                                  disabled={addingItem || !selectedItem}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {addingItem && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Agregar
                                </Button>
                                <Button variant="outline" onClick={() => setAddingToGrupoId(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : creatingAdicionalInGrupo === grupo.id ? (
                        <CreateAdicionalInline
                          onCreated={(adicional) => handleAdicionalCreated(grupo.id, adicional)}
                          onCancel={() => setCreatingAdicionalInGrupo(null)}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartAddItem(grupo.id)}
                            className="gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Agregar existente
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCreatingAdicionalInGrupo(grupo.id)}
                            className="gap-1 border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/20"
                          >
                            <Plus className="h-4 w-4" />
                            Crear nuevo
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
