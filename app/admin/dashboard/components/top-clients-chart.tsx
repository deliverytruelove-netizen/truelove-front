// app/admin/dashboard/components/top-clients-chart.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { User } from 'lucide-react'
import type { TopClient } from "../services/rankings.service"

interface TopClientsChartProps {
  data: TopClient[]
}

export function TopClientsChart({ data }: TopClientsChartProps) {
  // Limitar a los 5 mejores clientes y ordenar por total_pedidos
  const chartData = [...data]
    .sort((a, b) => b.total_pedidos - a.total_pedidos)
    .slice(0, 5)
    .map(client => ({
      name: client.nombre,
      value: client.total_pedidos,
    }))

  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Clientes con mas pedidos
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
                  labelFormatter={(name) => `Cliente: ${name}`}
                />
                <Bar 
                  dataKey="value" 
                  fill="#ef4444" 
                  radius={[0, 4, 4, 0] as [number, number, number, number]}
                  barSize={30}
                  activeBar={{ stroke: "none" } as { stroke: string }}
                >
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    formatter={(value: number) => `${value}`} 
                  />
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
  )
}