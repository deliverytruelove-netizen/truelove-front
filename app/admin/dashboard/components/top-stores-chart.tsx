// app/admin/dashboard/components/top-stores-chart.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { Store } from 'lucide-react'
import type { TopStore } from "../services/rankings.service"
import Image from "next/image"
import { LocalRatingsDetail } from "./local-ratings-detail"

interface TopStoresChartProps {
  data: TopStore[]
}

export function TopStoresChart({ data }: TopStoresChartProps) {
  const [selectedLocalId, setSelectedLocalId] = useState<number | null>(null)

  // Limitar a los 5 mejores locales y ordenar por total_pedidos
  const chartData = [...data]
    .sort((a, b) => b.total_pedidos - a.total_pedidos)
    .slice(0, 5)
    .map(store => ({
      name: store.nombre,
      value: store.total_pedidos,
      logo: store.logo,
      rating: store.puntuacion,
      id: store.id,
    }))

  const handleBarClick = (data: { id: number }) => {
    setSelectedLocalId(data.id)
  }

  const handleCloseDetails = () => {
    setSelectedLocalId(null)
  }

  return (
    <div className="col-span-1 space-y-4">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Store className="h-5 w-5" />
            Locales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{
                    top: 15,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 'dataMax']} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} pedidos`, "Total"]}
                    labelFormatter={(name) => `Local: ${name}`}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-md p-2 shadow-md">
                            <div className="flex items-center gap-2 mb-1">
                              {data.logo ? (
                                <Image 
                                  src={data.logo || "/placeholder.svg"} 
                                  alt={data.name} 
                                  width={20} 
                                  height={20} 
                                  className="rounded-full"
                                />
                              ) : (
                                <Store className="h-4 w-4" />
                              )}
                              <p className="font-medium">{data.name}</p>
                            </div>
                            <p className="text-sm">{data.value} pedidos</p>
                            {data.rating !== undefined && (
                              <p className="text-sm">
                                Calificación: {Number(data.rating).toFixed(1)} ⭐
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Haz clic para ver detalles
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#ef4444" 
                    radius={[0, 4, 4, 0]}
                    barSize={30}
                    onClick={handleBarClick}
                    cursor="pointer"
                    // Eliminar el borde negro al hacer clic
                    activeBar={{ stroke: "none" }}
                  >
                    <LabelList dataKey="value" position="right" formatter={(value : number) => `${value}`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedLocalId && (
        <LocalRatingsDetail 
          localId={selectedLocalId} 
          onClose={handleCloseDetails} 
        />
      )}
    </div>
  )
}