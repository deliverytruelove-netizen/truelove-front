// app\socio\admin\components\products-list.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, MoreVertical, ShoppingBag, Trash2, Search, ListPlus, ChevronDown, ChevronUp, X, Loader2, Plus } from "lucide-react"
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
import { ManageProductAdicionalesModal } from "./manage-product-adicionales-modal"
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
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { useState, useMemo, useEffect, useCallback } from "react"
import { adicionalService, type Adicional } from "../services/adicional.service"
import { useToast } from "@/hooks/use-toast"

interface ProductsListProps {
  menuItems: MenuItem[]
  categories: Category[]
  onStatusChange: (id: number, newStatus: string) => Promise<void>
  onEditMenu: (id: number, formData: FormData) => Promise<void>
  onDeleteMenu: (id: number) => Promise<void>
  loading: boolean
}

export function ProductsList({
  menuItems,
  categories,
  onStatusChange,
  onEditMenu,
  onDeleteMenu,
  loading,
}: ProductsListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [adicionalesData, setAdicionalesData] = useState<Record<number, Adicional[]>>({})
  const [loadingAdicionales, setLoadingAdicionales] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  // Cargar adicionales para un producto específico
  const loadAdicionales = useCallback(async (menuId: number, force: boolean = false) => {
    if (!force && adicionalesData[menuId] !== undefined) return
    
    setLoadingAdicionales(prev => new Set(prev).add(menuId))
    try {
      const adicionales = await adicionalService.getMenuAdicionales(menuId)
      setAdicionalesData(prev => ({ ...prev, [menuId]: adicionales }))
    } catch {
      setAdicionalesData(prev => ({ ...prev, [menuId]: [] }))
    } finally {
      setLoadingAdicionales(prev => {
        const newSet = new Set(prev)
        newSet.delete(menuId)
        return newSet
      })
    }
  }, [adicionalesData])

  // Cargar todos los adicionales al montar
  useEffect(() => {
    menuItems.forEach(item => {
      loadAdicionales(item.id)
    })
  }, [menuItems, loadAdicionales])

  // Toggle expandir/colapsar
  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
        loadAdicionales(id)
      }
      return newSet
    })
  }

  // Callback cuando se modifican adicionales desde el modal
  const handleAdicionalesChange = (menuId: number) => {
    loadAdicionales(menuId, true)
  }

  // Eliminar un adicional
  const handleDeleteAdicional = async (menuId: number, adicionalId: number) => {
    try {
      await adicionalService.deleteMenuAdicional(menuId, adicionalId)
      setAdicionalesData(prev => ({
        ...prev,
        [menuId]: prev[menuId]?.filter(a => a.id !== adicionalId) || []
      }))
      toast({
        title: "Éxito",
        description: "Adicional eliminado correctamente",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el adicional",
        variant: "destructive",
      })
    }
  }

  // Filtrar productos según la búsqueda
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems

    const query = searchQuery.toLowerCase()
    return menuItems.filter(
      (item) =>
        item.titulo.toLowerCase().includes(query) ||
        item.descripcion.toLowerCase().includes(query) ||
        item.precio.toString().includes(query)
    )
  }, [menuItems, searchQuery])

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="h-8 w-8 animate-spin text-red-600 dark:text-gray-200 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
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
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar productos por nombre, descripción o precio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
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

      {/* Lista de productos con sección expandible */}
      <div className="space-y-3">
        {filteredMenuItems.map((item) => {
          const isExpanded = expandedItems.has(item.id)
          const itemAdicionales = adicionalesData[item.id] || []
          const isLoadingItem = loadingAdicionales.has(item.id)

          return (
            <Card key={item.id} className="overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 transition-colors">
              {/* Contenido principal del producto */}
              <div className="flex items-center gap-4 p-4">
                {/* Imagen */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={item.foto || "/placeholder.svg?height=80&width=80"}
                    alt={item.titulo}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info del producto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.titulo}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.descripcion}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-200">S/ {formatPrice(item.precio)}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        itemAdicionales.length > 0 ? 'text-brand-600 border-brand-300' : 'text-gray-500 border-gray-300'
                      }`}
                      onClick={() => toggleExpanded(item.id)}
                    >
                      <ListPlus className="h-3 w-3" />
                      {itemAdicionales.length} adicionales
                    </Badge>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Botón expandir adicionales */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpanded(item.id)}
                    className="gap-1"
                  >
                    <ListPlus className="h-4 w-4" />
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                              {deletingId === item.id ? "Eliminando..." : "Sí, eliminar producto"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Sección expandible de adicionales */}
              <Collapsible open={isExpanded}>
                <CollapsibleContent>
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <ListPlus className="h-4 w-4" />
                        Adicionales de este producto
                      </h4>
                      <ManageProductAdicionalesModal
                        menuItem={item}
                        onAdicionalesChange={() => handleAdicionalesChange(item.id)}
                        trigger={
                          <Button variant="outline" size="sm" className="gap-1">
                            <Plus className="h-3 w-3" />
                            Gestionar adicionales
                          </Button>
                        }
                      />
                    </div>

                    {isLoadingItem ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Cargando adicionales...</span>
                      </div>
                    ) : itemAdicionales.length === 0 ? (
                      <div className="text-center py-4 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                        <ListPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No hay adicionales para este producto</p>
                        <ManageProductAdicionalesModal
                          menuItem={item}
                          onAdicionalesChange={() => handleAdicionalesChange(item.id)}
                          trigger={
                            <Button variant="link" size="sm" className="text-brand-600 mt-1">
                              Crear adicionales
                            </Button>
                          }
                        />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {itemAdicionales.map((adicional) => (
                          <div
                            key={adicional.id}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {adicional.titulo}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                S/ {formatPrice(adicional.precio)}
                              </p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar adicional?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Se eliminará el adicional &quot;{adicional.titulo}&quot; de este producto.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteAdicional(item.id, adicional.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

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
