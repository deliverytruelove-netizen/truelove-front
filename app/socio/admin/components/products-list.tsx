// app\socio\admin\components\products-list.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, MoreVertical, ShoppingBag, Trash2, Search, Layers, ChevronDown, ChevronRight, Loader2, Check, X, GripVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { MenuItem, Category } from "../services/menu.service"
import { EditMenuModal } from "./edit-menu-modal"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useMemo, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  getGrupos,
  getMenuGrupos,
  assignGruposToMenu,
  addItemToGrupo,
  removeItemFromGrupo,
  getAvailableItems,
  type GrupoAdicional,
  type GrupoAdicionalItem,
} from "../services/grupo-adicional.service"
import { CreateAdicionalInline } from "./create-adicional-inline"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function SortableProductWrapper({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 touch-none"
        title="Arrastrar para reordenar"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </button>
      <div className="pl-7">{children}</div>
    </div>
  )
}

interface ProductsListProps {
  menuItems: MenuItem[]
  categories: Category[]
  onStatusChange: (id: number, newStatus: string) => Promise<void>
  onEditMenu: (id: number, formData: FormData) => Promise<void>
  onDeleteMenu: (id: number) => Promise<void>
  onReorder?: (menus: { id: number; orden: number }[]) => void
  loading: boolean
}

