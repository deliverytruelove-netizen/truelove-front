"use client"

import { ChevronDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import type { Category, MenuItem } from "../services/menu.service"
import { CategoryDialog } from "./category-dialog"

interface CategorySectionProps {
  category: Category
  menuItems: MenuItem[]
  onEditCategory: (id: number, nombre: string) => Promise<void>
  onStatusChange: (id: number, status: string) => Promise<void>
}

export function CategorySection({ category, menuItems, onEditCategory, onStatusChange }: CategorySectionProps) {
  // Add debug logging
  console.log(
    `Renderizando categoría ${category.id} (${category.nombre}) con ${menuItems.length} menús:`,
    menuItems.map((m) => ({ id: m.id, titulo: m.titulo, categoria_id: m.categoria_id })),
  )

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between p-4 flex-wrap gap-4">
        <div className="flex items-center space-x-4 flex-wrap">
          <ChevronDown className="h-4 w-4 shrink-0" />
          <h3 className="font-medium">{category.nombre}</h3>
          <CategoryDialog
            category={category}
            onSubmit={(nombre) => onEditCategory(category.id, nombre)}
            trigger={<button className="text-red-500 text-sm whitespace-nowrap">Editar sección</button>}
          />
        </div>
      </div>

      <div className="border-t p-4">
        {menuItems.length === 0 ? (
          <p className="text-center text-gray-500">No hay productos en esta categoría</p>
        ) : (
          <div className="grid gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {item.foto ? (
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                      <Image
                        src={item.foto || "/placeholder.svg"}
                        alt={item.titulo}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="font-medium">{item.titulo}</h4>
                    <p className="text-sm text-gray-500">{item.descripcion}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 ml-20 sm:ml-0">
                  <span className="text-lg font-semibold">
                    {new Intl.NumberFormat("es-NI", {
                      style: "currency",
                      currency: "NIO",
                    }).format(item.precio)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.status === "active"}
                      onCheckedChange={(checked) => onStatusChange(item.id, checked ? "active" : "inactive")}
                    />
                    <span className={`text-sm ${item.status === "active" ? "text-green-600" : "text-red-600"}`}>
                      {item.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

