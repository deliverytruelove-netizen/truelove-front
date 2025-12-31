// app\socio\admin\components\products-list.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, MoreVertical, ShoppingBag, Trash2, Search } from "lucide-react"
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
import { useState, useMemo } from "react"

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
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Activo</Badge>
      case "inactive":
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-white">Inactivo</Badge>
      case "out-of-stock":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Agotado</Badge>
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

  // Manejar el cambio de estado del dropdown
  const handleDropdownOpenChange = (id: number, open: boolean) => {
    setOpenDropdownId(open ? id : null)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="h-8 w-8 animate-spin text-red-600 dark:text-gray-200 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
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
            <span>
              Mostrando {filteredMenuItems.length} de {menuItems.length} productos
            </span>
          )}
        </div>
      )}

      {/* Grid de productos - Responsivo */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMenuItems.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden border border-gray-200 dark:bg-gray-800 hover:border-red-200 transition-colors flex flex-col"
          >
            {/* Imagen del producto */}
            <div className="aspect-square relative dark:text-bg-gray-800 dark:text-gray-200">
              <Image
                src={item.foto || "/placeholder.svg?height=300&width=300"}
                alt={item.titulo}
                fill
                className="object-cover dark:text-gray-200"
              />
              <div className="absolute top-2 right-2 dark:text-gray-200">{getStatusBadge(item.status)}</div>
            </div>

            {/* Contenido del producto */}
            <CardContent className="p-3 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2 flex-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm dark:text-gray-200 truncate">{item.titulo}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 h-8 dark:text-gray-400">{item.descripcion}</p>
                  <div className="mt-1 flex items-center">
                    <p className="font-semibold text-gray-900 text-sm dark:text-gray-200">S/ {formatPrice(item.precio)}</p>
                  </div>
                </div>

                {/* Menú de opciones */}
                <DropdownMenu
                  open={openDropdownId === item.id}
                  onOpenChange={(open) => handleDropdownOpenChange(item.id, open)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Opciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="text-green-600 focus:text-green-600 focus:bg-green-50"
                      onClick={() => {
                        onStatusChange(item.id, "active")
                        setOpenDropdownId(null)
                      }}
                    >
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Activar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-600 focus:text-gray-600 focus:bg-gray-50"
                      onClick={() => {
                        onStatusChange(item.id, "inactive")
                        setOpenDropdownId(null)
                      }}
                    >
                      <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                      Desactivar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                      onClick={() => {
                        onStatusChange(item.id, "out-of-stock")
                        setOpenDropdownId(null)
                      }}
                    >
                      <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                      Agotado
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <EditMenuModal
                      menuItem={item}
                      categories={categories}
                      onSubmit={async (id, formData) => {
                        await onEditMenu(id, formData)
                        setOpenDropdownId(null)
                      }}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-gray-50">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar producto
                        </DropdownMenuItem>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
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
                            onClick={() => {
                              handleDelete(item.id)
                              setOpenDropdownId(null)
                            }}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje cuando no hay resultados de búsqueda */}
      {searchQuery && filteredMenuItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300">
          <Search className="h-12 w-12 text-gray-400 dark:text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontraron productos</p>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-200">
            Intenta con otros términos de búsqueda
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="mt-4"
          >
            Limpiar búsqueda
          </Button>
        </div>
      )}
    </div>
  )
}