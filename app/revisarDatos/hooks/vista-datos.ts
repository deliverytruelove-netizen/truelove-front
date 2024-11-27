import { useState, useCallback } from 'react'
import type { ReviewData } from '../types/review-data'
import { useToast } from '@/hooks/use-toast'

export function useReviewData() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReviewData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (
    negocioId: string,
    establecimientoId: string,
    datosClaveId: string,
    datosBancariosId: string
  ) => {
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_WEB}/revisarDatos`)
      url.searchParams.append('negocioId', negocioId)
      url.searchParams.append('establecimientoId', establecimientoId)
      url.searchParams.append('datosClaveId', datosClaveId)
      url.searchParams.append('datosBancariosId', datosBancariosId)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar los datos')
      }

      const jsonData = await response.json()
      setData(jsonData)
      setError(null)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('No se pudieron cargar los datos. Por favor, intenta de nuevo.')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al cargar los datos',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  return { 
    data, 
    loading, 
    error, 
    fetchData,
    setError,
    setLoading 
  }
}

