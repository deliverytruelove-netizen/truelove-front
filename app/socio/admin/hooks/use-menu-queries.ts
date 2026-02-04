"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { menuService, type Category, type MenuItem, type HorarioDia } from "../services/menu.service"
import { useToast } from "@/hooks/use-toast"

// Keys para las queries
export const menuQueryKeys = {
  categories: ["categories"] as const,
  menus: ["menus"] as const,
  menusByCategory: (categoryId: string) => ["menus", "category", categoryId] as const,
}

// Hook para obtener categorías
export function useCategories() {
  return useQuery({
    queryKey: menuQueryKeys.categories,
    queryFn: async () => {
      const response = await menuService.getCategories()
      console.log("Categorías cargadas:", response.data);
      return response.data || []
    },
  })
}

// Hook para obtener todos los menús
export function useMenus() {
  return useQuery({
    queryKey: menuQueryKeys.menus,
    queryFn: async () => {
      const menus = await menuService.getMenus()
      console.log("Menús cargados:", menus);
      return menus
    },
  })
}

// Hook para crear categoría
export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: { nombre: string; horarios?: HorarioDia[] | null }) => menuService.createCategory(data),
    onSuccess: (response) => {
      // Actualizar el cache de categorías
      if (response?.data) {
        queryClient.setQueryData<Category[]>(menuQueryKeys.categories, (old = []) => [...old, response.data!])
      } else {
        // Solo invalidar si no tenemos los datos exactos
        queryClient.invalidateQueries({ queryKey: menuQueryKeys.categories })
      }

      toast({
        title: "Éxito",
        description: "Categoría creada correctamente",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la categoría",
        variant: "destructive",
      })
    },
  })
}

// Hook para actualizar categoría
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, nombre, horarios }: { id: number; nombre: string; horarios?: HorarioDia[] | null }) =>
      menuService.updateCategory(id.toString(), { nombre, horarios }),
    onSuccess: (_, variables) => {
      // Actualizar el cache directamente
      queryClient.setQueryData<Category[]>(menuQueryKeys.categories, (old = []) =>
        old.map((category) => (category.id === variables.id ? { ...category, nombre: variables.nombre, horarios: variables.horarios } : category)),
      )

      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la categoría",
        variant: "destructive",
      })

      // En caso de error, recargar datos
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.categories })
    },
  })
}

// Hook para eliminar categoría
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: number) => menuService.deleteCategory(id.toString()),
    onSuccess: (_, categoryId) => {
      // Actualizar el cache eliminando la categoría
      queryClient.setQueryData<Category[]>(menuQueryKeys.categories, (old = []) =>
        old.filter((category) => category.id !== categoryId),
      )

      // También actualizar los menús eliminando los de esa categoría
      queryClient.setQueryData<MenuItem[]>(menuQueryKeys.menus, (old = []) =>
        old.filter((item) => Number(item.categoria_id) !== categoryId),
      )

      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la categoría",
        variant: "destructive",
      })

      // En caso de error, recargar datos
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.categories })
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.menus })
    },
  })
}

// Hook para crear menú/producto
export function useCreateMenu() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: menuService.createMenu,
    onSuccess: (response) => {
      // Si tenemos los datos del nuevo producto, actualizamos el cache
      if (response?.data) {
        queryClient.setQueryData<MenuItem[]>(menuQueryKeys.menus, (old = []) => [...old, response.data!])
      } else {
        // Solo invalidar los menús si no tenemos datos exactos
        queryClient.invalidateQueries({ queryKey: menuQueryKeys.menus })
      }

      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el producto",
        variant: "destructive",
      })
    },
  })
}