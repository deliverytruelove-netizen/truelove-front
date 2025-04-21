// app\admin\dashboard\components\approval-chart.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface ApprovalChartProps {
  title: string
  data: {
    pendientes: number
    aprobados: number
    rechazados: number
  }
}

export function ApprovalChart({ title, data }: ApprovalChartProps) {
  const chartData = [
    { name: "Pendientes", value: data.pendientes, color: "#FBBF24" },
    { name: "Aprobados", value: data.aprobados, color: "#10B981" },
    { name: "Rechazados", value: data.rechazados, color: "#EF4444" },
  ].filter((item) => item.value > 0)

  // Si solo hay datos pendientes, asegurarse de que se muestre correctamente
  if (chartData.length === 1 && chartData[0].name === "Pendientes") {
    chartData[0].name = "Pendientes 100%"
  }

  return (
    <Card className="col-span-1 h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-0 pr-0 pt-0">
        <div className="h-[180px] sm:h-[200px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name }) => name}
                  // Eliminar el borde negro al hacer clic
                  activeShape={undefined}
                  // Desactivar el efecto de clic
                  isAnimationActive={true}
                  activeIndex={[]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} registros`, ""]} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
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
