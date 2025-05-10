// app/admin/dashboard/components/local-ratings-detail.tsx
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Star } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface LocalRatingsDetailProps {
  localId: number
  onClose?: () => void
}

interface RatingData {
  id: number
  ratingCounts: { star: number; count: number }[]
  ratingsByDate: { date: string; count: number }[]
  totalRatings: number
}

export function LocalRatingsDetail({ localId, onClose }: LocalRatingsDetailProps) {
  const [data, setData] = useState<RatingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const API_URL = process.env.NEXT_PUBLIC_API_WEB

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) {
          throw new Error("No se encontró el token de autenticación")
        }

        const response = await axios.get(API_URL + `/reviews/${localId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        
        setData(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error al obtener datos de calificaciones:", error)
        setError("Error al cargar los datos")
        setLoading(false)
      }
    }

    fetchData()
  }, [localId, API_URL])

  if (loading) return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  )
  
  if (error) return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </CardContent>
    </Card>
  )
  
  if (!data) return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">
          <p>No hay datos disponibles para este local</p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Estadísticas de Calificaciones
        </CardTitle>
        {onClose && (
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="sr-only">Cerrar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stars">
          <TabsList className="mb-4">
            <TabsTrigger value="stars">Por Estrellas</TabsTrigger>
            <TabsTrigger value="dates">Por Fechas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stars">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.ratingCounts}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="star" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} calificaciones`, "Cantidad"]}
                    labelFormatter={(star) => `${star} estrellas`}
                  />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="dates">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.ratingsByDate}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} calificaciones`, "Cantidad"]}
                    labelFormatter={(date) => `Fecha: ${date}`}
                  />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Total de calificaciones: {data.totalRatings}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}