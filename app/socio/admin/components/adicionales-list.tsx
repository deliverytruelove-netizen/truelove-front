"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, MoreVertical, DollarSign, ShoppingBag, Trash2, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { Adicional, Menu } from "../services/adicional.service"
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
import { useState } from "react"
import { EditAdicionalModal } from "./edit-adicional-modal"

interface AdicionalesListProps {
  adicionales: Adicional[]
  menus: Menu[]
  onStatusChange: (id: number, newStatus: string) => Promise<void>
  onEditAdicional: (id: number, formData: FormData) => Promise<void>
  onDeleteAdicional: (id: number) => Promise<void>
  loading: boolean
}

export function AdicionalesList({
  adicionales,
  menus,
  onStatusChange,
  onEditAdicional,
  onDeleteAdicional,
  loading,
}: AdicionalesListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600 text-xs">Activo</Badge>
      case "inactive":
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-xs">Inactivo</Badge>
      default:
        return null
    }
  }

  // Función para formatear el precio correctamente
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

  // Obtener nombre del producto/menú
  const getMenuName = (adicional: Adicional): string => {
    // Primero intentar obtener del objeto menu incluido
    if (adicional.menu?.titulo) {
      return adicional.menu.titulo
    }
    // Si no, buscar en la lista de menús
    const menu = menus.find(m => m.id === adicional.menu_id)
    return menu?.titulo || "Sin producto"
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await onDeleteAdicional(id)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
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

  if (adicionales.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No hay adicionales creados</p>
        <p className="text-sm text-gray-500 mt-1">Crea adicionales usando el botón &quot;Nuevo adicional&quot;</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {adicionales.map((item) => (
        <Card key={item.id} className="overflow-hidden border border-gray-200 hover:border-red-200 transition-colors">
          {/* Imagen más pequeña con aspect ratio 4:3 */}
          <div className="aspect-[4/3] relative">
            <Image
              src={item.foto || "/placeholder.svg?height=150&width=200"}
              alt={item.titulo}
              fill
              className="object-cover"
            />
            <div className="absolute top-1.5 right-1.5">{getStatusBadge(item.status)}</div>
          </div>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 text-sm truncate">{item.titulo}</h3>
                
                {/* Producto asociado */}
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <Package className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{getMenuName(item)}</span>
                </div>
                
                {/* Precio */}
                <div className="mt-1.5 flex items-center">
                  <DollarSign className="h-3.5 w-3.5 text-green-600 mr-0.5" />
                  <p className="font-semibold text-gray-900 text-sm">S/ {formatPrice(item.precio)}</p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-100 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Opciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                    onClick={() => onStatusChange(item.id, "active")}
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Activar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-gray-600 focus:text-gray-600 focus:bg-gray-50"
                    onClick={() => onStatusChange(item.id, "inactive")}
                  >
                    <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                    Desactivar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <EditAdicionalModal
                    adicional={item}
                    menus={menus}
                    onSubmit={onEditAdicional}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-gray-50">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar adicional
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
                        Eliminar adicional
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <div className="flex flex-col gap-2">
                            <div>Esta acción no se puede deshacer. Se eliminará permanentemente el adicional:</div>
                            <div className="font-semibold text-red-600">{item.titulo}</div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item.id)}
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
