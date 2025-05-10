// app\admin\metodo-pago\hooks\use-metodos-pago.ts
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { MetodoPago, ApiError } from "../types/metodo-pago.types"
import { useToast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_WEB || ""
const METODOS_PAGO_KEY = "metodosPago"

// Función para obtener el token
const getToken = () => {
  const token = localStorage.getItem("authToken")
  if (!token) throw new Error("No token found")
  return token
}

// Función para obtener métodos de pago
const fetchMetodosPago = async (): Promise<MetodoPago[]> => {
  const token = getToken()

  const response = await fetch(`${API_URL}/get/medios/pago`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error al cargar métodos de pago")
  }

  return response.json()
}

// Función para crear método de pago
const createMetodoPago = async (metodoPago: MetodoPago): Promise<MetodoPago> => {
  const token = getToken()

  const response = await fetch(`${API_URL}/medios/pago`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metodoPago),
  })

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 422 && data.errors) {
      const error = new Error("Error de validación") as ApiError
      error.validationErrors = data.errors
      throw error
    }
    throw new Error("Error al crear método de pago")
  }

  return data
}

// Función para actualizar método de pago
const updateMetodoPago = async ({
  id,
  data,
}: {
  id: number
  data: MetodoPago
}): Promise<MetodoPago> => {
  const token = getToken()

  const response = await fetch(`${API_URL}/medios/pago/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const responseData = await response.json()

  if (!response.ok) {
    if (response.status === 422 && responseData.errors) {
      const error = new Error("Error de validación") as ApiError
      error.validationErrors = responseData.errors
      throw error
    }
    throw new Error("Error al actualizar método de pago")
  }

  return responseData
}

// Función para eliminar método de pago
const deleteMetodoPago = async (id: number): Promise<void> => {
  const token = getToken()

  const response = await fetch(`${API_URL}/medios/pago/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error al eliminar método de pago")
  }
}

export function useMetodosPagoQuery() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query para obtener métodos de pago - Corregida para TanStack Query
  const metodosPagoQuery = useQuery({
    queryKey: [METODOS_PAGO_KEY],
    queryFn: fetchMetodosPago,
  })

  // Manejo de errores separado
  if (metodosPagoQuery.isError) {
    toast({
      title: "Error",
      description: "No se pudieron cargar los métodos de pago",
      variant: "destructive",
    })
  }

  // Mutación para crear método de pago
  const createMutation = useMutation({
    mutationFn: createMetodoPago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [METODOS_PAGO_KEY] })
      toast({
        title: "Éxito",
        description: "Método de pago creado correctamente",
      })
    },
    onError: (error: ApiError) => {
      if (!error.validationErrors) {
        toast({
          title: "Error",
          description: "Hubo un problema al crear el método de pago",
          variant: "destructive",
        })
      }
    },
  })

  // Mutación para actualizar método de pago
  const updateMutation = useMutation({
    mutationFn: updateMetodoPago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [METODOS_PAGO_KEY] })
      toast({
        title: "Éxito",
        description: "Método de pago actualizado correctamente",
      })
    },
    onError: (error: ApiError) => {
      if (!error.validationErrors) {
        toast({
          title: "Error",
          description: "Hubo un problema al actualizar el método de pago",
          variant: "destructive",
        })
      }
    },
  })

  // Mutación para eliminar método de pago
  const deleteMutation = useMutation({
    mutationFn: deleteMetodoPago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [METODOS_PAGO_KEY] })
      toast({
        title: "Éxito",
        description: "Método de pago eliminado correctamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el método de pago",
        variant: "destructive",
      })
    },
  })

  return {
    metodosPago: metodosPagoQuery.data || [],
    isLoading: metodosPagoQuery.isLoading,
    isError: metodosPagoQuery.isError,
    refetch: metodosPagoQuery.refetch,
    createMetodoPago: createMutation.mutateAsync,
    updateMetodoPago: (id: number, data: MetodoPago) => updateMutation.mutateAsync({ id, data }),
    deleteMetodoPago: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}