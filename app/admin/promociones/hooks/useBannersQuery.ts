// app\admin\promociones\hooks\useBannersQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBanners, createBanner, updateBanner, deleteBanner } from "../services/banner.service"
import { useToast } from "@/hooks/use-toast"
import { useCallback, useEffect } from "react"
// import type { Banner } from "../types/banner.types"

// Clave para la query de banners
const BANNERS_QUERY_KEY = "banners"

// Hook para obtener banners con paginación
export function useBannersQuery(page = 1, limit = 10, search = "", showAll = true) {
    const { toast } = useToast()
    
    const result = useQuery({
      queryKey: [BANNERS_QUERY_KEY, page, limit, search, showAll],
      queryFn: () => getBanners(page, limit, search, showAll),
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      placeholderData: (previousData) => previousData,
    })
  
    // Mostrar el toast de error cuando isError cambie a true
    useEffect(() => {
      if (result.isError) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los banners",
          variant: "destructive",
        })
      }
    }, [result.isError, toast])
  
    return result
  }

// Hook para mutaciones (crear, actualizar, eliminar)
export function useBannerMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Mutación para crear un banner
  const createBannerMutation = useMutation({
    mutationFn: (formData: FormData) => createBanner(formData),
    onSuccess: () => {
      // Invalidar queries para forzar una recarga
      queryClient.invalidateQueries({ queryKey: [BANNERS_QUERY_KEY] })
      
      toast({
        title: "Éxito",
        description: "Banner creado correctamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un problema al crear el banner",
        variant: "destructive",
      })
    },
  })

  // Mutación para actualizar un banner
  const updateBannerMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => 
      updateBanner(id, formData),
    onSuccess: () => {
      // Actualizar la caché de React Query
      queryClient.invalidateQueries({ queryKey: [BANNERS_QUERY_KEY] })
      
      toast({
        title: "Éxito",
        description: "Banner actualizado correctamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el banner",
        variant: "destructive",
      })
    },
  })

  // Mutación para eliminar un banner
  const deleteBannerMutation = useMutation({
    mutationFn: (id: number) => deleteBanner(id),
    onSuccess: () => {
      // Invalidar queries para forzar una recarga
      queryClient.invalidateQueries({ queryKey: [BANNERS_QUERY_KEY] })
      
      toast({
        title: "Éxito",
        description: "Banner eliminado correctamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el banner",
        variant: "destructive",
      })
    },
  })

  return {
    createBanner: createBannerMutation.mutateAsync,
    updateBanner: updateBannerMutation.mutateAsync,
    deleteBanner: deleteBannerMutation.mutateAsync,
    isCreating: createBannerMutation.isPending,
    isUpdating: updateBannerMutation.isPending,
    isDeleting: deleteBannerMutation.isPending,
  }
}

// Hook para formatear URLs de imágenes
export function useImageFormatter() {
  return useCallback((imageUrl: string | undefined | File): string => {
    if (!imageUrl || imageUrl instanceof File) {
      return "/placeholder.svg"
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    if (imageUrl.startsWith("/storage/")) {
      return imageUrl
    }

    return `/storage/${imageUrl}`
  }, [])
}