export function ProductsList({
  menuItems,
  categories,
  onStatusChange,
  onEditMenu,
  onDeleteMenu,
  onReorder,
  loading,
}: ProductsListProps) {
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
  
  // Estado para grupos expandidos
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null)
  const [expandedGrupoId, setExpandedGrupoId] = useState<number | null>(null)
  const [allGrupos, setAllGrupos] = useState<GrupoAdicional[]>([])
  const [selectedGrupos, setSelectedGrupos] = useState<Record<number, number[]>>({})
  const [loadingGrupos, setLoadingGrupos] = useState(false)
  const [savingGrupos, setSavingGrupos] = useState(false)
  const [gruposLoaded, setGruposLoaded] = useState(false)
  
  // Estado para agregar adicionales a grupos
  const [addingToGrupoId, setAddingToGrupoId] = useState<number | null>(null)
  const [creatingInGrupoId, setCreatingInGrupoId] = useState<number | null>(null)
  const [availableItems, setAvailableItems] = useState<GrupoAdicionalItem[]>([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState("")
  const [selectedItemPrice, setSelectedItemPrice] = useState("")
  const [addingItem, setAddingItem] = useState(false)

  // Estado para drag & drop de productos
  const [sortedItems, setSortedItems] = useState<MenuItem[]>(menuItems)
  useEffect(() => {
    setSortedItems(menuItems)
  }, [menuItems])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedItems.findIndex((i) => i.id === active.id)
    const newIndex = sortedItems.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(sortedItems, oldIndex, newIndex)
    setSortedItems(newItems)

    if (onReorder) {
      onReorder(newItems.map((item, index) => ({ id: item.id, orden: index + 1 })))
    }
  }

  // Cargar todos los grupos una vez
  const loadAllGrupos = useCallback(async () => {
    if (gruposLoaded) return
    try {
      const grupos = await getGrupos()
      setAllGrupos(grupos.filter(g => g.estado === "active"))
      setGruposLoaded(true)
    } catch {
      // Silently fail
    }
  }, [gruposLoaded])

  useEffect(() => {
    loadAllGrupos()
  }, [loadAllGrupos])

  // Filtrar productos según la búsqueda
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return sortedItems

    const query = searchQuery.toLowerCase()
    return sortedItems.filter(
      (item) =>
        item.titulo.toLowerCase().includes(query) ||
        item.descripcion.toLowerCase().includes(query) ||
        item.precio.toString().includes(query)
    )
  }, [sortedItems, searchQuery])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">Activo</Badge>
      case "inactive":
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-white text-xs">Inactivo</Badge>
      case "out-of-stock":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">Agotado</Badge>
      default:
        return null
    }
  }

  const formatPrice = (price: number | string): string => {
    if (typeof price === "string") {
      const numPrice = Number.parseFloat(price)
      if (!isNaN(numPrice)) {
        return numPrice.toFixed(2)
      }
      return price
    }
    return price.toFixed(2)
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await onDeleteMenu(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDropdownOpenChange = (id: number, open: boolean) => {
    setOpenDropdownId(open ? id : null)
  }

  // Expandir/colapsar grupos de un producto
  const handleToggleGrupos = async (productId: number) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null)
      setExpandedGrupoId(null)
      return
    }

    setExpandedProductId(productId)
    setExpandedGrupoId(null)
    
    // Cargar grupos asignados a este producto si no están cargados
    if (selectedGrupos[productId] === undefined) {
      setLoadingGrupos(true)
      try {
        const menuGrupos = await getMenuGrupos(productId)
        setSelectedGrupos(prev => ({
          ...prev,
          [productId]: menuGrupos.map(g => g.id)
        }))
      } catch {
        setSelectedGrupos(prev => ({
          ...prev,
          [productId]: []
        }))
      } finally {
        setLoadingGrupos(false)
      }
    }
  }

  // Toggle selección de grupo
  const handleToggleGrupo = (productId: number, grupoId: number) => {
    setSelectedGrupos(prev => {
      const current = prev[productId] || []
      const newSelection = current.includes(grupoId)
        ? current.filter(id => id !== grupoId)
        : [...current, grupoId]
      return { ...prev, [productId]: newSelection }
    })
  }

  // Expandir grupo para ver adicionales
  const handleToggleGrupoExpand = (grupoId: number) => {
    if (expandedGrupoId === grupoId) {
      setExpandedGrupoId(null)
    } else {
      setExpandedGrupoId(grupoId)
    }
    setAddingToGrupoId(null)
    setCreatingInGrupoId(null)
  }

  // Iniciar agregar adicional existente a grupo
  const handleStartAddToGrupo = async (grupoId: number) => {
    setAddingToGrupoId(grupoId)
    setCreatingInGrupoId(null)
    setSelectedItemId("")
    setSelectedItemPrice("")
    setLoadingAvailable(true)
    
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
      setLoadingAvailable(false)
    }
  }

  // Agregar adicional existente a grupo
  const handleAddItemToGrupo = async (grupoId: number) => {
    if (!selectedItemId || !selectedItemPrice) {
      toast({ title: "Error", description: "Selecciona un adicional y precio", variant: "destructive" })
      return
    }

    try {
      setAddingItem(true)
      await addItemToGrupo(grupoId, {
        adicional_id: parseInt(selectedItemId),
        precio: parseFloat(selectedItemPrice),
      })
      toast({ title: "Éxito", description: "Adicional agregado al grupo" })
      setAddingToGrupoId(null)
      setSelectedItemId("")
      setSelectedItemPrice("")
      // Recargar grupos
      setGruposLoaded(false)
      loadAllGrupos()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar",
        variant: "destructive",
      })
    } finally {
      setAddingItem(false)
    }
  }

  // Remover adicional de grupo
  const handleRemoveItemFromGrupo = async (grupoId: number, adicionalId: number) => {
    try {
      await removeItemFromGrupo(grupoId, adicionalId)
      toast({ title: "Éxito", description: "Adicional removido del grupo" })
      // Recargar grupos
      setGruposLoaded(false)
      loadAllGrupos()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al remover",
        variant: "destructive",
      })
    }
  }

  // Seleccionar item (auto-llenar precio)
  const handleSelectItem = (value: string) => {
    setSelectedItemId(value)
    const item = availableItems.find(i => i.id.toString() === value)
    if (item) {
      setSelectedItemPrice(typeof item.precio === "string" ? item.precio : item.precio.toString())
    }
  }

  // Callback cuando se crea adicional nuevo
  const handleAdicionalCreated = async (grupoId: number, adicional: { id: number; precio: number }) => {
    try {
      await addItemToGrupo(grupoId, {
        adicional_id: adicional.id,
        precio: adicional.precio,
      })
      toast({ title: "Éxito", description: "Adicional creado y agregado al grupo" })
      setCreatingInGrupoId(null)
      // Recargar grupos
      setGruposLoaded(false)
      loadAllGrupos()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar",
        variant: "destructive",
      })
    }
  }

  // Guardar grupos del producto
  const handleSaveGrupos = async (productId: number) => {
    try {
      setSavingGrupos(true)
      await assignGruposToMenu(productId, selectedGrupos[productId] || [])
      toast({ title: "Éxito", description: "Grupos actualizados correctamente" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar",
        variant: "destructive",
      })
    } finally {
      setSavingGrupos(false)
    }
  }

  // Contar grupos seleccionados para un producto
  const getSelectedCount = (productId: number) => {
    return selectedGrupos[productId]?.length || 0
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-200">Cargando productos...</p>
      </div>
    )
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300">
        <ShoppingBag className="h-12 w-12 text-gray-400 dark:text-gray-200 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">No hay productos en esta categoría</p>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-200">Agrega productos usando el botón Nuevo producto</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-hidden">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar productos por nombre, descripción o precio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full text-sm"
        />
      </div>

      {/* Contador de resultados */}
      {searchQuery && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredMenuItems.length === 0 ? (
            <span>No se encontraron productos que coincidan con &quot;{searchQuery}&quot;</span>
          ) : (
            <span>Mostrando {filteredMenuItems.length} de {menuItems.length} productos</span>
          )}
        </div>
      )}

      {/* Lista de productos */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredMenuItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-3">
        {filteredMenuItems.map((item) => {
          const isExpanded = expandedProductId === item.id
          const productGrupos = selectedGrupos[item.id] || []

          return (
            <SortableProductWrapper key={item.id} id={item.id}>
            <Card
              className="overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-colors"
            >
              {/* Contenido principal del producto */}
              <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
                {/* Imagen */}
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={item.foto || "/placeholder.svg?height=80&width=80"}
                    alt={item.titulo}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info del producto */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate">{item.titulo}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.descripcion}</p>
                  <p className="font-semibold text-red-600 dark:text-red-400 mt-1 text-sm">S/ {formatPrice(item.precio)}</p>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {/* Botón Grupos (expandible) */}
                  <Button 
                    variant={isExpanded ? "default" : "outline"} 
                    size="sm" 
                    className={`gap-1 px-2 sm:px-3 ${isExpanded ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    onClick={() => handleToggleGrupos(item.id)}
                  >
                    <Layers className="h-4 w-4" />
                    {getSelectedCount(item.id) > 0 && (
                      <span className="text-xs">{getSelectedCount(item.id)}</span>
                    )}
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </Button>

                  {/* Menú de opciones */}
                  <DropdownMenu
                    open={openDropdownId === item.id}
                    onOpenChange={(open) => handleDropdownOpenChange(item.id, open)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Opciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="text-green-600 focus:text-green-600 focus:bg-green-50"
                        onClick={() => { onStatusChange(item.id, "active"); setOpenDropdownId(null) }}
                      >
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Activar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-gray-600 focus:text-gray-600 focus:bg-gray-50"
                        onClick={() => { onStatusChange(item.id, "inactive"); setOpenDropdownId(null) }}
                      >
                        <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                        Desactivar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                        onClick={() => { onStatusChange(item.id, "out-of-stock"); setOpenDropdownId(null) }}
                      >
                        <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                        Agotado
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <EditMenuModal
                        menuItem={item}
                        categories={categories}
                        onSubmit={async (id, formData) => { await onEditMenu(id, formData); setOpenDropdownId(null) }}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-gray-50">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar producto
                          </DropdownMenuItem>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar producto
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                              <div className="space-y-2">
                                <p>Esta acción no se puede deshacer. Se eliminará permanentemente el producto:</p>
                                <p className="font-semibold text-red-600 dark:text-gray-200">{item.titulo}</p>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => { handleDelete(item.id); setOpenDropdownId(null) }}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingId === item.id}
                            >
                              {deletingId === item.id ? "Eliminando..." : "Sí, eliminar"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Panel expandible de grupos */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Grupos de adicionales para este producto
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => handleSaveGrupos(item.id)}
                      disabled={savingGrupos}
                      className="bg-green-600 hover:bg-green-700 gap-1"
                    >
                      {savingGrupos ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Guardar
                    </Button>
                  </div>

                  {loadingGrupos ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : allGrupos.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Layers className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No hay grupos disponibles</p>
                      <p className="text-xs">Crea grupos en la sección Grupos de Adicionales</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allGrupos.map((grupo) => {
                        const isSelected = productGrupos.includes(grupo.id)
                        const isGrupoExpanded = expandedGrupoId === grupo.id
                        const itemCount = grupo.items?.length || 0

                        return (
                          <div
                            key={grupo.id}
                            className={`rounded-lg border overflow-hidden transition-all ${
                              isSelected
                                ? 'border-red-300 dark:border-red-700'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {/* Header del grupo */}
                            <div
                              className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-red-50 dark:bg-red-900/20'
                                  : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                              } ${isGrupoExpanded && isSelected ? 'border-l-4 border-red-500' : ''}`}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleGrupo(item.id, grupo.id)}
                              />
                              <div 
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => handleToggleGrupoExpand(grupo.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                    {grupo.nombre}
                                  </p>
                                  <Badge variant="secondary" className="text-xs">
                                    {itemCount} items
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {grupo.minimo === 0 ? 'Opcional' : `Mín: ${grupo.minimo}`} | Máx: {grupo.maximo}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleToggleGrupoExpand(grupo.id)}
                              >
                                {isGrupoExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </div>

                            {/* Adicionales del grupo (expandible) */}
                            {isGrupoExpanded && (
                              <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                                {/* Lista de adicionales */}
                                {itemCount === 0 ? (
                                  <p className="text-xs text-gray-400 text-center py-2">
                                    Este grupo no tiene adicionales
                                  </p>
                                ) : (
                                  <div className="grid gap-2 sm:grid-cols-2 mb-3">
                                    {grupo.items?.map((adicional) => (
                                      <div
                                        key={adicional.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                                      >
                                        <span className="text-gray-700 dark:text-gray-300 truncate">
                                          {adicional.titulo}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-green-600 font-medium whitespace-nowrap">
                                            S/ {formatPrice(adicional.pivot?.precio || adicional.precio)}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                                            onClick={() => handleRemoveItemFromGrupo(grupo.id, adicional.id)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Agregar adicional existente */}
                                {addingToGrupoId === grupo.id ? (
                                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium">Agregar adicional existente</p>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-gray-400 hover:text-gray-600"
                                        onClick={() => setAddingToGrupoId(null)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    {loadingAvailable ? (
                                      <div className="flex items-center justify-center py-3">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      </div>
                                    ) : availableItems.length === 0 ? (
                                      <div className="space-y-2">
                                        <p className="text-xs text-gray-500">No hay adicionales disponibles</p>
                                        <Button size="sm" variant="outline" onClick={() => setAddingToGrupoId(null)}>
                                          Cancelar
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <Select value={selectedItemId} onValueChange={handleSelectItem}>
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar adicional" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableItems.map((av) => (
                                              <SelectItem key={av.id} value={av.id.toString()}>
                                                {av.titulo} - S/ {formatPrice(av.precio)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <div>
                                          <Label className="text-xs">Precio en este grupo</Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={selectedItemPrice}
                                            onChange={(e) => setSelectedItemPrice(e.target.value)}
                                            placeholder="0.00"
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => handleAddItemToGrupo(grupo.id)}
                                            disabled={addingItem || !selectedItemId}
                                            className="bg-blue-600 hover:bg-blue-700"
                                          >
                                            {addingItem && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                            Agregar
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={() => setAddingToGrupoId(null)}>
                                            Cancelar
                                          </Button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ) : creatingInGrupoId === grupo.id ? (
                                  <CreateAdicionalInline
                                    onCreated={(adicional) => handleAdicionalCreated(grupo.id, adicional)}
                                    onCancel={() => setCreatingInGrupoId(null)}
                                  />
                                ) : (
                                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStartAddToGrupo(grupo.id)}
                                      className="text-xs h-7"
                                    >
                                      + Agregar existente
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setCreatingInGrupoId(grupo.id)
                                        setAddingToGrupoId(null)
                                      }}
                                      className="text-xs h-7 border-green-300 text-green-600 hover:bg-green-50"
                                    >
                                      + Crear nuevo
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
            </SortableProductWrapper>
          )
        })}
      </div>
        </SortableContext>
      </DndContext>

      {/* Mensaje cuando no hay resultados de búsqueda */}
      {searchQuery && filteredMenuItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300">
          <Search className="h-12 w-12 text-gray-400 dark:text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontraron productos</p>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-200">Intenta con otros términos de búsqueda</p>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-4">
            Limpiar búsqueda
          </Button>
        </div>
      )}
    </div>
  )
}
