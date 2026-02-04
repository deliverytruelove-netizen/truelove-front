// app\socio\admin\components\category-section.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, MoreVertical, Tag, DollarSign, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { CategoryDialog } from "./category-dialog"
import { Badge } from "@/components/ui/badge"
import type { Category, MenuItem, HorarioDia } from "../services/menu.service"
import { useState } from "react"

interface CategoryFormData {
  nombre: string
  horarios?: HorarioDia[] | null
}

interface CategorySectionProps {
  category: Category
  menuItems: MenuItem[]
  onEditCategory: (id: number, data: CategoryFormData) => Promise<void>
  onDeleteCategory: (id: number) => Promise<void>
  onStatusChange: (id: number, newStatus: string) => Promise<void>
}

export function CategorySection({
  category,
  menuItems,
  onEditCategory,
  onDeleteCategory,
  onStatusChange,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
      case "inactive":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Inactivo</Badge>
      case "out-of-stock":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Agotado</Badge>
      default:
        return null
    }
  }

  // Función para formatear el precio correctamente
  const formatPrice = (price: number | string): string => {
    // Si es un string, intentar convertirlo a número
    if (typeof price === "string") {
      const numPrice = Number.parseFloat(price)
      if (!isNaN(numPrice)) {
        return numPrice.toFixed(2)
      }
      return price // Si no se puede convertir, devolver el string original
    }
    // Si ya es un número
    return price.toFixed(2)
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader
        className="flex flex-row items-center justify-between bg-gray-50 border-b border-gray-100 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg font-medium text-gray-800">
            {category.nombre}
            <span className="ml-2 text-sm text-gray-500">
              ({menuItems.length} {menuItems.length === 1 ? "producto" : "productos"})
            </span>
          </CardTitle>
        </div>
        <div className="flex items-center">
          <CategoryDialog
            category={category}
            onSubmit={(data) => onEditCategory(category.id, data)}
            onDelete={() => onDeleteCategory(category.id)}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit className="h-4 w-4 text-gray-600" />
                <span className="sr-only">Editar categoría</span>
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {isExpanded ? "Ocultar" : "Mostrar"}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4">
          {menuItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay productos en esta categoría</p>
              <p className="text-sm text-gray-400 mt-1">Agrega productos usando el botón Nuevo producto</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border border-gray-200 hover:border-red-200 transition-colors"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={item.foto || "/placeholder.svg?height=300&width=300"}
                      alt={item.titulo}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">{getStatusBadge(item.status)}</div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.titulo}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 h-10">{item.descripcion}</p>
                        <div className="mt-2 flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          <p className="font-semibold text-gray-900">S/ {formatPrice(item.precio)}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
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
                          <DropdownMenuItem
                            className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                            onClick={() => onStatusChange(item.id, "out-of-stock")}
                          >
                            <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                            Agotado
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="focus:bg-gray-50">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar producto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

