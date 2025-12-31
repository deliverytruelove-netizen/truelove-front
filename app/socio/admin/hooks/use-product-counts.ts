"use client"

import { useMemo } from "react"
import type { Category, MenuItem } from "../services/menu.service"

export function useProductCounts(categories: Category[], menuItems: MenuItem[]) {
  return useMemo(() => {
    const productCounts: Record<number, number> = {}

    // Inicializar todos los contadores a 0
    categories.forEach((category) => {
      productCounts[category.id] = 0
    })

    // Contar productos por categoría
    menuItems.forEach((menu) => {
      const categoryId = Number(menu.categoria_id)
      
      if (productCounts.hasOwnProperty(categoryId)) {
        productCounts[categoryId]++
      } else if (menu.categoria_id) {
        // Solo mostrar advertencia si el producto tiene una categoría que no existe
        console.warn(`⚠️ Producto "${menu.titulo}" (ID: ${menu.id}) tiene categoria_id: ${categoryId} que no existe`);
      }
    })

    console.log("📊 Contadores de productos por categoría:", productCounts);
    return productCounts
  }, [categories, menuItems])
}