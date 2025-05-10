// app\admin\promociones\hooks\useBanners.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { getBanners, createBanner, updateBanner, deleteBanner } from "../services/banner.service"
import type { Banner } from "../types/banner.types"

export function useBanners() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
      page: 1,
      limit: 10,
      total: 0
    });
    const { toast } = useToast();

  // Función para formatear correctamente la URL de la imagen
  const formatImageUrl = useCallback((imageUrl: string | undefined | File): string => {
    if (!imageUrl || imageUrl instanceof File) {
      return "/placeholder.svg"
    }

    // Si la URL ya comienza con http:// o https://, devolverla tal cual
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    // Si la URL ya comienza con /storage/, devolverla tal cual
    if (imageUrl.startsWith("/storage/")) {
      return imageUrl
    }

    // Si la URL comienza con banners/ o cualquier otra ruta relativa,
    // añadir el prefijo /storage/
    return `/storage/${imageUrl}`
  }, [])

  const loadBanners = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    try {
      setIsLoading(true);
      const { data, total } = await getBanners(page, limit);
      setBanners(data);
      setPagination(prev => ({ ...prev, page, total }));
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los banners",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, toast]);
  // Función para añadir un banner sin recargar toda la lista
  const addBannerToList = useCallback((newBanner: Banner) => {
    setBanners(prev => {
      // Si estamos en la primera página, añadir al principio
      if (pagination.page === 1) {
        return [newBanner, ...prev.slice(0, pagination.limit - 1)];
      }
      return prev; // En otras páginas, no modificamos la lista actual
    });
    // Incrementar el total
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  }, [pagination.page, pagination.limit]);

  // Función para actualizar un banner específico
  const updateBannerInList = useCallback((updatedBanner: Banner) => {
    setBanners(prev => 
      prev.map(b => b.id === updatedBanner.id ? updatedBanner : b)
    );
  }, []);
  const handleDelete = useCallback(
    async (id: number) => {
      if (confirm("¿Estás seguro de que deseas eliminar este banner?")) {
        try {
          setIsLoading(true)
          await deleteBanner(id)
          toast({
            title: "Éxito",
            description: "Banner eliminado correctamente",
          })
          loadBanners()
        } catch  {
          toast({
            title: "Error",
            description: "No se pudo eliminar el banner",
            variant: "destructive",
          })
       
        } finally {
          setIsLoading(false)
        }
      }
    },
    [loadBanners, toast],
  )
  const searchBanners = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      const { data, total } = await getBanners(1, pagination.limit, query);
      setBanners(data);
      setPagination(prev => ({ ...prev, page: 1, total }));
    } catch {
      toast({
        title: "Error",
        description: "Error al buscar banners",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, toast]);

  useEffect(() => {
    loadBanners()
  }, [loadBanners])

  return {
    banners,
    isLoading,
    pagination,
    loadBanners,
    createBanner: async (formData: FormData) => {
      const newBanner = await createBanner(formData);
      addBannerToList(newBanner);
      return newBanner;
    },
    updateBanner: async (id: number, formData: FormData) => {
      const updatedBanner = await updateBanner(id, formData);
      updateBannerInList(updatedBanner);
      return updatedBanner;
    },
    deleteBanner: handleDelete,
    formatImageUrl,
    setPage: (page: number) => loadBanners(page, pagination.limit),
    searchBanners
  };
}
