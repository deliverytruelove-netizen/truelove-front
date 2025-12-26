// app\admin\dashboard\components\stat-card.tsx
import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate">{title}</CardTitle>
        <div className="h-5 w-5 text-muted-foreground shrink-0">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
        {trend && (
          <div className="flex items-center text-xs mt-1">
            <span className={cn("mr-1", trend.isPositive ? "text-green-500" : "text-destructive")}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground truncate">desde el mes pasado</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
