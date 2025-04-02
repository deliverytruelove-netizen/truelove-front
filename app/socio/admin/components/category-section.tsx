"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { CategoryDialog } from "./category-dialog"
import type { Category, MenuItem } from "../services/menu.service"

interface CategorySectionProps {
  category: Category
  menuItems: MenuItem[]
  onEditCategory: (id: number, nombre: string) => Promise<void>
  onStatusChange: (id: number, newStatus: string) => Promise<void>
}

export function CategorySection({ category, menuItems, onEditCategory, onStatusChange }: CategorySectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{category.nombre}</CardTitle>
        <CategoryDialog
          category={category}
          onSubmit={(nombre) => onEditCategory(category.id, nombre)}
          trigger={
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="aspect-square relative mb-3">
                  <Image
                    src={item.foto || "/placeholder.svg"}
                    alt={item.titulo}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{item.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                    <p className="mt-1 font-medium">S/ {item.precio.toFixed(2)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onStatusChange(item.id, "active")}>Activar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange(item.id, "inactive")}>
                        Desactivar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange(item.id, "out-of-stock")}>
                        Agotado
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

