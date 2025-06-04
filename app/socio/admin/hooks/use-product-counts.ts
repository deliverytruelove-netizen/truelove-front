"use client"

import { useMemo } from "react"
import type { Category, MenuItem } from "../services/menu.service"

export function useProductCounts(categories: Category[], menuItems: MenuItem[]) {
  return useMemo(() => {
    const productCounts: Record<number, number> = {}
    
    console.log("Calculando contadores con:", { categories, menuItems });

    // Inicializar todos los contadores a 0
    categories.forEach((category) => {
      productCounts[category.id] = 0
    })

    // Contar productos por categoría
    menuItems.forEach((menu) => {
      const categoryId = Number(menu.categoria_id)
      console.log(`Producto ${menu.id} (${menu.titulo}) - Categoría: ${categoryId}`);
      
      if (productCounts.hasOwnProperty(categoryId)) {
        productCounts[categoryId]++
      }
    })

    console.log("Contadores calculados:", productCounts);
    return productCounts
  }, [categories, menuItems])
}