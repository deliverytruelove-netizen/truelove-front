"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface BusinessTypesChartProps {
  data: Record<string, number>
}

export function BusinessTypesChart({ data }: BusinessTypesChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <Card className="col-span-full lg:col-span-2 h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Tipos de Negocio</CardTitle>
      </CardHeader>
      <CardContent className="pl-0 pr-4">
        <div className="h-[250px] sm:h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 60,
                }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} interval={0} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => value.toString()} />
                <Tooltip formatter={(value) => [`${value} socios`, ""]} contentStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="value"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  // Eliminar el borde negro al hacer clic
                  activeBar={{ stroke: "none" }}
                />
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
